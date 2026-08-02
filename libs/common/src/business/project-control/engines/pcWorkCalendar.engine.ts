import { addWorkingDays, parseWorkingDays } from './pcPlanning.engine';

export type PCWorkCalendarTaskCard = {
  backlogItemId: number;
  code: string;
  title: string;
  /** Horas estimadas de la tarea (total). */
  taskEstimatedHours: number;
  /** Horas planificadas para ese día (prorrateo). */
  plannedEstimatedHours: number;
  actualHours: number;
  timeEntryIds: number[];
  fromPlan: boolean;
};

export type PCWorkCalendarCell = {
  actorId: number;
  date: string;
  tasks: PCWorkCalendarTaskCard[];
  totalPlannedHours: number;
  totalActualHours: number;
};

export type PCWorkCalendarActor = {
  actorId: number;
  name: string;
  dailyCapacity: number;
};

export type PCWorkCalendarResult = {
  projectId: number;
  fromDate: string;
  toDate: string;
  workingDays: string;
  days: string[];
  actors: PCWorkCalendarActor[];
  cells: PCWorkCalendarCell[];
};

/** Calendar date key aligned with PCPlanningEngine local date arithmetic. */
export function toDateKey(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Range/query dates from GraphQL (typically noon or midnight UTC). */
export function toRangeDateKey(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, '0');
  const d = String(value.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Project start from DB date-only (midnight UTC) → calendar day in UTC. */
export function toProjectDateKey(value: Date | string): string {
  return toRangeDateKey(value);
}

/** Prefer UTC when the instant looks like a date-only / noon-UTC payload. */
export function toEntryDateKey(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  const utcHours = value.getUTCHours();
  if (utcHours === 12 || (utcHours === 0 && value.getUTCMinutes() === 0)) {
    return toRangeDateKey(value);
  }
  return toDateKey(value);
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  // Local midnight so it matches addWorkingDays / getDay arithmetic.
  return new Date(y, m - 1, d);
}

export function eachDateKey(from: Date | string, to: Date | string): string[] {
  const days: string[] = [];
  const cursor = parseDateKey(toDateKey(from));
  const end = parseDateKey(toDateKey(to));
  while (cursor.getTime() <= end.getTime()) {
    days.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function isWorkingDateKey(dateKey: string, workingDays: string): boolean {
  const d = parseDateKey(dateKey);
  const mapped = d.getDay() === 0 ? 7 : d.getDay();
  return parseWorkingDays(workingDays).has(mapped);
}

function cellKey(actorId: number, dateKey: string, taskId: number): string {
  return `${actorId}|${dateKey}|${taskId}`;
}

function dateKeyForDayIndex(
  projectStart: Date,
  dayIndex: number,
  workingDaySet: Set<number>,
): string {
  if (dayIndex <= 0) return toDateKey(projectStart);
  return toDateKey(addWorkingDays(projectStart, dayIndex, workingDaySet));
}

/**
 * Hours planned for one working-day slot [dayIndex, dayIndex+1)
 * intersecting the task window [startDayIndex, endDayIndex).
 */
export function plannedHoursForDayIndex(params: {
  dayIndex: number;
  startDayIndex: number;
  endDayIndex: number;
  estimatedHours: number;
  durationDays: number;
}): number {
  if (params.durationDays <= 0 || params.estimatedHours <= 0) return 0;
  if (params.endDayIndex <= params.startDayIndex) return 0;
  const overlapStart = Math.max(params.dayIndex, params.startDayIndex);
  const overlapEnd = Math.min(params.dayIndex + 1, params.endDayIndex);
  const overlap = overlapEnd - overlapStart;
  if (overlap <= 0) return 0;
  return (overlap / params.durationDays) * params.estimatedHours;
}

export function buildWorkCalendar(params: {
  projectId: number;
  fromDate: Date | string;
  toDate: Date | string;
  projectStartDate: Date | string;
  workingDays: string;
  actors: PCWorkCalendarActor[];
  backlogById: Map<
    number,
    { code: string; title: string; estimatedHours: number }
  >;
  plannedTasks: Array<{
    taskId: number;
    code: string;
    responsibleId?: number | null;
    startDate: Date | string;
    endDate: Date | string;
    durationDays: number;
    startDayIndex: number;
    endDayIndex: number;
  }>;
  timeEntries: Array<{
    id: number;
    actorId: number;
    backlogItemId: number;
    date: Date | string;
    hours: number;
  }>;
}): PCWorkCalendarResult {
  const fromDate = toRangeDateKey(params.fromDate);
  const toDate = toRangeDateKey(params.toDate);
  const days = eachDateKey(fromDate, toDate);
  const daySet = new Set(days);
  const workingDaySet = parseWorkingDays(params.workingDays);
  const projectStart = parseDateKey(toProjectDateKey(params.projectStartDate));

  type Acc = {
    plannedEstimatedHours: number;
    fromPlan: boolean;
    actualHours: number;
    timeEntryIds: number[];
  };
  const acc = new Map<string, Acc>();

  const ensure = (actorId: number, dateKey: string, taskId: number): Acc => {
    const key = cellKey(actorId, dateKey, taskId);
    let row = acc.get(key);
    if (!row) {
      row = {
        plannedEstimatedHours: 0,
        fromPlan: false,
        actualHours: 0,
        timeEntryIds: [],
      };
      acc.set(key, row);
    }
    return row;
  };

  for (const task of params.plannedTasks) {
    if (!task.responsibleId) continue;
    const item = params.backlogById.get(task.taskId);
    const estimatedHours = item?.estimatedHours ?? 0;
    if (task.durationDays <= 0 || estimatedHours <= 0) continue;
    if (task.endDayIndex <= task.startDayIndex) continue;

    const first = Math.floor(task.startDayIndex);
    const last = Math.ceil(task.endDayIndex) - 1;
    for (let dayIndex = first; dayIndex <= last; dayIndex++) {
      const hours = plannedHoursForDayIndex({
        dayIndex,
        startDayIndex: task.startDayIndex,
        endDayIndex: task.endDayIndex,
        estimatedHours,
        durationDays: task.durationDays,
      });
      if (hours <= 0) continue;

      const dateKey = dateKeyForDayIndex(projectStart, dayIndex, workingDaySet);
      if (!daySet.has(dateKey)) continue;

      const row = ensure(task.responsibleId, dateKey, task.taskId);
      row.fromPlan = true;
      row.plannedEstimatedHours += hours;
    }
  }

  for (const entry of params.timeEntries) {
    const dateKey = toEntryDateKey(entry.date);
    if (!daySet.has(dateKey)) continue;
    const row = ensure(entry.actorId, dateKey, entry.backlogItemId);
    row.actualHours += entry.hours;
    row.timeEntryIds.push(entry.id);
  }

  const cells: PCWorkCalendarCell[] = [];

  for (const actor of params.actors) {
    for (const dateKey of days) {
      const tasks: PCWorkCalendarTaskCard[] = [];
      for (const [key, row] of acc) {
        const [aId, dKey, tId] = key.split('|');
        if (Number(aId) !== actor.actorId || dKey !== dateKey) continue;
        const backlogItemId = Number(tId);
        const item = params.backlogById.get(backlogItemId);
        const taskEstimatedHours = item?.estimatedHours ?? 0;
        tasks.push({
          backlogItemId,
          code: item?.code ?? `#${backlogItemId}`,
          title: item?.title ?? '',
          taskEstimatedHours: round2(taskEstimatedHours),
          plannedEstimatedHours: round2(row.plannedEstimatedHours),
          actualHours: round2(row.actualHours),
          timeEntryIds: [...row.timeEntryIds],
          fromPlan: row.fromPlan,
        });
      }
      tasks.sort((a, b) => a.code.localeCompare(b.code));
      cells.push({
        actorId: actor.actorId,
        date: dateKey,
        tasks,
        totalPlannedHours: round2(
          tasks.reduce((s, t) => s + t.plannedEstimatedHours, 0),
        ),
        totalActualHours: round2(
          tasks.reduce((s, t) => s + t.actualHours, 0),
        ),
      });
    }
  }

  return {
    projectId: params.projectId,
    fromDate,
    toDate,
    workingDays: params.workingDays,
    days,
    actors: params.actors,
    cells,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
