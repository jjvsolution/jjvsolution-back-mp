import { Injectable } from '@nestjs/common';
import {
  PCBacklogItemsRepository,
  PCProjectMembersRepository,
  PCSprintsRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import {
  PCBacklogStatus,
  PCBacklogType,
  PCPriority,
  Prisma,
} from '@prisma/client';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCHistoryBusiness } from './pcHistory.business';

export type PCBacklogCreateInput = {
  projectId: number;
  sprintId?: number | null;
  parentId?: number | null;
  code: string;
  type: PCBacklogType;
  title: string;
  description?: string | null;
  acceptanceCriteria?: string | null;
  priority?: PCPriority;
  status?: PCBacklogStatus;
  storyPoints?: number | null;
  estimatedHours?: number;
  remainingHours?: number | null;
  responsibleId?: number | null;
  sortOrder?: number;
};

@Injectable()
export class PCBacklogBusiness extends ResponseClass {
  constructor(
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcSprintsRepository: PCSprintsRepository,
    private readonly pcProjectsBusiness: PCProjectsBusiness,
    private readonly pcHistoryBusiness: PCHistoryBusiness,
  ) {
    super();
  }

  private async assertNoHierarchyCycle(
    projectId: number,
    itemId: number | null,
    parentId: number | null,
  ) {
    if (!parentId) return;
    if (itemId && parentId === itemId) {
      this.badRequest('PC_BACKLOG_HIERARCHY_CYCLE');
    }
    let current: number | null = parentId;
    const visited = new Set<number>();
    while (current) {
      if (itemId && current === itemId) {
        this.badRequest('PC_BACKLOG_HIERARCHY_CYCLE');
      }
      if (visited.has(current)) break;
      visited.add(current);
      const parent = await this.pcBacklogItemsRepository.db.findFirst({
        where: { id: current, projectId, isDeleted: false },
        select: { parentId: true },
      });
      current = parent?.parentId ?? null;
    }
  }

  private async assertResponsibleMember(
    projectId: number,
    companyId: number,
    responsibleId?: number | null,
  ) {
    if (!responsibleId) return;
    const member = await this.pcProjectMembersRepository.db.findFirst({
      where: {
        projectId,
        companyId,
        actorId: responsibleId,
        active: true,
        isDeleted: false,
      },
    });
    if (!member) this.badRequest('PC_BACKLOG_RESPONSIBLE_NOT_MEMBER');
  }

