import { Injectable } from '@nestjs/common';
import {
  PCActorsRepository,
  PCBacklogItemsRepository,
  PCProjectMembersRepository,
  PCTaskDependenciesRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCProjectsBusiness } from './pcProjects.business';
import {
  PCActorLoad,
  PCActorUnavailability,
  PCGraphDependency,
  PCGraphTask,
  PCPlanningEngine,
  buildActorLoads,
  countWorkingDaysBetween,
  parseWorkingDays,
  workingDayIndex,
} from './engines/pcPlanning.engine';

export type PCScenarioType = 'ABSENCE' | 'REMOVE_OR_REASSIGN' | 'ADD_MEMBER_MONTH';

export type PCScenarioInput = {
  type: PCScenarioType;
  actorId?: number;
  fromDate?: string | Date;
  toDate?: string | Date;
  reassignToActorId?: number | null;
  hourlyCost?: number;
  dailyHours?: number;
  dedicationPercent?: number;
  monthWorkingDays?: number;
  assumeHours?: number;
};

export type PCAccelerationSuggestion = {
  taskId: number;
  taskCode: string;
  fromActorId: number;
  toActorId: number;
  estimatedDaysSaved: number;
  rationale: string;
};

@Injectable()
export class PCCapacityBusiness extends ResponseClass {
  private readonly engine = new PCPlanningEngine();

