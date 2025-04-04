import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma';

@Injectable()
export class QUsersRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.qUsers;
  }
}
