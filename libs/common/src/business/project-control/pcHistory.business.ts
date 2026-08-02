import { Injectable } from '@nestjs/common';
import { PCHistoryRepository, PCProjectsRepository } from '@database/prisma';
import { ResponseClass } from 'common/config';

@Injectable()
export class PCHistoryBusiness extends ResponseClass {
  constructor(
    private readonly pcHistoryRepository: PCHistoryRepository,
    private readonly pcProjectsRepository: PCProjectsRepository,
  ) {
    super();
  }

  async log(params: {
    companyId: number;
    userId: string;
    projectId: number;
    entityType: string;
    entityId: number;
    action: string;
    fieldName?: string;
    oldValue?: string | null;
    newValue?: string | null;
  }) {
    return this.pcHistoryRepository.db.create({ data: params });
  }

  async listByProject(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const project = await this.pcProjectsRepository.db.findFirst({
      where: {
        id: projectId,
        companyId,
        isDeleted: false,
        ...(userId ? { userId } : {}),
      },
    });
    if (!project) this.notFound('PC_PROJECT_NOT_FOUND');

    return this.pcHistoryRepository.db.findMany({
      where: { companyId, projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
