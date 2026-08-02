import { Injectable } from '@nestjs/common';
import {
  PCBacklogItemsRepository,
  PCProjectMembersRepository,
  PCTimeEntriesRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCHistoryBusiness } from './pcHistory.business';

@Injectable()
export class PCTimeEntriesBusiness extends ResponseClass {
  constructor(
    private readonly pcTimeEntriesRepository: PCTimeEntriesRepository,
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
    filters?: {
      actorId?: number;
      backlogItemId?: number;
      fromDate?: Date | string;
      toDate?: Date | string;
    },
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const dateFilter =
      filters?.fromDate || filters?.toDate
        ? {
            date: {
              ...(filters.fromDate
                ? { gte: new Date(filters.fromDate) }
                : {}),
              ...(filters.toDate ? { lte: new Date(filters.toDate) } : {}),
            },
          }
        : {};
    return this.pcTimeEntriesRepository.db.findMany({
      where: {
        projectId,
        companyId,
        isDeleted: false,
        ...(filters?.actorId ? { actorId: filters.actorId } : {}),
        ...(filters?.backlogItemId
          ? { backlogItemId: filters.backlogItemId }
          : {}),
        ...dateFilter,
      },
      orderBy: { date: 'desc' },
    });
  }

  async createEntry(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    data: {
      projectId: number;
      backlogItemId: number;
      actorId: number;
      date: Date | string;
      hours: number;
      description?: string | null;
      billable?: boolean;
    },
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      data.projectId,
    );
    if (data.hours <= 0) this.badRequest('PC_TIME_HOURS_INVALID');

    const [item, member] = await Promise.all([
      this.pcBacklogItemsRepository.db.findFirst({
        where: {
          id: data.backlogItemId,
          projectId: data.projectId,
          companyId,
          isDeleted: false,
        },
      }),
      this.pcProjectMembersRepository.db.findFirst({
        where: {
          projectId: data.projectId,
          actorId: data.actorId,
          companyId,
          active: true,
          isDeleted: false,
        },
      }),
    ]);
    if (!item) this.badRequest('PC_BACKLOG_NOT_FOUND');
    if (!member) this.badRequest('PC_MEMBER_NOT_FOUND');

    const appliedHourlyCost = member.projectHourlyCost;
    const calculatedCost = data.hours * appliedHourlyCost;

    const entry = await this.pcTimeEntriesRepository.db.create({
      data: {
        companyId,
        userId: ownerUserId,
        projectId: data.projectId,
        backlogItemId: data.backlogItemId,
        actorId: data.actorId,
        date: new Date(data.date),
        hours: data.hours,
        description: data.description ?? null,
        billable: data.billable ?? true,
        appliedHourlyCost,
        calculatedCost,
      },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: ownerUserId,
      projectId: data.projectId,
      entityType: 'PCTimeEntries',
      entityId: entry.id,
      action: 'CREATE',
    });

    return entry;
  }

  async update(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
    data: {
      hours?: number;
      description?: string | null;
      billable?: boolean;
      date?: Date | string;
    },
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    const entry = await this.pcTimeEntriesRepository.db.findFirst({
      where: { id, projectId, companyId, isDeleted: false },
    });
    if (!entry) this.notFound('PC_TIME_ENTRY_NOT_FOUND');
    if (data.hours !== undefined && data.hours <= 0) {
      this.badRequest('PC_TIME_HOURS_INVALID');
    }
    const hours = data.hours ?? entry.hours;
    return this.pcTimeEntriesRepository.db.update({
      where: { id },
      data: {
        hours,
        calculatedCost: hours * entry.appliedHourlyCost,
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.billable !== undefined ? { billable: data.billable } : {}),
        ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
      },
    });
  }

  async softDelete(
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
    const entry = await this.pcTimeEntriesRepository.db.findFirst({
      where: { id, projectId, companyId, isDeleted: false },
    });
    if (!entry) this.notFound('PC_TIME_ENTRY_NOT_FOUND');
    return this.pcTimeEntriesRepository.db.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async summaryByActor(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const entries = await this.list(companyId, userId, projectId);
    const map = new Map<number, { hours: number; cost: number }>();
    for (const e of entries) {
      const cur = map.get(e.actorId) ?? { hours: 0, cost: 0 };
      cur.hours += e.hours;
      cur.cost += e.calculatedCost;
      map.set(e.actorId, cur);
    }
    return [...map.entries()].map(([actorId, v]) => ({
      actorId,
      hours: v.hours,
      cost: v.cost,
    }));
  }
}
