export type PCGraphTask = {
  id: number;
  code: string;
  estimatedHours: number;
  responsibleId?: number | null;
  dailyCapacity?: number | null;
};

export type PCGraphDependency = {
  predecessorId: number;
  successorId: number;
  lagHours?: number;
};

export type PCGraphValidation = {
  hasCycle: boolean;
  cycleTaskIds: number[];
  topologicalOrder: number[];
  warnings: string[];
};

export type PCTaskSchedule = {
  taskId: number;
  code: string;
  durationDays: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
  missingAssignee: boolean;
  startDate?: Date;
  endDate?: Date;
};

export type PCCriticalPathResult = {
  totalHours: number;
  totalWorkingDays: number;
  estimatedEndDate: Date | null;
  criticalTaskIds: number[];
  criticalTaskCodes: string[];
  tasks: PCTaskSchedule[];
  unassignedTaskIds: number[];
  disconnectedTaskIds: number[];
  warnings: string[];
};

export type PCActorLoadStatus = 'OVERLOADED' | 'BALANCED' | 'AVAILABLE';

export type PCActorLoad = {
  actorId: number;
  assignedHours: number;
  dailyCapacity: number;
  freeHoursPerDay: number;
  windowWorkingDays: number;
  capacityHours: number;
  utilizationPercent: number;
  status: PCActorLoadStatus;
  taskIds: number[];
};

export type PCActorUnavailability = {
  actorId: number;
  fromDayIndex: number;
  toDayIndex: number;
};

export type PCAdjustedPlanResult = {
  tasks: Array<{
    taskId: number;
    code: string;
    responsibleId?: number | null;
    startDate: Date;
    endDate: Date;
    durationDays: number;
    startDayIndex: number;
    endDayIndex: number;
  }>;
  estimatedEndDate: Date | null;
  totalWorkingDays: number;
  actorLoads: PCActorLoad[];
  warnings: string[];
};

export function parseWorkingDays(workingDays: string): Set<number> {
  return new Set(
    workingDays
      .split(',')
      .map((d) => Number(d.trim()))
      .filter((d) => !Number.isNaN(d)),
  );
}

export function addWorkingDays(
  start: Date,
  days: number,
  workingDaySet: Set<number>,
): Date {
  const result = new Date(start);
  if (days <= 0) return result;
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay(); // 0 Sun .. 6 Sat; map Mon=1
    const mapped = dow === 0 ? 7 : dow;
    if (workingDaySet.has(mapped)) {
      remaining -= 1;
    }
  }
  return result;
}

