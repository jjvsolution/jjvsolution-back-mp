import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma';

@Injectable()
export class UserRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.aCUser;
  }
}
