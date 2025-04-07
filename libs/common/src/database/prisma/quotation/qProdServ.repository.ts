import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class QProdServRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.qProdServ;
  }
}
