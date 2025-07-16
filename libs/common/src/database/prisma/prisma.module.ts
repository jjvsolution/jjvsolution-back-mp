import { Module } from '@nestjs/common';
import { Prisma } from './prisma';
import {
  CodeErrorRepository,
  ErrorRepository,
  LogRepository,
  ParameterRepository,
} from '.';

const provider = [
  Prisma,
  CodeErrorRepository,
  ErrorRepository,
  LogRepository,
  ParameterRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class PrismaModule {}
