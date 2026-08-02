import { PCPlanningEngine, buildActorLoads } from './pcPlanning.engine';

describe('PCPlanningEngine', () => {
  const engine = new PCPlanningEngine();

  it('detects circular dependency', () => {
    const result = engine.validateGraph(
      [
        { id: 1, code: 'A', estimatedHours: 8 },
        { id: 2, code: 'B', estimatedHours: 8 },
      ],
      [
        { predecessorId: 1, successorId: 2 },
        { predecessorId: 2, successorId: 1 },
      ],
    );
    expect(result.hasCycle).toBe(true);
    expect(result.cycleTaskIds.sort()).toEqual([1, 2]);
  });

  it('returns topological order for DAG', () => {
    const result = engine.validateGraph(
      [
        { id: 1, code: 'A', estimatedHours: 8 },
        { id: 2, code: 'B', estimatedHours: 8 },
        { id: 3, code: 'C', estimatedHours: 8 },
      ],
      [
        { predecessorId: 1, successorId: 2 },
        { predecessorId: 2, successorId: 3 },
      ],
    );
    expect(result.hasCycle).toBe(false);
    expect(result.topologicalOrder).toEqual([1, 2, 3]);
  });

  it('computes critical path for simple chain', () => {
    const result = engine.calculateCriticalPath({
      tasks: [
        { id: 1, code: 'A', estimatedHours: 8, responsibleId: 10, dailyCapacity: 8 },
        { id: 2, code: 'B', estimatedHours: 16, responsibleId: 10, dailyCapacity: 8 },
      ],
      dependencies: [{ predecessorId: 1, successorId: 2 }],
      projectStartDate: new Date('2026-01-05'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
    });
    expect(result.totalWorkingDays).toBe(3);
    expect(result.criticalTaskCodes).toEqual(['A', 'B']);
  });

  it('adjusts duration by dedication percent', () => {
    const result = engine.calculateCriticalPath({
      tasks: [
        {
          id: 1,
          code: 'A',
          estimatedHours: 8,
          responsibleId: 1,
          dailyCapacity: 4, // 50% of 8h
        },
      ],
      dependencies: [],
      projectStartDate: new Date('2026-01-05'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
    });
    expect(result.tasks[0].durationDays).toBe(2);
  });

  it('serializes tasks of same actor in adjusted plan', () => {
    const result = engine.calculateResourceAdjustedPlan({
      tasks: [
        { id: 1, code: 'A', estimatedHours: 8, responsibleId: 7, dailyCapacity: 8 },
        { id: 2, code: 'B', estimatedHours: 8, responsibleId: 7, dailyCapacity: 8 },
      ],
      dependencies: [],
      projectStartDate: new Date('2026-01-05'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
    });
    expect(result.tasks).toHaveLength(2);
    const a = result.tasks.find((t) => t.code === 'A')!;
    const b = result.tasks.find((t) => t.code === 'B')!;
    expect(b.startDayIndex).toBeGreaterThanOrEqual(a.endDayIndex);
  });

  it('packs leftover same-day hours before later-gated work of the same actor', () => {
    // Mirrors graph: 4→1→8 and 4→3→5; JV owns 1,8,5; DZ owns 4,3.
    // Old topo order could schedule 5 before 8 and leave a gap after 1.
    const result = engine.calculateResourceAdjustedPlan({
      tasks: [
        { id: 4, code: 'T4', estimatedHours: 8, responsibleId: 20, dailyCapacity: 8 },
        { id: 3, code: 'T3', estimatedHours: 16, responsibleId: 20, dailyCapacity: 8 },
        { id: 1, code: 'T1', estimatedHours: 2, responsibleId: 10, dailyCapacity: 8 },
        { id: 8, code: 'T8', estimatedHours: 3, responsibleId: 10, dailyCapacity: 8 },
        { id: 5, code: 'T5', estimatedHours: 4, responsibleId: 10, dailyCapacity: 8 },
      ],
      dependencies: [
        { predecessorId: 4, successorId: 1 },
        { predecessorId: 1, successorId: 8 },
        { predecessorId: 4, successorId: 3 },
        { predecessorId: 3, successorId: 5 },
      ],
      projectStartDate: new Date('2026-07-27'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
      criticalTaskIds: [4, 3, 5],
    });

    const t1 = result.tasks.find((t) => t.taskId === 1)!;
    const t8 = result.tasks.find((t) => t.taskId === 8)!;
    const t5 = result.tasks.find((t) => t.taskId === 5)!;
    const t3 = result.tasks.find((t) => t.taskId === 3)!;

    // After short T1, T8 starts immediately (same fractional day), not after T5.
    expect(t8.startDayIndex).toBeCloseTo(t1.endDayIndex, 5);
    expect(t8.startDayIndex).toBeLessThan(t5.startDayIndex);
    // T5 still waits for T3.
    expect(t5.startDayIndex).toBeGreaterThanOrEqual(t3.endDayIndex);
  });

  it('allows parallel tasks for different actors', () => {
    const result = engine.calculateResourceAdjustedPlan({
      tasks: [
        { id: 1, code: 'A', estimatedHours: 8, responsibleId: 1, dailyCapacity: 8 },
        { id: 2, code: 'B', estimatedHours: 8, responsibleId: 2, dailyCapacity: 8 },
      ],
      dependencies: [],
      projectStartDate: new Date('2026-01-05'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
    });
    const a = result.tasks.find((t) => t.code === 'A')!;
    const b = result.tasks.find((t) => t.code === 'B')!;
    expect(a.startDate.getTime()).toBe(b.startDate.getTime());
  });

  it('delays tasks when actor is unavailable', () => {
    const baseline = engine.calculateResourceAdjustedPlan({
      tasks: [
        { id: 1, code: 'A', estimatedHours: 8, responsibleId: 1, dailyCapacity: 8 },
      ],
      dependencies: [],
      projectStartDate: new Date('2026-01-05'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
    });
    const withAbsence = engine.calculateResourceAdjustedPlan({
      tasks: [
        { id: 1, code: 'A', estimatedHours: 8, responsibleId: 1, dailyCapacity: 8 },
      ],
      dependencies: [],
      projectStartDate: new Date('2026-01-05'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
      actorUnavailability: [{ actorId: 1, fromDayIndex: 0, toDayIndex: 3 }],
    });
    expect(withAbsence.tasks[0].startDayIndex).toBeGreaterThanOrEqual(3);
    expect(withAbsence.totalWorkingDays).toBeGreaterThan(baseline.totalWorkingDays);
  });

  it('reports actor load utilization', () => {
    const result = engine.calculateResourceAdjustedPlan({
      tasks: [
        { id: 1, code: 'A', estimatedHours: 40, responsibleId: 1, dailyCapacity: 8 },
        { id: 2, code: 'B', estimatedHours: 8, responsibleId: 2, dailyCapacity: 8 },
      ],
      dependencies: [],
      projectStartDate: new Date('2026-01-05'),
      workingHoursPerDay: 8,
      workingDays: '1,2,3,4,5',
      capacityByActor: new Map([
        [1, 8],
        [2, 8],
      ]),
    });
    // Utilization vs tight (ideal-like) window exposes overload.
    const loads = buildActorLoads({
      tasks: [
        { id: 1, code: 'A', estimatedHours: 40, responsibleId: 1, dailyCapacity: 8 },
        { id: 2, code: 'B', estimatedHours: 8, responsibleId: 2, dailyCapacity: 8 },
      ],
      scheduled: result.tasks,
      totalWorkingDays: 3,
      workingHoursPerDay: 8,
      capacityByActor: new Map([
        [1, 8],
        [2, 8],
      ]),
    });
    const actor1 = loads.find((l) => l.actorId === 1)!;
    const actor2 = loads.find((l) => l.actorId === 2)!;
    expect(actor1.assignedHours).toBe(40);
    expect(actor1.utilizationPercent).toBeGreaterThan(100);
    expect(actor1.status).toBe('OVERLOADED');
    expect(actor2.status).toBe('AVAILABLE');
  });
});
