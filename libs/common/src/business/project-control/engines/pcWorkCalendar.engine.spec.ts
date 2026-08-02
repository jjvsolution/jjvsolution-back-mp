import {
  buildWorkCalendar,
  eachDateKey,
  isWorkingDateKey,
  plannedHoursForDayIndex,
  toDateKey,
} from './pcWorkCalendar.engine';

describe('pcWorkCalendar.engine', () => {
  it('builds ISO date keys and day ranges', () => {
    expect(toDateKey('2026-07-10')).toBe('2026-07-10');
    expect(eachDateKey('2026-07-10', '2026-07-12')).toEqual([
      '2026-07-10',
      '2026-07-11',
      '2026-07-12',
    ]);
    expect(isWorkingDateKey('2026-07-10', '1,2,3,4,5')).toBe(true); // Friday
    expect(isWorkingDateKey('2026-07-11', '1,2,3,4,5')).toBe(false); // Saturday
  });

  it('allocates hours by exclusive endDayIndex (1-day task only on start day)', () => {
    expect(
      plannedHoursForDayIndex({
        dayIndex: 0,
        startDayIndex: 0,
        endDayIndex: 1,
        estimatedHours: 8,
        durationDays: 1,
      }),
    ).toBe(8);
    expect(
      plannedHoursForDayIndex({
        dayIndex: 1,
        startDayIndex: 0,
        endDayIndex: 1,
        estimatedHours: 8,
        durationDays: 1,
      }),
    ).toBe(0);
  });

  it('prorates multi-day tasks onto consecutive working days', () => {
    const result = buildWorkCalendar({
      projectId: 1,
      fromDate: '2026-07-06',
      toDate: '2026-07-12',
      projectStartDate: '2026-07-06',
      workingDays: '1,2,3,4,5',
      actors: [{ actorId: 10, name: 'Actor 1', dailyCapacity: 8 }],
      backlogById: new Map([
        [1, { code: 'T-1', title: 'Task one', estimatedHours: 16 }],
      ]),
      plannedTasks: [
        {
          taskId: 1,
          code: 'T-1',
          responsibleId: 10,
          startDate: '2026-07-06',
          endDate: '2026-07-08',
          durationDays: 2,
          startDayIndex: 0,
          endDayIndex: 2,
        },
      ],
      timeEntries: [],
    });

    const mon = result.cells.find((c) => c.date === '2026-07-06');
    const tue = result.cells.find((c) => c.date === '2026-07-07');
    const wed = result.cells.find((c) => c.date === '2026-07-08');
    const sat = result.cells.find((c) => c.date === '2026-07-11');

    expect(mon?.tasks[0].plannedEstimatedHours).toBe(8);
    expect(mon?.tasks[0].taskEstimatedHours).toBe(16);
    expect(tue?.tasks[0].plannedEstimatedHours).toBe(8);
    expect(wed?.tasks.length).toBe(0);
    expect(sat?.tasks.length).toBe(0);
    expect(mon?.totalPlannedHours).toBe(8);
  });

  it('merges actual hours and keeps orphan entries outside plan', () => {
    const result = buildWorkCalendar({
      projectId: 1,
      fromDate: '2026-07-10',
      toDate: '2026-07-10',
      projectStartDate: '2026-07-06',
      workingDays: '1,2,3,4,5',
      actors: [{ actorId: 10, name: 'Actor 1', dailyCapacity: 8 }],
      backlogById: new Map([
        [1, { code: 'T-1', title: 'Planned', estimatedHours: 8 }],
        [2, { code: 'T-2', title: 'Orphan', estimatedHours: 4 }],
      ]),
      plannedTasks: [
        {
          taskId: 1,
          code: 'T-1',
          responsibleId: 10,
          startDate: '2026-07-10',
          endDate: '2026-07-13',
          durationDays: 1,
          startDayIndex: 4,
          endDayIndex: 5,
        },
      ],
      timeEntries: [
        {
          id: 100,
          actorId: 10,
          backlogItemId: 1,
          date: '2026-07-10T12:00:00.000Z',
          hours: 5,
        },
        {
          id: 101,
          actorId: 10,
          backlogItemId: 2,
          date: '2026-07-10T12:00:00.000Z',
          hours: 2,
        },
      ],
    });

    const cell = result.cells.find(
      (c) => c.actorId === 10 && c.date === '2026-07-10',
    );
    expect(cell?.tasks).toHaveLength(2);

    const planned = cell?.tasks.find((t) => t.backlogItemId === 1);
    const orphan = cell?.tasks.find((t) => t.backlogItemId === 2);

    expect(planned).toMatchObject({
      taskEstimatedHours: 8,
      plannedEstimatedHours: 8,
      actualHours: 5,
      fromPlan: true,
      timeEntryIds: [100],
    });
    expect(orphan).toMatchObject({
      taskEstimatedHours: 4,
      plannedEstimatedHours: 0,
      actualHours: 2,
      fromPlan: false,
      timeEntryIds: [101],
    });
    expect(cell?.totalPlannedHours).toBe(8);
    expect(cell?.totalActualHours).toBe(7);
  });
});
