import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  ACApplicationsRepository,
  ACApplicationsCompaniesRepository,
  ACCompaniesRepository,
  ACConfigAuthApplicationRepository,
  ACLoginTypeRepository,
  ACProfilesRepository,
  ACRolsRepository,
  ACRolsProfilesRepository,
  ACUserProfileApplicationsRepository,
  ACTokenRepository,
  ACUserRepository,
} from '.';

const provider = [
  Prisma,
  ACApplicationsRepository,
  ACApplicationsCompaniesRepository,
  ACCompaniesRepository,
  ACConfigAuthApplicationRepository,
  ACLoginTypeRepository,
  ACProfilesRepository,
  ACRolsRepository,
  ACRolsProfilesRepository,
  ACUserProfileApplicationsRepository,
  ACTokenRepository,
  ACUserRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class AccessControlPrismaModule {}
