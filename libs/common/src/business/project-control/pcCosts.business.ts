import { Injectable } from '@nestjs/common';
import {
  PCBacklogItemsRepository,
  PCBaselinesRepository,
  PCProjectMembersRepository,
  PCQaRulesRepository,
  PCTimeEntriesRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCQaActorScope, PCQaCalcType } from '@prisma/client';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCHistoryBusiness } from './pcHistory.business';
import { PCCostEngine } from './engines/pcCost.engine';
import { PCDependenciesBusiness } from './pcDependencies.business';

@Injectable()
export class PCCostsBusiness extends ResponseClass {
  private readonly engine = new PCCostEngine();

  constructor(
    private readonly pcProjectsBusiness: PCProjectsBusiness,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcTimeEntriesRepository: PCTimeEntriesRepository,
    private readonly pcQaRulesRepository: PCQaRulesRepository,
    private readonly pcBaselinesRepository: PCBaselinesRepository,
    private readonly pcHistoryBusiness: PCHistoryBusiness,
    private readonly pcDependenciesBusiness: PCDependenciesBusiness,
  ) {
    super();
  }

  private async buildCostSummary(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const [tasks, members, timeEntries, qaRules] = await Promise.all([
      this.pcBacklogItemsRepository.db.findMany({
        where: { projectId, companyId, isDeleted: false },
      }),
      this.pcProjectMembersRepository.db.findMany({
        where: { projectId, companyId, active: true, isDeleted: false },
      }),
      this.pcTimeEntriesRepository.db.findMany({
        where: { projectId, companyId, isDeleted: false },
      }),
      this.pcQaRulesRepository.db.findMany({
        where: { projectId, companyId, active: true, isDeleted: false },
        include: { SelectedActors: true, QaActor: true },
      }),
    ]);

    const memberByActor = new Map(members.map((m) => [m.actorId, m]));
    const epicByItem = new Map<number, number | null>();
    for (const t of tasks) {
      let current: typeof t | undefined = t;
      let epicId: number | null = null;
      const guard = new Set<number>();
      while (current) {
        if (guard.has(current.id)) break;
        guard.add(current.id);
        if (current.type === 'EPICA') {
          epicId = current.id;
          break;
        }
        current = tasks.find((x) => x.id === current!.parentId);
      }
      epicByItem.set(t.id, epicId);
    }

    return this.engine.calculate({
      tasks: tasks.map((t) => ({
        id: t.id,
        code: t.code,
        type: t.type,
        estimatedHours: t.estimatedHours,
        remainingHours: t.remainingHours,
        responsibleId: t.responsibleId,
        hourlyCost: t.responsibleId
          ? memberByActor.get(t.responsibleId)?.projectHourlyCost
          : null,
        sprintId: t.sprintId,
        parentId: t.parentId,
        epicId: epicByItem.get(t.id) ?? null,
      })),
      members: members.map((m) => ({
        actorId: m.actorId,
        projectHourlyCost: m.projectHourlyCost,
        projectRole: m.projectRole,
      })),
      timeEntries: timeEntries.map((e) => ({
        actorId: e.actorId,
        backlogItemId: e.backlogItemId,
        calculatedCost: e.calculatedCost,
        hours: e.hours,
      })),
      qaRules: qaRules.map((r) => ({
        calcType: r.calcType,
        value: r.value,
        actorScope: r.actorScope,
        qaActorHourlyCost:
          r.QaActor?.id != null
            ? memberByActor.get(r.QaActor.id)?.projectHourlyCost ??
              r.QaActor.defaultHourlyCost
            : null,
        selectedActorIds: r.SelectedActors.map((a) => a.actorId),
      })),
      contingencyPercent: project.contingencyPercent,
      budget: project.budget,
    });
  }

  async summary(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    return this.buildCostSummary(companyId, userId, projectId);
  }

  async upsertQaRule(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    data: {
      id?: number;
      projectId: number;
      active?: boolean;
      calcType: PCQaCalcType;
      value: number;
      actorScope?: PCQaActorScope;
      qaActorId?: number | null;
      selectedActorIds?: number[];
    },
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      data.projectId,
    );

    if (data.id) {
      const existing = await this.pcQaRulesRepository.db.findFirst({
        where: {
          id: data.id,
          projectId: data.projectId,
          companyId,
          isDeleted: false,
        },
      });
      if (!existing) this.notFound('PC_QA_RULE_NOT_FOUND');
      await this.pcQaRulesRepository.actorsDb.deleteMany({
        where: { qaRuleId: data.id },
      });
      const updated = await this.pcQaRulesRepository.db.update({
        where: { id: data.id },
        data: {
          active: data.active ?? true,
          calcType: data.calcType,
          value: data.value,
          actorScope: data.actorScope ?? PCQaActorScope.TODOS_LOS_ACTORES,
          qaActorId: data.qaActorId ?? null,
        },
      });
      if (data.selectedActorIds?.length) {
        await this.pcQaRulesRepository.actorsDb.createMany({
          data: data.selectedActorIds.map((actorId) => ({
            qaRuleId: data.id!,
            actorId,
          })),
        });
      }
      return updated;
    }

    const created = await this.pcQaRulesRepository.db.create({
      data: {
        companyId,
        userId: ownerUserId,
        projectId: data.projectId,
        active: data.active ?? true,
        calcType: data.calcType,
        value: data.value,
        actorScope: data.actorScope ?? PCQaActorScope.TODOS_LOS_ACTORES,
        qaActorId: data.qaActorId ?? null,
      },
    });
    if (data.selectedActorIds?.length) {
      await this.pcQaRulesRepository.actorsDb.createMany({
        data: data.selectedActorIds.map((actorId) => ({
          qaRuleId: created.id,
          actorId,
        })),
      });
    }
    return created;
  }

  async listQaRules(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    return this.pcQaRulesRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
      include: { SelectedActors: true },
      orderBy: { id: 'asc' },
    });
  }

  async createBaseline(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    projectId: number,
    name: string,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      projectId,
    );
    const [cost, planning, backlog] = await Promise.all([
      this.buildCostSummary(companyId, scopeUserId, projectId),
      this.pcDependenciesBusiness.getPlanning(
        companyId,
        scopeUserId,
        projectId,
      ),
      this.pcBacklogItemsRepository.db.findMany({
        where: { projectId, companyId, isDeleted: false },
      }),
    ]);

    const snapshot = {
      project,
      cost,
      planning,
      backlog,
    };

    const baseline = await this.pcBaselinesRepository.db.create({
      data: {
        companyId,
        userId: ownerUserId,
        projectId,
        name,
        estimatedHours: backlog.reduce((s, b) => s + b.estimatedHours, 0),
        estimatedCost: cost.estimatedCost,
        estimatedEndDate:
          planning.adjusted.estimatedEndDate ??
          planning.ideal.estimatedEndDate,
        backlogItemsCount: backlog.length,
        snapshotData: JSON.stringify(snapshot),
      },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: ownerUserId,
      projectId,
      entityType: 'PCBaselines',
      entityId: baseline.id,
      action: 'CREATE',
    });

    return baseline;
  }

  async listBaselines(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    return this.pcBaselinesRepository.db.findMany({
      where: { projectId, companyId },
      orderBy: { id: 'desc' },
    });
  }

  async getBaseline(
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
    const baseline = await this.pcBaselinesRepository.db.findFirst({
      where: { id, projectId, companyId },
    });
    if (!baseline) this.notFound('PC_BASELINE_NOT_FOUND');
    return baseline;
  }
}
