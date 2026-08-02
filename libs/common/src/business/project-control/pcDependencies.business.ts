import { Injectable } from '@nestjs/common';
import {
  PCBacklogItemsRepository,
  PCProjectMembersRepository,
  PCTaskDependenciesRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCDependencyType } from '@prisma/client';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCHistoryBusiness } from './pcHistory.business';
import {
  PCGraphDependency,
  PCGraphTask,
  PCPlanningEngine,
} from './engines/pcPlanning.engine';

@Injectable()
export class PCDependenciesBusiness extends ResponseClass {
  private readonly engine = new PCPlanningEngine();

  constructor(
    private readonly pcTaskDependenciesRepository: PCTaskDependenciesRepository,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcProjectsBusiness: PCProjectsBusiness,
    private readonly pcHistoryBusiness: PCHistoryBusiness,
  ) {
    super();
  }

  async list(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    return this.pcTaskDependenciesRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
      orderBy: { id: 'asc' },
    });
  }

  private async loadGraph(projectId: number, companyId: number) {
    const [items, deps, members] = await Promise.all([
      this.pcBacklogItemsRepository.db.findMany({
        where: { projectId, companyId, isDeleted: false },
      }),
      this.pcTaskDependenciesRepository.db.findMany({
        where: { projectId, companyId, isDeleted: false },
      }),
      this.pcProjectMembersRepository.db.findMany({
        where: { projectId, companyId, active: true, isDeleted: false },
      }),
    ]);
    const capacityByActor = new Map(
      members.map((m) => [
        m.actorId,
        (m.dailyHours * m.dedicationPercent) / 100,
      ]),
    );
    const tasks: PCGraphTask[] = items.map((i) => ({
      id: i.id,
      code: i.code,
      estimatedHours: i.estimatedHours,
      responsibleId: i.responsibleId,
      dailyCapacity: i.responsibleId
        ? capacityByActor.get(i.responsibleId)
        : null,
    }));
    const dependencies: PCGraphDependency[] = deps.map((d) => ({
      predecessorId: d.predecessorId,
      successorId: d.successorId,
      lagHours: d.lagHours,
    }));
    return { items, deps, tasks, dependencies, members };
  }

  async createDependency(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    data: {
      projectId: number;
      predecessorId: number;
      successorId: number;
      dependencyType?: PCDependencyType;
      lagHours?: number;
    },
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      data.projectId,
    );
    if (data.predecessorId === data.successorId) {
      this.badRequest('PC_DEPENDENCY_SELF');
    }
    const [pred, succ] = await Promise.all([
      this.pcBacklogItemsRepository.db.findFirst({
        where: {
          id: data.predecessorId,
          projectId: data.projectId,
          companyId,
          isDeleted: false,
        },
      }),
      this.pcBacklogItemsRepository.db.findFirst({
        where: {
          id: data.successorId,
          projectId: data.projectId,
          companyId,
          isDeleted: false,
        },
      }),
    ]);
    if (!pred || !succ) this.badRequest('PC_DEPENDENCY_TASKS_INVALID');

    const dependencyType =
      data.dependencyType ?? PCDependencyType.FIN_A_INICIO;
    const lagHours = data.lagHours ?? 0;

    const existing = await this.pcTaskDependenciesRepository.db.findFirst({
      where: {
        projectId: data.projectId,
        predecessorId: data.predecessorId,
        successorId: data.successorId,
        dependencyType,
      },
    });
    if (existing && !existing.isDeleted) {
      this.badRequest('PC_DEPENDENCY_DUPLICATE');
    }

    const { tasks, dependencies } = await this.loadGraph(
      data.projectId,
      companyId,
    );
    const trial = [
      ...dependencies,
      {
        predecessorId: data.predecessorId,
        successorId: data.successorId,
        lagHours,
      },
    ];
    const validation = this.engine.validateGraph(tasks, trial);
    if (validation.hasCycle) {
      this.badRequest(
        `PC_DEPENDENCY_CYCLE:${validation.cycleTaskIds.join(',')}`,
      );
    }

    const saved = existing
      ? await this.pcTaskDependenciesRepository.db.update({
          where: { id: existing.id },
          data: {
            isDeleted: false,
            userId: ownerUserId,
            companyId,
            lagHours,
          },
        })
      : await this.pcTaskDependenciesRepository.db.create({
          data: {
            companyId,
            userId: ownerUserId,
            projectId: data.projectId,
            predecessorId: data.predecessorId,
            successorId: data.successorId,
            dependencyType,
            lagHours,
          },
        });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: ownerUserId,
      projectId: data.projectId,
      entityType: 'PCTaskDependencies',
      entityId: saved.id,
      action: existing ? 'RESTORE' : 'CREATE',
    });

    return saved;
  }

  async remove(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const dep = await this.pcTaskDependenciesRepository.db.findFirst({
      where: { id, projectId, companyId, isDeleted: false },
    });
    if (!dep) this.notFound('PC_DEPENDENCY_NOT_FOUND');
    const updated = await this.pcTaskDependenciesRepository.db.update({
      where: { id },
      data: { isDeleted: true },
    });
    await this.pcHistoryBusiness.log({
      companyId,
      userId: userId ?? dep.userId,
      projectId,
      entityType: 'PCTaskDependencies',
      entityId: id,
      action: 'DELETE',
    });
    return updated;
  }

  async validateGraph(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const { tasks, dependencies } = await this.loadGraph(projectId, companyId);
    return this.engine.validateGraph(tasks, dependencies);
  }

  async getPlanning(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const { tasks, dependencies, members } = await this.loadGraph(
      projectId,
      companyId,
    );
    const capacityByActor = new Map(
      members.map((m) => [
        m.actorId,
        (m.dailyHours * m.dedicationPercent) / 100,
      ]),
    );
    const ideal = this.engine.calculateCriticalPath({
      tasks,
      dependencies,
      projectStartDate: project.startDate,
      workingHoursPerDay: project.workingHoursPerDay,
      workingDays: project.workingDays,
    });
    const adjusted = this.engine.calculateResourceAdjustedPlan({
      tasks,
      dependencies,
      projectStartDate: project.startDate,
      workingHoursPerDay: project.workingHoursPerDay,
      workingDays: project.workingDays,
      criticalTaskIds: ideal.criticalTaskIds,
      capacityByActor,
    });
    return { ideal, adjusted };
  }
}
