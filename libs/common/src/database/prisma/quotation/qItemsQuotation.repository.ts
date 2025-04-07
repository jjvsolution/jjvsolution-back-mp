import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class QItemsQuotationRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.qItemsQuotation;
  }
}
