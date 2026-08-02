import { Injectable } from '@nestjs/common';
import {
  PCBacklogItemsRepository,
  PCProjectMembersRepository,
  PCSprintsRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCSprintStatus } from '@prisma/client';
import { PCProjectsBusiness } from './pcProjects.business';

export type PCSprintCreateInput = {
  projectId: number;
  name: string;
  goal?: string | null;
  startDate: Date | string;
  endDate: Date | string;
};

@Injectable()
export class PCSprintsBusiness extends ResponseClass {
  constructor(
    private readonly pcSprintsRepository: PCSprintsRepository,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcProjectsBusiness: PCProjectsBusiness,
  ) {
    super();
  }

  async findAll(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    return this.pcSprintsRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
      orderBy: { startDate: 'asc' },
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
    const sprint = await this.pcSprintsRepository.db.findFirst({
      where: { id, projectId, companyId, isDeleted: false },
    });
    if (!sprint) this.notFound('PC_SPRINT_NOT_FOUND');
    return sprint;
  }

  async createSprint(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    data: PCSprintCreateInput,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      data.projectId,
    );
    if (new Date(data.endDate) < new Date(data.startDate)) {
      this.badRequest('PC_SPRINT_DATES_INVALID');
    }
    return this.pcSprintsRepository.db.create({
      data: {
        companyId,
        userId: ownerUserId,
        projectId: data.projectId,
        name: data.name,
        goal: data.goal ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: PCSprintStatus.PLANIFICADO,
      },
    });
  }

  async update(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
    data: Partial<PCSprintCreateInput>,
  ) {
    await this.findById(companyId, userId, projectId, id);
    return this.pcSprintsRepository.db.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.goal !== undefined ? { goal: data.goal } : {}),
        ...(data.startDate !== undefined
          ? { startDate: new Date(data.startDate) }
          : {}),
        ...(data.endDate !== undefined
          ? { endDate: new Date(data.endDate) }
          : {}),
      },
    });
  }

  async start(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
  ) {
    await this.findById(companyId, userId, projectId, id);
    const active = await this.pcSprintsRepository.db.findFirst({
      where: {
        projectId,
        companyId,
        status: PCSprintStatus.ACTIVO,
        isDeleted: false,
        NOT: { id },
      },
    });
    if (active) this.badRequest('PC_SPRINT_ALREADY_ACTIVE');
    return this.pcSprintsRepository.db.update({
      where: { id },
      data: { status: PCSprintStatus.ACTIVO },
    });
  }

  async finish(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
  ) {
    await this.findById(companyId, userId, projectId, id);
    return this.pcSprintsRepository.db.update({
      where: { id },
      data: { status: PCSprintStatus.FINALIZADO },
    });
  }

  async cancel(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
  ) {
    await this.findById(companyId, userId, projectId, id);
    return this.pcSprintsRepository.db.update({
      where: { id },
      data: { status: PCSprintStatus.CANCELADO },
    });
  }

  async capacity(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
  ) {
    const sprint = await this.findById(companyId, userId, projectId, id);
    const members = await this.pcProjectMembersRepository.db.findMany({
      where: { projectId, companyId, active: true, isDeleted: false },
    });
    const days =
      Math.max(
        1,
        Math.ceil(
          (sprint.endDate.getTime() - sprint.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ) || 1;
    const totalCapacityHours = members.reduce((sum, m) => {
      const daily = (m.dailyHours * m.dedicationPercent) / 100;
      return sum + daily * days;
    }, 0);
    const committed = await this.pcBacklogItemsRepository.db.aggregate({
      where: { sprintId: id, projectId, isDeleted: false },
      _sum: { estimatedHours: true },
    });
    return {
      sprintId: id,
      membersCount: members.length,
      workingDaysApprox: days,
      totalCapacityHours,
      committedHours: committed._sum.estimatedHours ?? 0,
      remainingCapacityHours:
        totalCapacityHours - (committed._sum.estimatedHours ?? 0),
    };
  }

  async metrics(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    id: number,
  ) {
    await this.findById(companyId, userId, projectId, id);
    const items = await this.pcBacklogItemsRepository.db.findMany({
      where: { sprintId: id, projectId, isDeleted: false },
    });
    const total = items.length;
    const done = items.filter((i) => i.status === 'TERMINADA').length;
    const storyPoints = items.reduce((s, i) => s + (i.storyPoints ?? 0), 0);
    const estimatedHours = items.reduce((s, i) => s + i.estimatedHours, 0);
    return {
      sprintId: id,
      itemsTotal: total,
      itemsDone: done,
      completionPercent: total ? (done / total) * 100 : 0,
      storyPoints,
      estimatedHours,
    };
  }
}
