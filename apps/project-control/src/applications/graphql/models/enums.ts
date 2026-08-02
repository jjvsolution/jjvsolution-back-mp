import { registerEnumType } from '@nestjs/graphql';
import {
  PCBacklogStatus,
  PCBacklogType,
  PCDependencyType,
  PCPriority,
  PCProjectMemberRole,
  PCProjectStatus,
  PCQaActorScope,
  PCQaCalcType,
  PCSprintStatus,
} from '@prisma/client';

registerEnumType(PCProjectStatus, { name: 'PCProjectStatus' });
registerEnumType(PCSprintStatus, { name: 'PCSprintStatus' });
registerEnumType(PCBacklogType, { name: 'PCBacklogType' });
registerEnumType(PCBacklogStatus, { name: 'PCBacklogStatus' });
registerEnumType(PCPriority, { name: 'PCPriority' });
registerEnumType(PCDependencyType, { name: 'PCDependencyType' });
registerEnumType(PCQaCalcType, { name: 'PCQaCalcType' });
registerEnumType(PCQaActorScope, { name: 'PCQaActorScope' });
registerEnumType(PCProjectMemberRole, { name: 'PCProjectMemberRole' });

export {
  PCProjectStatus,
  PCSprintStatus,
  PCBacklogType,
  PCBacklogStatus,
  PCPriority,
  PCDependencyType,
  PCQaCalcType,
  PCQaActorScope,
  PCProjectMemberRole,
};
