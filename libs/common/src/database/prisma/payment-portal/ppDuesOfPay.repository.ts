import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class PPDuesOfPayRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.pPDuesOfPay;
  }
}
