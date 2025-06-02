import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class ACTokenRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCToken;
  }
}
