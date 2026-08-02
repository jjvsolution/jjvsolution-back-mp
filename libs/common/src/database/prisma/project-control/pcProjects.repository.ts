import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class PCProjectsRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.pCProjects;
  }
  get client() {
    return this.prisma;
  }
}
