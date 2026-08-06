import { Injectable } from '@nestjs/common';
import {
  PCActorsRepository,
  PCProjectMembersRepository,
  PCProjectResourcesRepository,
  PCProjectsRepository,
  PCBacklogItemsRepository,
  PCSprintsRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import {
  PCProjectMemberRole,
  PCProjectStatus,
  Prisma,
} from '@prisma/client';
import { PCHistoryBusiness } from './pcHistory.business';

export type PCProjectCreateInput = {
  companyId: number;
  code: string;
  name: string;
  clientName?: string | null;
  description?: string | null;
  startDate: Date | string;
  targetEndDate?: Date | string | null;
  currency?: string;
  workingHoursPerDay?: number;
  workingDays?: string;
  budget?: number | null;
  contingencyPercent?: number;
  productOwnerId?: number | null;
  scrumMasterId?: number | null;
};

export type PCProjectUpdateInput = Partial<
  Omit<PCProjectCreateInput, 'companyId' | 'code'>
> & { code?: string };

export type PCMemberCreateInput = {
  actorId: number;
  projectRole?: PCProjectMemberRole;
  projectHourlyCost?: number;
  dailyHours?: number;
  dedicationPercent?: number;
  startDate: Date | string;
  endDate?: Date | string | null;
};

export type PCResourceCreateInput = {
  name: string;
  url: string;
};

@Injectable()
export class PCProjectsBusiness extends ResponseClass {
  constructor(
    private readonly pcProjectsRepository: PCProjectsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcProjectResourcesRepository: PCProjectResourcesRepository,
    private readonly pcActorsRepository: PCActorsRepository,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcSprintsRepository: PCSprintsRepository,
    private readonly pcHistoryBusiness: PCHistoryBusiness,
  ) {
    super();
  }

  private scope(companyId: number, userId?: string) {
    return {
      companyId,
      isDeleted: false,
      ...(userId ? { userId } : {}),
    };
  }

  async assertProjectAccess(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const project = await this.pcProjectsRepository.db.findFirst({
      where: { id: projectId, ...this.scope(companyId, userId) },
    });
    if (!project) this.notFound('PC_PROJECT_NOT_FOUND');
    return project;
  }

  async findAll(companyId: number, userId: string | undefined) {
    return this.pcProjectsRepository.db.findMany({
      where: this.scope(companyId, userId),
      orderBy: { id: 'desc' },
    });
  }

  async findById(companyId: number, userId: string | undefined, id: number) {
    return this.assertProjectAccess(companyId, userId, id);
  }

  async createProject(ownerUserId: string, data: PCProjectCreateInput) {
    const exists = await this.pcProjectsRepository.db.findFirst({
      where: {
        companyId: data.companyId,
        code: data.code,
        isDeleted: false,
      },
    });
    if (exists) this.badRequest('PC_PROJECT_CODE_DUPLICATE');

    const project = await this.pcProjectsRepository.db.create({
      data: {
        companyId: data.companyId,
        userId: ownerUserId,
        code: data.code,
        name: data.name,
        clientName: data.clientName ?? null,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        targetEndDate: data.targetEndDate
          ? new Date(data.targetEndDate)
          : null,
        currency: data.currency ?? 'CLP',
        workingHoursPerDay: data.workingHoursPerDay ?? 8,
        workingDays: data.workingDays ?? '1,2,3,4,5',
        budget: data.budget ?? null,
        contingencyPercent: data.contingencyPercent ?? 0,
        productOwnerId: data.productOwnerId ?? null,
        scrumMasterId: data.scrumMasterId ?? null,
        status: PCProjectStatus.BORRADOR,
      },
    });

    await this.pcHistoryBusiness.log({
      companyId: project.companyId,
      userId: ownerUserId,
      projectId: project.id,
      entityType: 'PCProjects',
      entityId: project.id,
      action: 'CREATE',
    });

    return project;
  }

  async update(
    companyId: number,
    userId: string | undefined,
    id: number,
    data: PCProjectUpdateInput,
  ) {
    const project = await this.assertProjectAccess(companyId, userId, id);
    if (data.code && data.code !== project.code) {
      const exists = await this.pcProjectsRepository.db.findFirst({
        where: {
          companyId,
          code: data.code,
          isDeleted: false,
          NOT: { id },
        },
      });
      if (exists) this.badRequest('PC_PROJECT_CODE_DUPLICATE');
    }

    const updated = await this.pcProjectsRepository.db.update({
      where: { id },
      data: {
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.clientName !== undefined
          ? { clientName: data.clientName }
          : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.startDate !== undefined
          ? { startDate: new Date(data.startDate) }
          : {}),
        ...(data.targetEndDate !== undefined
          ? {
              targetEndDate: data.targetEndDate
                ? new Date(data.targetEndDate)
                : null,
            }
          : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.workingHoursPerDay !== undefined
          ? { workingHoursPerDay: data.workingHoursPerDay }
          : {}),
        ...(data.workingDays !== undefined
          ? { workingDays: data.workingDays }
          : {}),
        ...(data.budget !== undefined ? { budget: data.budget } : {}),
        ...(data.contingencyPercent !== undefined
          ? { contingencyPercent: data.contingencyPercent }
          : {}),
        ...(data.productOwnerId !== undefined
          ? { productOwnerId: data.productOwnerId }
          : {}),
        ...(data.scrumMasterId !== undefined
          ? { scrumMasterId: data.scrumMasterId }
          : {}),
      },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: userId ?? project.userId,
      projectId: id,
      entityType: 'PCProjects',
      entityId: id,
      action: 'UPDATE',
    });

    return updated;
  }

  async changeStatus(
    companyId: number,
    userId: string | undefined,
    id: number,
    status: PCProjectStatus,
  ) {
    const project = await this.assertProjectAccess(companyId, userId, id);
    const updated = await this.pcProjectsRepository.db.update({
      where: { id },
      data: { status },
    });
    await this.pcHistoryBusiness.log({
      companyId,
      userId: userId ?? project.userId,
      projectId: id,
      entityType: 'PCProjects',
      entityId: id,
      action: 'STATUS_CHANGE',
      fieldName: 'status',
      oldValue: project.status,
      newValue: status,
    });
    return updated;
  }

  async summary(companyId: number, userId: string | undefined, id: number) {
    const project = await this.assertProjectAccess(companyId, userId, id);
    const [membersCount, backlogCount, sprintsCount] = await Promise.all([
      this.pcProjectMembersRepository.db.count({
        where: { projectId: id, isDeleted: false, active: true },
      }),
      this.pcBacklogItemsRepository.db.count({
        where: { projectId: id, isDeleted: false },
      }),
      this.pcSprintsRepository.db.count({
        where: { projectId: id, isDeleted: false },
      }),
    ]);
    return {
      project,
      membersCount,
      backlogCount,
      sprintsCount,
    };
  }

  async listMembers(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    await this.assertProjectAccess(companyId, userId, projectId);
    return this.pcProjectMembersRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
      orderBy: { id: 'asc' },
    });
  }

  async addMember(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    projectId: number,
    data: PCMemberCreateInput,
  ) {
    await this.assertProjectAccess(companyId, scopeUserId, projectId);
    const actor = await this.pcActorsRepository.db.findFirst({
      where: {
        id: data.actorId,
        companyId,
        isDeleted: false,
        active: true,
        ...(scopeUserId ? { userId: scopeUserId } : {}),
      },
    });
    if (!actor) this.notFound('PC_ACTOR_NOT_FOUND');

    const duplicate = await this.pcProjectMembersRepository.db.findFirst({
      where: {
        projectId,
        actorId: data.actorId,
        active: true,
        isDeleted: false,
      },
    });
    if (duplicate) this.badRequest('PC_MEMBER_ALREADY_ACTIVE');

    const dedication = data.dedicationPercent ?? 100;
    if (dedication < 0 || dedication > 100) {
      this.badRequest('PC_MEMBER_DEDICATION_INVALID');
    }

    const member = await this.pcProjectMembersRepository.db.create({
      data: {
        companyId,
        userId: ownerUserId,
        projectId,
        actorId: data.actorId,
        projectRole: data.projectRole ?? PCProjectMemberRole.DEVELOPER,
        projectHourlyCost: data.projectHourlyCost ?? actor.defaultHourlyCost,
        dailyHours: data.dailyHours ?? actor.defaultDailyHours,
        dedicationPercent: dedication,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        active: true,
      },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: ownerUserId,
      projectId,
      entityType: 'PCProjectMembers',
      entityId: member.id,
      action: 'CREATE',
    });

    return member;
  }

  async updateMember(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    memberId: number,
    data: Partial<PCMemberCreateInput> & { active?: boolean },
  ) {
    await this.assertProjectAccess(companyId, userId, projectId);
    const member = await this.pcProjectMembersRepository.db.findFirst({
      where: { id: memberId, projectId, companyId, isDeleted: false },
    });
    if (!member) this.notFound('PC_MEMBER_NOT_FOUND');

    if (
      data.dedicationPercent !== undefined &&
      (data.dedicationPercent < 0 || data.dedicationPercent > 100)
    ) {
      this.badRequest('PC_MEMBER_DEDICATION_INVALID');
    }

    return this.pcProjectMembersRepository.db.update({
      where: { id: memberId },
      data: {
        ...(data.projectRole !== undefined
          ? { projectRole: data.projectRole }
          : {}),
        ...(data.projectHourlyCost !== undefined
          ? { projectHourlyCost: data.projectHourlyCost }
          : {}),
        ...(data.dailyHours !== undefined
          ? { dailyHours: data.dailyHours }
          : {}),
        ...(data.dedicationPercent !== undefined
          ? { dedicationPercent: data.dedicationPercent }
          : {}),
        ...(data.startDate !== undefined
          ? { startDate: new Date(data.startDate) }
          : {}),
        ...(data.endDate !== undefined
          ? { endDate: data.endDate ? new Date(data.endDate) : null }
          : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      } as Prisma.PCProjectMembersUpdateInput,
    });
  }

  async removeMember(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    memberId: number,
  ) {
    await this.assertProjectAccess(companyId, userId, projectId);
    const member = await this.pcProjectMembersRepository.db.findFirst({
      where: { id: memberId, projectId, companyId, isDeleted: false },
    });
    if (!member) this.notFound('PC_MEMBER_NOT_FOUND');

    const updated = await this.pcProjectMembersRepository.db.update({
      where: { id: memberId },
      data: { active: false, isDeleted: true, endDate: new Date() },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: userId ?? member.userId,
      projectId,
      entityType: 'PCProjectMembers',
      entityId: memberId,
      action: 'REMOVE',
    });

    return updated;
  }

  private normalizeResourceUrl(url: string): string {
    const trimmed = (url ?? '').trim();
    if (!trimmed) this.badRequest('PC_RESOURCE_URL_REQUIRED');
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      this.badRequest('PC_RESOURCE_URL_INVALID');
      return trimmed;
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      this.badRequest('PC_RESOURCE_URL_INVALID');
    }
    return parsed.toString();
  }

  private normalizeResourceName(name: string): string {
    const trimmed = (name ?? '').trim();
    if (!trimmed) this.badRequest('PC_RESOURCE_NAME_REQUIRED');
    return trimmed;
  }

  async listResources(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    await this.assertProjectAccess(companyId, userId, projectId);
    return this.pcProjectResourcesRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
      orderBy: { id: 'asc' },
    });
  }

  async addResource(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    projectId: number,
    data: PCResourceCreateInput,
  ) {
    await this.assertProjectAccess(companyId, scopeUserId, projectId);
    const name = this.normalizeResourceName(data.name);
    const url = this.normalizeResourceUrl(data.url);

    const resource = await this.pcProjectResourcesRepository.db.create({
      data: {
        companyId,
        userId: ownerUserId,
        projectId,
        name,
        url,
      },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: ownerUserId,
      projectId,
      entityType: 'PCProjectResources',
      entityId: resource.id,
      action: 'CREATE',
    });

    return resource;
  }

  async updateResource(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    resourceId: number,
    data: Partial<PCResourceCreateInput>,
  ) {
    await this.assertProjectAccess(companyId, userId, projectId);
    const resource = await this.pcProjectResourcesRepository.db.findFirst({
      where: { id: resourceId, projectId, companyId, isDeleted: false },
    });
    if (!resource) this.notFound('PC_RESOURCE_NOT_FOUND');

    return this.pcProjectResourcesRepository.db.update({
      where: { id: resourceId },
      data: {
        ...(data.name !== undefined
          ? { name: this.normalizeResourceName(data.name) }
          : {}),
        ...(data.url !== undefined
          ? { url: this.normalizeResourceUrl(data.url) }
          : {}),
      },
    });
  }

  async removeResource(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    resourceId: number,
  ) {
    await this.assertProjectAccess(companyId, userId, projectId);
    const resource = await this.pcProjectResourcesRepository.db.findFirst({
      where: { id: resourceId, projectId, companyId, isDeleted: false },
    });
    if (!resource) this.notFound('PC_RESOURCE_NOT_FOUND');

    const updated = await this.pcProjectResourcesRepository.db.update({
      where: { id: resourceId },
      data: { isDeleted: true },
    });

    await this.pcHistoryBusiness.log({
      companyId,
      userId: userId ?? resource.userId,
      projectId,
      entityType: 'PCProjectResources',
      entityId: resourceId,
      action: 'REMOVE',
    });

    return updated;
  }
}
