import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  ACApplicationsRepository,
  ACCompaniesRepository,
  ACConfigAuthApplicationRepository,
  ACLoginTypeRepository,
  ACProfilesRepository,
  ACRolsRepository,
  ACTokenRepository,
  ACUserRepository,
} from '.';

const provider = [
  Prisma,
  ACApplicationsRepository,
  ACCompaniesRepository,
  ACConfigAuthApplicationRepository,
  ACLoginTypeRepository,
  ACProfilesRepository,
  ACRolsRepository,
  ACTokenRepository,
  ACUserRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class AccessControlPrismaModule {}
