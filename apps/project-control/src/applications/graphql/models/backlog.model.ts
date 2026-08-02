import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  PCBacklogStatus,
  PCBacklogType,
  PCPriority,
} from './enums';

@ObjectType('PCBacklogItemsObjectType')
@InputType('PCBacklogItemsInputType')
export class PCBacklogItemsModel {
  @Field(() => Int)
  projectId: number;

  @Field(() => Int, { nullable: true })
  sprintId?: number | null;

  @Field(() => Int, { nullable: true })
  parentId?: number | null;

  @Field(() => String)
  code: string;

  @Field(() => PCBacklogType)
  type: PCBacklogType;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  acceptanceCriteria?: string | null;

  @Field(() => PCPriority, { nullable: true })
  priority?: PCPriority;

  @Field(() => PCBacklogStatus, { nullable: true })
  status?: PCBacklogStatus;

  @Field(() => Float, { nullable: true })
  storyPoints?: number | null;

  @Field(() => Float, { nullable: true })
  estimatedHours?: number;

  @Field(() => Float, { nullable: true })
  remainingHours?: number | null;

  @Field(() => Int, { nullable: true })
  responsibleId?: number | null;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@ObjectType('PCBacklogItemsAllObjectType')
@InputType('PCBacklogItemsAllInputType')
export class PCBacklogItemsAllModel extends PCBacklogItemsModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  companyId: number;

  @Field(() => String)
  userId: string;

  @Field(() => Boolean)
  isDeleted: boolean;
}

@ObjectType('PCSprintsObjectType')
@InputType('PCSprintsInputType')
export class PCSprintsModel {
  @Field(() => Int)
  projectId: number;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  goal?: string | null;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;
}

@ObjectType('PCSprintsAllObjectType')
@InputType('PCSprintsAllInputType')
export class PCSprintsAllModel extends PCSprintsModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  companyId: number;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  status: string;

  @Field(() => Boolean)
  isDeleted: boolean;
}

@ObjectType('PCTaskDependenciesObjectType')
@InputType('PCTaskDependenciesInputType')
export class PCTaskDependenciesModel {
  @Field(() => Int)
  projectId: number;

  @Field(() => Int)
  predecessorId: number;

  @Field(() => Int)
  successorId: number;

  @Field(() => String, { nullable: true })
  dependencyType?: string;

  @Field(() => Float, { nullable: true })
  lagHours?: number;
}

@ObjectType('PCTaskDependenciesAllObjectType')
@InputType('PCTaskDependenciesAllInputType')
export class PCTaskDependenciesAllModel extends PCTaskDependenciesModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  companyId: number;

  @Field(() => String)
  userId: string;
}
