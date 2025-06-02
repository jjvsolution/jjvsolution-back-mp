import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  ACParameterRepository,
  ACTokenRepository,
  ACUserRepository,
  ACApplicationRepository,
  ACCompaniesRepository,
} from '.';

const provider = [
  Prisma,
  ACParameterRepository,
  ACTokenRepository,
  ACUserRepository,
  ACApplicationRepository,
  ACCompaniesRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class AccessControlPrismaModule {}
