import { Module, Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@services';
import { PassportModule } from '@nestjs/passport';
import {
  AccessControlPrismaModule,
  ProjectControlPrismaModule,
} from '@database/prisma';
import { PCActorsBusiness } from './pcActors.business';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCHistoryBusiness } from './pcHistory.business';
import { PCBacklogBusiness } from './pcBacklog.business';
import { PCSprintsBusiness } from './pcSprints.business';
import { PCDependenciesBusiness } from './pcDependencies.business';
import { PCCapacityBusiness } from './pcCapacity.business';
import { PCWorkCalendarBusiness } from './pcWorkCalendar.business';
import { PCTimeEntriesBusiness } from './pcTimeEntries.business';
import { PCCostsBusiness } from './pcCosts.business';
import { PCImportBusiness } from './pcImport.business';
import { PCJiraImportBusiness } from './pcJiraImport.business';
import { PCPortfolioBusiness } from './pcPortfolio.business';

const businessExport: Provider[] = [
  AuthService,
  PCHistoryBusiness,
  PCActorsBusiness,
  PCProjectsBusiness,
  PCBacklogBusiness,
  PCSprintsBusiness,
  PCDependenciesBusiness,
  PCCapacityBusiness,
  PCWorkCalendarBusiness,
  PCTimeEntriesBusiness,
  PCCostsBusiness,
  PCPortfolioBusiness,
  PCImportBusiness,
  PCJiraImportBusiness,
];

@Module({
  imports: [
    ProjectControlPrismaModule,
    AccessControlPrismaModule,
    PassportModule,
  ],
  providers: [...businessExport, JwtService],
  exports: businessExport,
})
export class ProjectControlBusinessModule {}
