import { Injectable } from '@nestjs/common';
import { PCActorsRepository, PCHistoryRepository } from '@database/prisma';
import { ResponseClass } from 'common/config';
import { Prisma } from '@prisma/client';

export type PCActorCreateInput = {
  companyId: number;
  name: string;
  position: string;
  email?: string | null;
  defaultHourlyCost?: number;
  defaultDailyHours?: number;
  active?: boolean;
};

export type PCActorUpdateInput = Partial<
  Omit<PCActorCreateInput, 'companyId'>
>;

@Injectable()
export class PCActorsBusiness extends ResponseClass {
  constructor(
    private readonly pcActorsRepository: PCActorsRepository,
    private readonly pcHistoryRepository: PCHistoryRepository,
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

  async findAll(
    companyId: number,
    userId: string | undefined,
    opts?: { active?: boolean; search?: string },
  ) {
    return this.pcActorsRepository.db.findMany({
      where: {
        ...this.scope(companyId, userId),
        ...(opts?.active !== undefined ? { active: opts.active } : {}),
        ...(opts?.search
          ? {
              OR: [
                { name: { contains: opts.search, mode: 'insensitive' } },
                { email: { contains: opts.search, mode: 'insensitive' } },
                { position: { contains: opts.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { id: 'desc' },
    });
  }

  async findById(companyId: number, userId: string | undefined, id: number) {
    const actor = await this.pcActorsRepository.db.findFirst({
      where: { id, ...this.scope(companyId, userId) },
    });
    if (!actor) this.notFound('PC_ACTOR_NOT_FOUND');
    return actor;
  }

  async createActor(ownerUserId: string, data: PCActorCreateInput) {
    if ((data.defaultHourlyCost ?? 0) < 0) {
      this.badRequest('PC_ACTOR_HOURLY_COST_INVALID');
    }
    if ((data.defaultDailyHours ?? 8) <= 0) {
      this.badRequest('PC_ACTOR_DAILY_HOURS_INVALID');
    }
    return this.pcActorsRepository.db.create({
      data: {
        companyId: data.companyId,
        userId: ownerUserId,
        name: data.name,
        position: data.position,
        email: data.email ?? null,
        defaultHourlyCost: data.defaultHourlyCost ?? 0,
        defaultDailyHours: data.defaultDailyHours ?? 8,
        active: data.active ?? true,
      },
    });
  }

  async update(
    companyId: number,
    userId: string | undefined,
    id: number,
    data: PCActorUpdateInput,
  ) {
    await this.findById(companyId, userId, id);
    if (data.defaultHourlyCost !== undefined && data.defaultHourlyCost < 0) {
      this.badRequest('PC_ACTOR_HOURLY_COST_INVALID');
    }
    if (data.defaultDailyHours !== undefined && data.defaultDailyHours <= 0) {
      this.badRequest('PC_ACTOR_DAILY_HOURS_INVALID');
    }
    return this.pcActorsRepository.db.update({
      where: { id },
      data: data as Prisma.PCActorsUpdateInput,
    });
  }

  async setActive(
    companyId: number,
    userId: string | undefined,
    id: number,
    active: boolean,
  ) {
    await this.findById(companyId, userId, id);
    return this.pcActorsRepository.db.update({
      where: { id },
      data: { active },
    });
  }
}
