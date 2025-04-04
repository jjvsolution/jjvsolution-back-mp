import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  ParameterRepository,
  TokenRepository,
  UserRepository,
  aCApplicationRepository,
  aCCompaniesRepository,
} from '.';

const provider = [
  Prisma,
  ParameterRepository,
  TokenRepository,
  UserRepository,
  aCApplicationRepository,
  aCCompaniesRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class AccessControlPrismaModule {}
