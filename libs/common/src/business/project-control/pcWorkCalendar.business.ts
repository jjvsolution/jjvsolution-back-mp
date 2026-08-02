import { Injectable } from '@nestjs/common';
import {
  PCActorsRepository,
  PCBacklogItemsRepository,
  PCProjectMembersRepository,
  PCTaskDependenciesRepository,
  PCTimeEntriesRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCProjectsBusiness } from './pcProjects.business';
import {
  PCGraphDependency,
  PCGraphTask,
  PCPlanningEngine,
} from './engines/pcPlanning.engine';
import {
  PCWorkCalendarResult,
  buildWorkCalendar,
  toRangeDateKey,
} from './engines/pcWorkCalendar.engine';

@Injectable()
export class PCWorkCalendarBusiness extends ResponseClass {
  private readonly engine = new PCPlanningEngine();

  constructor(
    private readonly pcTaskDependenciesRepository: PCTaskDependenciesRepository,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcActorsRepository: PCActorsRepository,
    private readonly pcTimeEntriesRepository: PCTimeEntriesRepository,
    private readonly pcProjectsBusiness: PCProjectsBusiness,
  ) {
    super();
  }

  async getWorkCalendar(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    fromDate: Date | string,
    toDate: Date | string,
  ): Promise<PCWorkCalendarResult> {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );

    const fromKey = toRangeDateKey(fromDate);
    const toKey = toRangeDateKey(toDate);
    if (fromKey > toKey) this.badRequest('PC_WORK_CALENDAR_RANGE_INVALID');

    const from = new Date(`${fromKey}T00:00:00.000Z`);
    const to = new Date(`${toKey}T23:59:59.999Z`);

    const [items, deps, members, timeEntries] = await Promise.all([
      this.pcBacklogItemsRepository.db.findMany({
        where: { projectId, companyId, isDeleted: false },
      }),
      this.pcTaskDependenciesRepository.db.findMany({
        where: { projectId, companyId, isDeleted: false },
      }),
      this.pcProjectMembersRepository.db.findMany({
        where: { projectId, companyId, active: true, isDeleted: false },
      }),
      this.pcTimeEntriesRepository.db.findMany({
        where: {
          projectId,
          companyId,
          isDeleted: false,
          date: { gte: from, lte: to },
        },
        orderBy: { date: 'asc' },
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

    const actorIdSet = new Set<number>([
      ...members.map((m) => m.actorId),
      ...timeEntries.map((e) => e.actorId),
    ]);
    const actorIds = [...actorIdSet];
    const actorRows =
      actorIds.length === 0
        ? []
        : await this.pcActorsRepository.db.findMany({
            where: { companyId, id: { in: actorIds }, isDeleted: false },
            select: { id: true, name: true, defaultDailyHours: true },
          });
    const nameById = new Map(
      actorRows.map((a) => [a.id, a.name || `Actor ${a.id}`]),
    );
    const defaultHoursById = new Map(
      actorRows.map((a) => [a.id, a.defaultDailyHours || 8]),
    );

    const actors = actorIds
      .map((actorId) => ({
        actorId,
        name: nameById.get(actorId) ?? `Actor ${actorId}`,
        dailyCapacity:
          capacityByActor.get(actorId) ??
          defaultHoursById.get(actorId) ??
          project.workingHoursPerDay,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const backlogById = new Map(
      items.map((i) => [
        i.id,
        {
          code: i.code,
          title: i.title,
          estimatedHours: i.estimatedHours,
        },
      ]),
    );

    return buildWorkCalendar({
      projectId,
      fromDate: fromKey,
      toDate: toKey,
      projectStartDate: project.startDate,
      workingDays: project.workingDays,
      actors,
      backlogById,
      plannedTasks: adjusted.tasks,
      timeEntries: timeEntries.map((e) => ({
        id: e.id,
        actorId: e.actorId,
        backlogItemId: e.backlogItemId,
        date: e.date,
        hours: e.hours,
      })),
    });
  }
}
