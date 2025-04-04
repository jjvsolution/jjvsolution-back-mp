import { Injectable } from '@nestjs/common';
import { Prisma as PrismaService } from '@prisma';

@Injectable()
export class LogRepository {
  constructor(private readonly prismaService: PrismaService) {}
  get db() {
    return this.prismaService.log;
  }
}