  constructor(
    private readonly pcTaskDependenciesRepository: PCTaskDependenciesRepository,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcActorsRepository: PCActorsRepository,
    private readonly pcProjectsBusiness: PCProjectsBusiness,
  ) {
    super();
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
    const rateByActor = new Map(
      members.map((m) => [m.actorId, m.projectHourlyCost]),
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
    return {
      items,
      deps,
      tasks,
      dependencies,
      members,
      capacityByActor,
      rateByActor,
    };
  }

  private async actorNames(companyId: number, actorIds: number[]) {
    if (!actorIds.length) return new Map<number, string>();
    const actors = await this.pcActorsRepository.db.findMany({
      where: { companyId, id: { in: actorIds }, isDeleted: false },
      select: { id: true, name: true },
    });
    return new Map(
      actors.map((a) => [a.id, a.name || `Actor ${a.id}`]),
    );
  }

  private enrichLoads(
    loads: PCActorLoad[],
    names: Map<number, string>,
  ): Array<PCActorLoad & { actorName: string }> {
    return loads.map((l) => ({
      ...l,
      actorName: names.get(l.actorId) ?? `Actor ${l.actorId}`,
    }));
  }

  private plan(
    project: {
      startDate: Date;
      workingHoursPerDay: number;
      workingDays: string;
    },
    tasks: PCGraphTask[],
    dependencies: PCGraphDependency[],
    capacityByActor: Map<number, number>,
    actorUnavailability: PCActorUnavailability[] = [],
  ) {
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
      actorUnavailability,
      capacityByActor,
    });
    return { ideal, adjusted };
  }

  async getCapacityInsights(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const { tasks, dependencies, capacityByActor, items } =
      await this.loadGraph(projectId, companyId);
    const { ideal, adjusted } = this.plan(
      project,
      tasks,
      dependencies,
      capacityByActor,
    );
    // Utilization vs ideal window: adjusted span always ~fills the assignee, masking overload.
    const loadWindow = Math.max(1, ideal.totalWorkingDays || adjusted.totalWorkingDays);
    const rawLoads = buildActorLoads({
      tasks,
      scheduled: adjusted.tasks,
      totalWorkingDays: loadWindow,
      workingHoursPerDay: project.workingHoursPerDay,
      capacityByActor,
    });
    const names = await this.actorNames(companyId, [
      ...capacityByActor.keys(),
      ...rawLoads.map((l) => l.actorId),
    ]);
    const actorLoads = this.enrichLoads(rawLoads, names);
    const suggestions = this.buildAccelerationSuggestions({
      ideal,
      baselineAdjusted: { ...adjusted, actorLoads: rawLoads },
      tasks,
      dependencies,
      project,
      capacityByActor,
    });

    return {
      projectId,
      workingHoursPerDay: project.workingHoursPerDay,
      workingDays: project.workingDays,
      baselineEndDate: adjusted.estimatedEndDate,
      baselineWorkingDays: adjusted.totalWorkingDays,
      totalAssignedHours: tasks.reduce((s, t) => s + t.estimatedHours, 0),
      unassignedTaskCount: tasks.filter((t) => !t.responsibleId).length,
      actorLoads,
      accelerationSuggestions: suggestions,
      criticalTaskIds: ideal.criticalTaskIds,
      warnings: [...ideal.warnings, ...adjusted.warnings],
      backlogItemCount: items.length,
    };
  }

  private buildAccelerationSuggestions(params: {
    ideal: ReturnType<PCPlanningEngine['calculateCriticalPath']>;
    baselineAdjusted: ReturnType<PCPlanningEngine['calculateResourceAdjustedPlan']>;
    tasks: PCGraphTask[];
    dependencies: PCGraphDependency[];
    project: {
      startDate: Date;
      workingHoursPerDay: number;
      workingDays: string;
    };
    capacityByActor: Map<number, number>;
  }): PCAccelerationSuggestion[] {
    const {
      ideal,
      baselineAdjusted,
      tasks,
      dependencies,
      project,
      capacityByActor,
    } = params;
    const criticalSet = new Set(ideal.criticalTaskIds);
    const overloaded = new Set(
      baselineAdjusted.actorLoads
        .filter((l) => l.status === 'OVERLOADED')
        .map((l) => l.actorId),
    );
    const available = baselineAdjusted.actorLoads
      .filter((l) => l.status === 'AVAILABLE')
      .map((l) => l.actorId);
    if (!available.length || !overloaded.size) return [];

    const candidates = tasks.filter(
      (t) =>
        t.responsibleId &&
        criticalSet.has(t.id) &&
        overloaded.has(t.responsibleId),
    );
    const baselineEnd = baselineAdjusted.estimatedEndDate?.getTime() ?? 0;
    const suggestions: PCAccelerationSuggestion[] = [];

    for (const task of candidates.slice(0, 8)) {
      for (const toActorId of available.slice(0, 4)) {
        if (toActorId === task.responsibleId) continue;
        const trialTasks = tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                responsibleId: toActorId,
                dailyCapacity: capacityByActor.get(toActorId) ?? t.dailyCapacity,
              }
            : t,
        );
        const trial = this.plan(
          project,
          trialTasks,
          dependencies,
          capacityByActor,
        );
        const trialEnd = trial.adjusted.estimatedEndDate?.getTime() ?? 0;
        if (!baselineEnd || !trialEnd || trialEnd >= baselineEnd) continue;
        const daysSaved =
          baselineAdjusted.totalWorkingDays - trial.adjusted.totalWorkingDays;
        if (daysSaved <= 0.05) continue;
        suggestions.push({
          taskId: task.id,
          taskCode: task.code,
          fromActorId: task.responsibleId!,
          toActorId,
          estimatedDaysSaved: Number(daysSaved.toFixed(1)),
          rationale: `Reasignar ${task.code} (crítica) libera al actor sobrecargado`,
        });
      }
    }

    return suggestions
      .sort((a, b) => b.estimatedDaysSaved - a.estimatedDaysSaved)
      .slice(0, 3);
  }

  async simulateScenario(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    scenario: PCScenarioInput,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const graph = await this.loadGraph(projectId, companyId);
    let { tasks } = graph;
    const { dependencies, capacityByActor, rateByActor } = graph;
    const workingDaySet = parseWorkingDays(project.workingDays);

    const baseline = this.plan(
      project,
      tasks,
      dependencies,
      capacityByActor,
    );

    const actorUnavailability: PCActorUnavailability[] = [];
    let costDelta = 0;
    let scenarioLabel = '';
    const impactedTaskIds: number[] = [];
    const warnings: string[] = [];
    const simCapacity = new Map(capacityByActor);

    if (scenario.type === 'ABSENCE') {
      if (!scenario.actorId || !scenario.fromDate || !scenario.toDate) {
        this.badRequest('PC_SCENARIO_ABSENCE_PARAMS');
      }
      const from = new Date(scenario.fromDate);
      const to = new Date(scenario.toDate);
      const fromIdx = workingDayIndex(project.startDate, from, workingDaySet);
      const toIdx = workingDayIndex(project.startDate, to, workingDaySet) + 1;
      actorUnavailability.push({
        actorId: scenario.actorId!,
        fromDayIndex: fromIdx,
        toDayIndex: Math.max(fromIdx, toIdx),
      });
      scenarioLabel = `Ausencia actor ${scenario.actorId} (${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)})`;
      impactedTaskIds.push(
        ...tasks
          .filter((t) => t.responsibleId === scenario.actorId)
          .map((t) => t.id),
      );
    } else if (scenario.type === 'REMOVE_OR_REASSIGN') {
      if (!scenario.actorId) this.badRequest('PC_SCENARIO_ACTOR_REQUIRED');
      const target = scenario.reassignToActorId ?? null;
      tasks = tasks.map((t) => {
        if (t.responsibleId !== scenario.actorId) return t;
        impactedTaskIds.push(t.id);
        if (target) {
          return {
            ...t,
            responsibleId: target,
            dailyCapacity: simCapacity.get(target) ?? t.dailyCapacity,
          };
        }
        return { ...t, responsibleId: null, dailyCapacity: null };
      });
      simCapacity.delete(scenario.actorId!);
      scenarioLabel = target
        ? `Reasignar tareas de ${scenario.actorId} → ${target}`
        : `Quitar actor ${scenario.actorId} (sin reasignar)`;
      if (!target) {
        warnings.push(
          'Las tareas quedan sin responsable; el plan usará capacidad por defecto del proyecto',
        );
      }
    } else if (scenario.type === 'ADD_MEMBER_MONTH') {
      const dailyHours =
        scenario.dailyHours ?? project.workingHoursPerDay ?? 8;
      const dedication = scenario.dedicationPercent ?? 100;
      const hourly =
        scenario.hourlyCost ??
        [...rateByActor.values()].find((v) => v > 0) ??
        0;
      const monthDays =
        scenario.monthWorkingDays ??
        countWorkingDaysBetween(
          new Date(project.startDate),
          addOneMonth(project.startDate),
          project.workingDays,
        );
      const dailyCap = (dailyHours * dedication) / 100;
      costDelta = Number((hourly * dailyCap * monthDays).toFixed(0));
      scenarioLabel = `Añadir integrante 1 mes (${dailyCap}h/día × ${monthDays} días × $${hourly}/h)`;

      if (scenario.assumeHours && scenario.assumeHours > 0) {
        const virtualActorId = -1;
        simCapacity.set(virtualActorId, dailyCap);
        let remaining = scenario.assumeHours;
        const overloadedTasks = [...tasks]
          .filter((t) => t.responsibleId)
          .sort((a, b) => b.estimatedHours - a.estimatedHours);
        const takeIds = new Set<number>();
        for (const t of overloadedTasks) {
          if (remaining <= 0) break;
          takeIds.add(t.id);
          remaining -= t.estimatedHours;
        }
        tasks = tasks.map((t) => {
          if (!takeIds.has(t.id)) return t;
          impactedTaskIds.push(t.id);
          return {
            ...t,
            responsibleId: virtualActorId,
            dailyCapacity: dailyCap,
          };
        });
      }
    } else {
      this.badRequest('PC_SCENARIO_TYPE_INVALID');
    }

    const simulated = this.plan(
      project,
      tasks,
      dependencies,
      simCapacity,
      actorUnavailability,
    );

    const baselineEnd = baseline.adjusted.estimatedEndDate;
    const simEnd = simulated.adjusted.estimatedEndDate;
    const endDateDeltaDays = Number(
      (
        simulated.adjusted.totalWorkingDays -
        baseline.adjusted.totalWorkingDays
      ).toFixed(1),
    );

    const names = await this.actorNames(companyId, [
      ...simCapacity.keys(),
      ...baseline.adjusted.actorLoads.map((l) => l.actorId),
      ...simulated.adjusted.actorLoads.map((l) => l.actorId),
    ].filter((id) => id > 0));

    return {
      scenarioType: scenario.type,
      scenarioLabel,
      baseline: {
        estimatedEndDate: baselineEnd,
        totalWorkingDays: baseline.adjusted.totalWorkingDays,
        actorLoads: this.enrichLoads(baseline.adjusted.actorLoads, names),
      },
      simulated: {
        estimatedEndDate: simEnd,
        totalWorkingDays: simulated.adjusted.totalWorkingDays,
        actorLoads: this.enrichLoads(
          simulated.adjusted.actorLoads.filter((l) => l.actorId > 0),
          names,
        ),
        warnings: [
          ...warnings,
          ...simulated.ideal.warnings,
          ...simulated.adjusted.warnings,
        ],
      },
      endDateDeltaDays,
      costDelta,
      impactedTaskIds: [...new Set(impactedTaskIds)],
      warnings,
    };
  }
}

function addOneMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}