  async findAll(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    filters?: {
      sprintId?: number;
      type?: PCBacklogType;
      status?: PCBacklogStatus;
      priority?: PCPriority;
      responsibleId?: number;
      search?: string;
    },
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    return this.pcBacklogItemsRepository.db.findMany({
      where: {
        projectId,
        companyId,
        isDeleted: false,
        ...(filters?.sprintId !== undefined
          ? { sprintId: filters.sprintId }
          : {}),
        ...(filters?.type ? { type: filters.type } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.priority ? { priority: filters.priority } : {}),
        ...(filters?.responsibleId
          ? { responsibleId: filters.responsibleId }
          : {}),
        ...(filters?.search
          ? {
              OR: [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { code: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async findById(
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
    const item = await this.pcBacklogItemsRepository.db.findFirst({
      where: { id, projectId, companyId, isDeleted: false },
    });
    if (!item) this.notFound('PC_BACKLOG_NOT_FOUND');
    return item;
  }

  async createItem(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    data: PCBacklogCreateInput,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      data.projectId,
    );
    if ((data.estimatedHours ?? 0) < 0) {
      this.badRequest('PC_BACKLOG_HOURS_INVALID');
    }
    if (data.type === PCBacklogType.SUBTAREA && !data.parentId) {
      this.badRequest('PC_BACKLOG_SUBTASK_REQUIRES_PARENT');
    }
    await this.assertNoHierarchyCycle(data.projectId, null, data.parentId ?? null);
    await this.assertResponsibleMember(
      data.projectId,
      companyId,
      data.responsibleId,
    );
    if (data.sprintId) {
      const sprint = await this.pcSprintsRepository.db.findFirst({
        where: {
          id: data.sprintId,
          projectId: data.projectId,
          companyId,
          isDeleted: false,
        },
      });
      if (!sprint) this.badRequest('PC_SPRINT_NOT_FOUND');
    }
    if (data.parentId) {
      const parent = await this.pcBacklogItemsRepository.db.findFirst({
        where: {
          id: data.parentId,
          projectId: data.projectId,
          companyId,
          isDeleted: false,
        },
      });
      if (!parent) this.badRequest('PC_BACKLOG_PARENT_NOT_FOUND');
    }

    const duplicate = await this.pcBacklogItemsRepository.db.findFirst({
      where: {
        projectId: data.projectId,
        code: data.code,
        isDeleted: false,
      },
    });
    if (duplicate) this.badRequest('PC_BACKLOG_CODE_DUPLICATE');

    const item = await this.pcBacklogItemsRepository.db.create({
      data: {
        companyId,
        userId: ownerUserId,
        projectId: data.projectId,
        sprintId: data.sprintId ?? null,
        parentId: data.parentId ?? null,
        code: data.code,
        type: data.type,
        title: data.title,
        description: data.description ?? null,
        acceptanceCriteria: data.acceptanceCriteria ?? null,
        priority: data.priority ?? PCPriority.MEDIA,
        status: data.status ?? PCBacklogStatus.PENDIENTE,
        storyPoints: data.storyPoints ?? null,
        estimatedHours: data.estimatedHours ?? 0,
        remainingHours: data.remainingHours ?? data.estimatedHours ?? 0,
        responsibleId: data.responsibleId ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: ownerUserId,
      projectId: data.projectId,
      entityType: 'PCBacklogItems',
      entityId: item.id,
      action: 'CREATE',
    });

    return item;
  }

  async update(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
    data: Partial<PCBacklogCreateInput>,
  ) {
    const current = await this.findById(companyId, userId, projectId, id);
    if (data.estimatedHours !== undefined && data.estimatedHours < 0) {
      this.badRequest('PC_BACKLOG_HOURS_INVALID');
    }
    if (data.parentId !== undefined) {
      await this.assertNoHierarchyCycle(projectId, id, data.parentId);
    }
    if (data.responsibleId !== undefined) {
      await this.assertResponsibleMember(
        projectId,
        companyId,
        data.responsibleId,
      );
    }

    const updated = await this.pcBacklogItemsRepository.db.update({
      where: { id },
      data: {
        ...(data.sprintId !== undefined ? { sprintId: data.sprintId } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.acceptanceCriteria !== undefined
          ? { acceptanceCriteria: data.acceptanceCriteria }
          : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.storyPoints !== undefined
          ? { storyPoints: data.storyPoints }
          : {}),
        ...(data.estimatedHours !== undefined
          ? { estimatedHours: data.estimatedHours }
          : {}),
        ...(data.remainingHours !== undefined
          ? { remainingHours: data.remainingHours }
          : {}),
        ...(data.responsibleId !== undefined
          ? { responsibleId: data.responsibleId }
          : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
      } as Prisma.PCBacklogItemsUpdateInput,
    });

    if (data.status && data.status !== current.status) {
      await this.pcHistoryBusiness.log({
        companyId,
        userId: userId ?? current.userId,
        projectId,
        entityType: 'PCBacklogItems',
        entityId: id,
        action: 'STATUS_CHANGE',
        fieldName: 'status',
        oldValue: current.status,
        newValue: data.status,
      });
    }
    if (
      data.responsibleId !== undefined &&
      data.responsibleId !== current.responsibleId
    ) {
      await this.pcHistoryBusiness.log({
        companyId,
        userId: userId ?? current.userId,
        projectId,
        entityType: 'PCBacklogItems',
        entityId: id,
        action: 'ASSIGNEE_CHANGE',
        fieldName: 'responsibleId',
        oldValue: String(current.responsibleId ?? ''),
        newValue: String(data.responsibleId ?? ''),
      });
    }
    if (
      data.estimatedHours !== undefined &&
      data.estimatedHours !== current.estimatedHours
    ) {
      await this.pcHistoryBusiness.log({
        companyId,
        userId: userId ?? current.userId,
        projectId,
        entityType: 'PCBacklogItems',
        entityId: id,
        action: 'HOURS_CHANGE',
        fieldName: 'estimatedHours',
        oldValue: String(current.estimatedHours),
        newValue: String(data.estimatedHours),
      });
    }
    if (data.sprintId !== undefined && data.sprintId !== current.sprintId) {
      await this.pcHistoryBusiness.log({
        companyId,
        userId: userId ?? current.userId,
        projectId,
        entityType: 'PCBacklogItems',
        entityId: id,
        action: 'SPRINT_CHANGE',
        fieldName: 'sprintId',
        oldValue: String(current.sprintId ?? ''),
        newValue: String(data.sprintId ?? ''),
      });
    }

    return updated;
  }

  async reorder(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    orderedIds: number[],
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    for (let i = 0; i < orderedIds.length; i++) {
      await this.pcBacklogItemsRepository.db.updateMany({
        where: { id: orderedIds[i], projectId, companyId, isDeleted: false },
        data: { sortOrder: i },
      });
    }
    return this.findAll(companyId, userId, projectId);
  }

  async softDelete(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
  ) {
    await this.findById(companyId, userId, projectId, id);
    return this.pcBacklogItemsRepository.db.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
