import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma';

@Injectable()
export class aCCompaniesRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCCompanies;
  }
}
