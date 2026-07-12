import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class ACApplicationsCompaniesRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCApplicationsCompanies;
  }
}
