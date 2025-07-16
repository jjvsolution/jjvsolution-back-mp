import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class ACApplicationsRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCApplications;
  }
}
