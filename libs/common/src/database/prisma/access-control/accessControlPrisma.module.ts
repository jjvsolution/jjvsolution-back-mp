import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  ACApplicationsRepository,
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
