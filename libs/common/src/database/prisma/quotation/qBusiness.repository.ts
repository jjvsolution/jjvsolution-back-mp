import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class QBusinessRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.qBusiness;
  }
}
