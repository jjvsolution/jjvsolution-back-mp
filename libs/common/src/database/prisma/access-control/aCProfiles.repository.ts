import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class ACProfilesRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCProfiles;
  }
}
