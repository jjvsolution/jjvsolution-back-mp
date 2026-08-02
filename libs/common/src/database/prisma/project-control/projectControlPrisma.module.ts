import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  PCActorsRepository,
  PCProjectsRepository,
  PCProjectMembersRepository,
  PCSprintsRepository,
  PCBacklogItemsRepository,
  PCTaskDependenciesRepository,
  PCTimeEntriesRepository,
  PCQaRulesRepository,
  PCBaselinesRepository,
  PCHistoryRepository,
} from '.';

const provider = [
  Prisma,
  PCActorsRepository,
  PCProjectsRepository,
  PCProjectMembersRepository,
  PCSprintsRepository,
  PCBacklogItemsRepository,
  PCTaskDependenciesRepository,
  PCTimeEntriesRepository,
  PCQaRulesRepository,
  PCBaselinesRepository,
  PCHistoryRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class ProjectControlPrismaModule {}
