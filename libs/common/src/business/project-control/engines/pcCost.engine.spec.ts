import { PCCostEngine } from './pcCost.engine';

describe('PCCostEngine', () => {
  const engine = new PCCostEngine();

  const base = {
    tasks: [
      {
        id: 1,
        code: 'T1',
        type: 'TAREA',
        estimatedHours: 10,
        remainingHours: 4,
        responsibleId: 1,
        hourlyCost: 20,
        sprintId: 1,
        epicId: 100,
      },
    ],
    members: [{ actorId: 1, projectHourlyCost: 20, projectRole: 'DEVELOPER' }],
    timeEntries: [
      { actorId: 1, backlogItemId: 1, calculatedCost: 120, hours: 6 },
    ],
    qaRules: [] as never[],
    contingencyPercent: 10,
    budget: 500,
  };

  it('calculates estimated cost from tasks', () => {
    const result = engine.calculate({ ...base, timeEntries: [], qaRules: [] });
    // 10h * 20 = 200 + contingency 20 = 220
    expect(result.estimatedCost).toBe(220);
  });

  it('calculates fixed QA hours and cost', () => {
    const result = engine.calculate({
      ...base,
      timeEntries: [],
      qaRules: [
        {
          calcType: 'HORAS_FIJAS',
          value: 5,
          actorScope: 'TODOS_LOS_ACTORES',
          qaActorHourlyCost: 15,
        },
      ],
    });
    expect(result.qaHours).toBe(5);
    expect(result.qaCost).toBe(75);
  });

  it('multiplies QA by actors', () => {
    const result = engine.calculate({
      ...base,
      members: [
        { actorId: 1, projectHourlyCost: 20, projectRole: 'DEVELOPER' },
        { actorId: 2, projectHourlyCost: 20, projectRole: 'DEVELOPER' },
      ],
      timeEntries: [],
      qaRules: [
        {
          calcType: 'HORAS_POR_ACTOR',
          value: 2,
          actorScope: 'TODOS_LOS_ACTORES',
          qaActorHourlyCost: 10,
        },
      ],
    });
    expect(result.qaHours).toBe(4);
    expect(result.qaCost).toBe(40);
  });

  it('applies contingency percent', () => {
    const result = engine.calculate({
      ...base,
      contingencyPercent: 20,
      timeEntries: [],
      qaRules: [],
    });
    expect(result.contingency).toBe(40);
    expect(result.estimatedCost).toBe(240);
  });

  it('uses real cost from time entries', () => {
    const result = engine.calculate(base);
    expect(result.realCost).toBe(120);
  });

  it('projects final cost', () => {
    const result = engine.calculate(base);
    // real 120 + pending 4*20=80 + qa 0 + contingency on estimated
    expect(result.pendingCost).toBe(80);
    expect(result.projectedFinalCost).toBeGreaterThan(result.realCost);
  });
});
