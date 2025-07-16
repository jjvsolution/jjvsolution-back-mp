import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class ACRolsRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCRols;
  }
}
