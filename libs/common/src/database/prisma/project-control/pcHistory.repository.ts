import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class PCHistoryRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.pCHistory;
  }
}
