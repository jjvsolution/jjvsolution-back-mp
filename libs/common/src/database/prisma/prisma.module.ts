import { Module } from '@nestjs/common';
import { Prisma } from './prisma';
import { CodeErrorRepository, ErrorRepository, LogRepository } from '.';

const provider = [Prisma, CodeErrorRepository, ErrorRepository, LogRepository];

@Module({
  providers: provider,
  exports: provider,
})
export class PrismaModule {}
