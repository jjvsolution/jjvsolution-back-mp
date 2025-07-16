import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class ACLoginTypeRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCLoginType;
  }
}
