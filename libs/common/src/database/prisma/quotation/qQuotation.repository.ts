import { Injectable } from '@nestjs/common';
import { Prisma as PrismaService, QStatusRepository } from '@database/prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class QQuotationRepository {
  constructor(private readonly prisma: PrismaService) {}
  get db() {
    return this.prisma.qQuotation;
  }
}