/** Working-day index of `date` relative to project start (0 = start day if working). */
export function workingDayIndex(
  projectStartDate: Date,
  date: Date,
  workingDaySet: Set<number>,
): number {
  const start = new Date(projectStartDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  if (target.getTime() <= start.getTime()) return 0;

  let index = 0;
  const cursor = new Date(start);
  while (cursor.getTime() < target.getTime()) {
    cursor.setDate(cursor.getDate() + 1);
    const mapped = cursor.getDay() === 0 ? 7 : cursor.getDay();
    if (workingDaySet.has(mapped)) {
      index += 1;
    }
  }
  return index;
}

export function countWorkingDaysBetween(
  from: Date,
  to: Date,
  workingDays: string,
): number {
  const workingDaySet = parseWorkingDays(workingDays);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  if (end.getTime() < start.getTime()) return 0;

  let count = 0;
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const mapped = cursor.getDay() === 0 ? 7 : cursor.getDay();
    if (workingDaySet.has(mapped)) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

function effectiveCapacity(task: PCGraphTask, defaultHours: number): number {
  if (task.dailyCapacity && task.dailyCapacity > 0) return task.dailyCapacity;
  return defaultHours > 0 ? defaultHours : 8;
}

function pushPastUnavailability(
  dayIndex: number,
  durationDays: number,
  windows: PCActorUnavailability[],
): number {
  let start = dayIndex;
  let changed = true;
  while (changed) {
    changed = false;
    for (const w of windows) {
      const end = start + durationDays;
      if (start < w.toDayIndex && end > w.fromDayIndex) {
        start = Math.max(start, w.toDayIndex);
        changed = true;
      }
    }
  }
  return start;
}

export function classifyUtilization(utilizationPercent: number): PCActorLoadStatus {
  if (utilizationPercent > 100) return 'OVERLOADED';
  if (utilizationPercent < 70) return 'AVAILABLE';
  return 'BALANCED';
}

export function buildActorLoads(params: {
  tasks: PCGraphTask[];
  scheduled: Array<{
    taskId: number;
    responsibleId?: number | null;
    durationDays: number;
  }>;
  totalWorkingDays: number;
  workingHoursPerDay: number;
  capacityByActor?: Map<number, number>;
}): PCActorLoad[] {
  const {
    tasks,
    scheduled,
    totalWorkingDays,
    workingHoursPerDay,
    capacityByActor,
  } = params;
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const byActor = new Map<
    number,
    { hours: number; taskIds: number[]; dailyCapacity: number }
  >();

  for (const s of scheduled) {
    const task = taskMap.get(s.taskId);
    const actorId = s.responsibleId ?? task?.responsibleId;
    if (!actorId) continue;
    const current = byActor.get(actorId) ?? {
      hours: 0,
      taskIds: [],
      dailyCapacity:
        capacityByActor?.get(actorId) ??
        effectiveCapacity(task ?? { id: 0, code: '', estimatedHours: 0 }, workingHoursPerDay),
    };
    current.hours += task?.estimatedHours ?? 0;
    current.taskIds.push(s.taskId);
    byActor.set(actorId, current);
  }

  // Include members with capacity but no tasks
  if (capacityByActor) {
    for (const [actorId, cap] of capacityByActor) {
      if (!byActor.has(actorId)) {
        byActor.set(actorId, { hours: 0, taskIds: [], dailyCapacity: cap });
      }
    }
  }

  const windowWorkingDays = Math.max(1, totalWorkingDays);
  return [...byActor.entries()].map(([actorId, data]) => {
    const dailyCapacity = data.dailyCapacity > 0 ? data.dailyCapacity : workingHoursPerDay;
    const capacityHours = dailyCapacity * windowWorkingDays;
    const utilizationPercent =
      capacityHours > 0
        ? Number(((data.hours / capacityHours) * 100).toFixed(1))
        : 0;
    const avgDailyLoad = data.hours / windowWorkingDays;
    const freeHoursPerDay = Number(
      Math.max(0, dailyCapacity - avgDailyLoad).toFixed(2),
    );
    return {
      actorId,
      assignedHours: Number(data.hours.toFixed(2)),
      dailyCapacity: Number(dailyCapacity.toFixed(2)),
      freeHoursPerDay,
      windowWorkingDays,
      capacityHours: Number(capacityHours.toFixed(2)),
      utilizationPercent,
      status: classifyUtilization(utilizationPercent),
      taskIds: data.taskIds,
    };
  });
}

export class PCPlanningEngine {
  validateGraph(
    tasks: PCGraphTask[],
    dependencies: PCGraphDependency[],
  ): PCGraphValidation {
    const taskIds = new Set(tasks.map((t) => t.id));
    const warnings: string[] = [];
    const adj = new Map<number, number[]>();
    const indegree = new Map<number, number>();

    for (const id of taskIds) {
      adj.set(id, []);
      indegree.set(id, 0);
    }

    for (const dep of dependencies) {
      if (dep.predecessorId === dep.successorId) {
        warnings.push(`Autodependencia en la tarea ${dep.predecessorId}`);
        continue;
      }
      if (!taskIds.has(dep.predecessorId) || !taskIds.has(dep.successorId)) {
        warnings.push(
          `La dependencia referencia una tarea inexistente ${dep.predecessorId}->${dep.successorId}`,
        );
        continue;
      }
      adj.get(dep.predecessorId)!.push(dep.successorId);
      indegree.set(dep.successorId, (indegree.get(dep.successorId) ?? 0) + 1);
    }

    const queue: number[] = [];
    for (const [id, deg] of indegree) {
      if (deg === 0) queue.push(id);
    }

    const topologicalOrder: number[] = [];
    while (queue.length) {
      const current = queue.shift()!;
      topologicalOrder.push(current);
      for (const next of adj.get(current) ?? []) {
        const nextDeg = (indegree.get(next) ?? 0) - 1;
        indegree.set(next, nextDeg);
        if (nextDeg === 0) queue.push(next);
      }
    }

    const hasCycle = topologicalOrder.length !== taskIds.size;
    const cycleTaskIds = hasCycle
      ? [...taskIds].filter((id) => !topologicalOrder.includes(id))
      : [];

    return { hasCycle, cycleTaskIds, topologicalOrder, warnings };
  }

  calculateCriticalPath(params: {
    tasks: PCGraphTask[];
    dependencies: PCGraphDependency[];
    projectStartDate: Date;
    workingHoursPerDay: number;
    workingDays: string;
  }): PCCriticalPathResult {
    const {
      tasks,
      dependencies,
      projectStartDate,
      workingHoursPerDay,
      workingDays,
    } = params;
    const validation = this.validateGraph(tasks, dependencies);
    const warnings = [...validation.warnings];

    if (validation.hasCycle) {
      return {
        totalHours: 0,
        totalWorkingDays: 0,
        estimatedEndDate: null,
        criticalTaskIds: [],
        criticalTaskCodes: [],
        tasks: [],
        unassignedTaskIds: tasks
          .filter((t) => !t.responsibleId)
          .map((t) => t.id),
        disconnectedTaskIds: [],
        warnings: [
          ...warnings,
          `No se puede calcular la ruta crítica mientras exista un ciclo: ${validation.cycleTaskIds.join(',')}`,
        ],
      };
    }

    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const preds = new Map<number, Array<{ id: number; lag: number }>>();
    const succs = new Map<number, Array<{ id: number; lag: number }>>();
    for (const t of tasks) {
      preds.set(t.id, []);
      succs.set(t.id, []);
    }
    for (const d of dependencies) {
      preds.get(d.successorId)?.push({
        id: d.predecessorId,
        lag: d.lagHours ?? 0,
      });
      succs.get(d.predecessorId)?.push({
        id: d.successorId,
        lag: d.lagHours ?? 0,
      });
    }

    const connected = new Set<number>();
    for (const d of dependencies) {
      connected.add(d.predecessorId);
      connected.add(d.successorId);
    }
    const disconnectedTaskIds = tasks
      .filter((t) => !connected.has(t.id) && tasks.length > 1)
      .map((t) => t.id);

    const durationDays = new Map<number, number>();
    const unassignedTaskIds: number[] = [];
    for (const t of tasks) {
      const capacity = effectiveCapacity(t, workingHoursPerDay);
      const days = t.estimatedHours / capacity;
      durationDays.set(t.id, days);
      if (!t.responsibleId) {
        unassignedTaskIds.push(t.id);
        warnings.push(
          `La tarea ${t.code} no tiene responsable; se usa la capacidad por defecto del proyecto`,
        );
      }
    }

    const earlyStart = new Map<number, number>();
    const earlyFinish = new Map<number, number>();
    for (const id of validation.topologicalOrder) {
      const predList = preds.get(id) ?? [];
      let es = 0;
      for (const p of predList) {
        const pEf = earlyFinish.get(p.id) ?? 0;
        const lagDays = p.lag / workingHoursPerDay;
        es = Math.max(es, pEf + lagDays);
      }
      const dur = durationDays.get(id) ?? 0;
      earlyStart.set(id, es);
      earlyFinish.set(id, es + dur);
    }

    const projectDuration = Math.max(0, ...[...earlyFinish.values()]);
    const lateFinish = new Map<number, number>();
    const lateStart = new Map<number, number>();
    const reverseOrder = [...validation.topologicalOrder].reverse();
    for (const id of reverseOrder) {
      const succList = succs.get(id) ?? [];
      let lf = projectDuration;
      if (succList.length) {
        lf = Math.min(
          ...succList.map((s) => {
            const sLs = lateStart.get(s.id) ?? projectDuration;
            const lagDays = s.lag / workingHoursPerDay;
            return sLs - lagDays;
          }),
        );
      }
      const dur = durationDays.get(id) ?? 0;
      lateFinish.set(id, lf);
      lateStart.set(id, lf - dur);
    }

    const workingDaySet = parseWorkingDays(workingDays);
    const schedules: PCTaskSchedule[] = [];
    const criticalTaskIds: number[] = [];
    const criticalTaskCodes: string[] = [];

    for (const t of tasks) {
      const es = earlyStart.get(t.id) ?? 0;
      const ef = earlyFinish.get(t.id) ?? 0;
      const ls = lateStart.get(t.id) ?? 0;
      const lf = lateFinish.get(t.id) ?? 0;
      const slack = Math.max(0, ls - es);
      const isCritical = slack < 1e-6;
      if (isCritical) {
        criticalTaskIds.push(t.id);
        criticalTaskCodes.push(t.code);
      }
      schedules.push({
        taskId: t.id,
        code: t.code,
        durationDays: durationDays.get(t.id) ?? 0,
        earlyStart: es,
        earlyFinish: ef,
        lateStart: ls,
        lateFinish: lf,
        slack,
        isCritical,
        missingAssignee: !t.responsibleId,
        startDate: addWorkingDays(projectStartDate, es, workingDaySet),
        endDate: addWorkingDays(projectStartDate, ef, workingDaySet),
      });
    }

    const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);

    return {
      totalHours,
      totalWorkingDays: projectDuration,
      estimatedEndDate: addWorkingDays(
        projectStartDate,
        projectDuration,
        workingDaySet,
      ),
      criticalTaskIds,
      criticalTaskCodes,
      tasks: schedules,
      unassignedTaskIds,
      disconnectedTaskIds,
      warnings,
    };
  }

  calculateResourceAdjustedPlan(params: {
    tasks: PCGraphTask[];
    dependencies: PCGraphDependency[];
    projectStartDate: Date;
    workingHoursPerDay: number;
    workingDays: string;
    criticalTaskIds?: number[];
    actorUnavailability?: PCActorUnavailability[];
    capacityByActor?: Map<number, number>;
  }): PCAdjustedPlanResult {
    const {
      tasks,
      dependencies,
      projectStartDate,
      workingHoursPerDay,
      workingDays,
      criticalTaskIds = [],
      actorUnavailability = [],
      capacityByActor,
    } = params;
    const validation = this.validateGraph(tasks, dependencies);
    const warnings = [...validation.warnings];
    if (validation.hasCycle) {
      return {
        tasks: [],
        estimatedEndDate: null,
        totalWorkingDays: 0,
        actorLoads: [],
        warnings: [
          ...warnings,
          'No se puede calcular el plan ajustado mientras exista un ciclo',
        ],
      };
    }

    const workingDaySet = parseWorkingDays(workingDays);
    const criticalSet = new Set(criticalTaskIds);

    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const preds = new Map<number, Array<{ id: number; lag: number }>>();
    for (const t of tasks) preds.set(t.id, []);
    for (const d of dependencies) {
      preds.get(d.successorId)?.push({
        id: d.predecessorId,
        lag: d.lagHours ?? 0,
      });
    }

    const unavailByActor = new Map<number, PCActorUnavailability[]>();
    for (const u of actorUnavailability) {
      const list = unavailByActor.get(u.actorId) ?? [];
      list.push(u);
      unavailByActor.set(u.actorId, list);
    }

    const actorAvailableFrom = new Map<number, number>();
    const finishDay = new Map<number, number>();
    const result: PCAdjustedPlanResult['tasks'] = [];
    const remaining = new Set(tasks.map((t) => t.id));

    const earliestStartFor = (id: number): { earliest: number; durationDays: number } => {
      const task = taskMap.get(id)!;
      const capacity = effectiveCapacity(task, workingHoursPerDay);
      const durationDays = task.estimatedHours / capacity;
      let earliest = 0;
      for (const p of preds.get(id) ?? []) {
        const pFinish = finishDay.get(p.id) ?? 0;
        earliest = Math.max(earliest, pFinish + p.lag / workingHoursPerDay);
      }
      if (task.responsibleId) {
        const actorReady = actorAvailableFrom.get(task.responsibleId) ?? 0;
        earliest = Math.max(earliest, actorReady);
        earliest = pushPastUnavailability(
          earliest,
          durationDays,
          unavailByActor.get(task.responsibleId) ?? [],
        );
      }
      return { earliest, durationDays };
    };

    // List-scheduling: repeatedly pick the ready task that can start soonest
    // so leftover same-day capacity is packed before later-gated work.
    while (remaining.size > 0) {
      const ready: number[] = [];
      for (const id of remaining) {
        const ps = preds.get(id) ?? [];
        if (ps.every((p) => finishDay.has(p.id))) ready.push(id);
      }
      if (ready.length === 0) {
        warnings.push(
          'No se pudo completar el plan ajustado: quedaron tareas sin predecesores resueltos',
        );
        break;
      }

      let bestId = ready[0];
      let bestStart = Number.POSITIVE_INFINITY;
      let bestCritical = 1;
      let bestDuration = Number.POSITIVE_INFINITY;

      for (const id of ready) {
        const { earliest, durationDays } = earliestStartFor(id);
        const isCritical = criticalSet.has(id) ? 0 : 1;
        const better =
          earliest < bestStart - 1e-9 ||
          (Math.abs(earliest - bestStart) <= 1e-9 && isCritical < bestCritical) ||
          (Math.abs(earliest - bestStart) <= 1e-9 &&
            isCritical === bestCritical &&
            durationDays < bestDuration - 1e-9) ||
          (Math.abs(earliest - bestStart) <= 1e-9 &&
            isCritical === bestCritical &&
            Math.abs(durationDays - bestDuration) <= 1e-9 &&
            id < bestId);
        if (better) {
          bestId = id;
          bestStart = earliest;
          bestCritical = isCritical;
          bestDuration = durationDays;
        }
      }

      const task = taskMap.get(bestId)!;
      const { earliest, durationDays } = earliestStartFor(bestId);
      if (!task.responsibleId) {
        warnings.push(
          `La tarea ${task.code} no tiene responsable en el plan ajustado`,
        );
      }
      const end = earliest + durationDays;
      finishDay.set(bestId, end);
      if (task.responsibleId) {
        actorAvailableFrom.set(task.responsibleId, end);
      }
      result.push({
        taskId: bestId,
        code: task.code,
        responsibleId: task.responsibleId,
        startDate: addWorkingDays(projectStartDate, earliest, workingDaySet),
        endDate: addWorkingDays(projectStartDate, end, workingDaySet),
        durationDays,
        startDayIndex: earliest,
        endDayIndex: end,
      });
      remaining.delete(bestId);
    }

    result.sort(
      (a, b) =>
        a.startDayIndex - b.startDayIndex ||
        a.endDayIndex - b.endDayIndex ||
        a.taskId - b.taskId,
    );

    const maxEnd = Math.max(0, ...[...finishDay.values()], 0);
    const actorLoads = buildActorLoads({
      tasks,
      scheduled: result,
      totalWorkingDays: maxEnd,
      workingHoursPerDay,
      capacityByActor,
    });

    return {
      tasks: result,
      estimatedEndDate: addWorkingDays(projectStartDate, maxEnd, workingDaySet),
      totalWorkingDays: maxEnd,
      actorLoads,
      warnings,
    };
  }
}
