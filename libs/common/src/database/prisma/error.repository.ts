import { Injectable } from '@nestjs/common';
import { Prisma as PrismaService } from '@database/prisma';

@Injectable()
export class ErrorRepository {
  constructor(private readonly prismaService: PrismaService) {}
  get db() {
    return this.prismaService.error;
  }
}
