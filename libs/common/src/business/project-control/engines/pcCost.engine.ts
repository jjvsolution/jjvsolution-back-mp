export type PCCostTask = {
  id: number;
  code: string;
  type: string;
  estimatedHours: number;
  remainingHours?: number | null;
  responsibleId?: number | null;
  hourlyCost?: number | null;
  sprintId?: number | null;
  parentId?: number | null;
  epicId?: number | null;
};

export type PCCostMember = {
  actorId: number;
  projectHourlyCost: number;
  projectRole: string;
};

export type PCCostTimeEntry = {
  actorId: number;
  backlogItemId: number;
  calculatedCost: number;
  hours: number;
};

export type PCQaRuleInput = {
  calcType:
    | 'HORAS_FIJAS'
    | 'PORCENTAJE_HORAS_DESARROLLO'
    | 'HORAS_POR_TAREA'
    | 'HORAS_POR_ACTOR';
  value: number;
  actorScope:
    | 'TODOS_LOS_ACTORES'
    | 'SOLO_DESARROLLADORES'
    | 'ACTORES_SELECCIONADOS'
    | 'CANTIDAD_MANUAL';
  qaActorHourlyCost?: number | null;
  selectedActorIds?: number[];
};

export type PCCostSummary = {
  estimatedCost: number;
  realCost: number;
  pendingCost: number;
  projectedFinalCost: number;
  budget: number | null;
  monetaryDeviation: number | null;
  percentDeviation: number | null;
  qaHours: number;
  qaCost: number | null;
  contingency: number;
  byActor: Array<{ actorId: number; estimated: number; real: number }>;
  bySprint: Array<{ sprintId: number | null; estimated: number; real: number }>;
  byEpic: Array<{ epicId: number | null; estimated: number; real: number }>;
  byType: Array<{ type: string; estimated: number; real: number }>;
  warnings: string[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class PCCostEngine {
  calculate(params: {
    tasks: PCCostTask[];
    members: PCCostMember[];
    timeEntries: PCCostTimeEntry[];
    qaRules: PCQaRuleInput[];
    contingencyPercent: number;
    budget?: number | null;
  }): PCCostSummary {
    const warnings: string[] = [];
    const memberCost = new Map(
      params.members.map((m) => [m.actorId, m.projectHourlyCost]),
    );

    let estimatedTasks = 0;
    const byActor = new Map<number, { estimated: number; real: number }>();
    const bySprint = new Map<
      number | null,
      { estimated: number; real: number }
    >();
    const byEpic = new Map<number | null, { estimated: number; real: number }>();
    const byType = new Map<string, { estimated: number; real: number }>();

    const bump = (
      map: Map<string | number | null, { estimated: number; real: number }>,
      key: string | number | null,
      field: 'estimated' | 'real',
      amount: number,
    ) => {
      const current = map.get(key) ?? { estimated: 0, real: 0 };
      current[field] += amount;
      map.set(key, current);
    };

    for (const task of params.tasks) {
      const rate =
        task.hourlyCost ??
        (task.responsibleId != null
          ? memberCost.get(task.responsibleId)
          : undefined);
      if (rate == null) {
        warnings.push(`La tarea ${task.code} tiene costo incompleto (falta tarifa)`);
        continue;
      }
      const cost = task.estimatedHours * rate;
      estimatedTasks += cost;
      if (task.responsibleId != null) {
        bump(byActor, task.responsibleId, 'estimated', cost);
      }
      bump(bySprint, task.sprintId ?? null, 'estimated', cost);
      bump(byEpic, task.epicId ?? null, 'estimated', cost);
      bump(byType, task.type, 'estimated', cost);
    }

    const developmentHours = params.tasks
      .filter((t) => t.type !== 'BUG')
      .reduce((s, t) => s + t.estimatedHours, 0);

    let qaHours = 0;
    let qaCost: number | null = 0;
    for (const rule of params.qaRules) {
      let applicableActors = params.members;
      if (rule.actorScope === 'SOLO_DESARROLLADORES') {
        applicableActors = params.members.filter(
          (m) => m.projectRole === 'DEVELOPER',
        );
      } else if (rule.actorScope === 'ACTORES_SELECCIONADOS') {
        const selected = new Set(rule.selectedActorIds ?? []);
        applicableActors = params.members.filter((m) =>
          selected.has(m.actorId),
        );
      }

      let hours = 0;
      switch (rule.calcType) {
        case 'HORAS_FIJAS':
          hours = rule.value;
          break;
        case 'HORAS_POR_ACTOR':
          hours = rule.value * applicableActors.length;
          break;
        case 'PORCENTAJE_HORAS_DESARROLLO':
          hours = (developmentHours * rule.value) / 100;
          break;
        case 'HORAS_POR_TAREA':
          hours = rule.value * params.tasks.length;
          break;
      }
      qaHours += hours;
      if (rule.qaActorHourlyCost == null) {
        warnings.push('Costo QA pendiente: falta la tarifa horaria del actor QA');
        qaCost = null;
      } else if (qaCost != null) {
        qaCost += hours * rule.qaActorHourlyCost;
      }
    }

    const subtotal =
      estimatedTasks + (qaCost ?? 0);
    const contingency = (subtotal * params.contingencyPercent) / 100;
    const estimatedCost = subtotal + contingency;

    let realCost = 0;
    for (const entry of params.timeEntries) {
      realCost += entry.calculatedCost;
      bump(byActor, entry.actorId, 'real', entry.calculatedCost);
      const task = params.tasks.find((t) => t.id === entry.backlogItemId);
      bump(bySprint, task?.sprintId ?? null, 'real', entry.calculatedCost);
      bump(byEpic, task?.epicId ?? null, 'real', entry.calculatedCost);
      bump(byType, task?.type ?? 'UNKNOWN', 'real', entry.calculatedCost);
    }

    let pendingCost = 0;
    for (const task of params.tasks) {
      const remaining =
        task.remainingHours != null
          ? task.remainingHours
          : Math.max(0, task.estimatedHours);
      const rate =
        task.hourlyCost ??
        (task.responsibleId != null
          ? memberCost.get(task.responsibleId)
          : undefined);
      if (rate == null) continue;
      pendingCost += remaining * rate;
    }

    const projectedFinalCost =
      realCost + pendingCost + (qaCost ?? 0) + contingency;
    const budget = params.budget ?? null;
    const monetaryDeviation =
      budget != null ? projectedFinalCost - budget : null;
    const percentDeviation =
      budget != null && budget !== 0
        ? ((projectedFinalCost - budget) / budget) * 100
        : null;

    return {
      estimatedCost: round2(estimatedCost),
      realCost: round2(realCost),
      pendingCost: round2(pendingCost),
      projectedFinalCost: round2(projectedFinalCost),
      budget,
      monetaryDeviation:
        monetaryDeviation != null ? round2(monetaryDeviation) : null,
      percentDeviation:
        percentDeviation != null ? round2(percentDeviation) : null,
      qaHours: round2(qaHours),
      qaCost: qaCost != null ? round2(qaCost) : null,
      contingency: round2(contingency),
      byActor: [...byActor.entries()].map(([actorId, v]) => ({
        actorId: actorId as number,
        estimated: round2(v.estimated),
        real: round2(v.real),
      })),
      bySprint: [...bySprint.entries()].map(([sprintId, v]) => ({
        sprintId,
        estimated: round2(v.estimated),
        real: round2(v.real),
      })),
      byEpic: [...byEpic.entries()].map(([epicId, v]) => ({
        epicId,
        estimated: round2(v.estimated),
        real: round2(v.real),
      })),
      byType: [...byType.entries()].map(([type, v]) => ({
        type: String(type),
        estimated: round2(v.estimated),
        real: round2(v.real),
      })),
      warnings,
    };
  }
}
