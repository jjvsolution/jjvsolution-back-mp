import { Field, Float, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum PCActorLoadStatusEnum {
  OVERLOADED = 'OVERLOADED',
  BALANCED = 'BALANCED',
  AVAILABLE = 'AVAILABLE',
}

export enum PCScenarioTypeEnum {
  ABSENCE = 'ABSENCE',
  REMOVE_OR_REASSIGN = 'REMOVE_OR_REASSIGN',
  ADD_MEMBER_MONTH = 'ADD_MEMBER_MONTH',
}

registerEnumType(PCActorLoadStatusEnum, { name: 'PCActorLoadStatus' });
registerEnumType(PCScenarioTypeEnum, { name: 'PCScenarioType' });

@ObjectType('PCActorLoadObjectType')
export class PCActorLoadModel {
  @Field(() => Int)
  actorId: number;

  @Field(() => String)
  actorName: string;

  @Field(() => Float)
  assignedHours: number;

  @Field(() => Float)
  dailyCapacity: number;

  @Field(() => Float)
  freeHoursPerDay: number;

  @Field(() => Float)
  windowWorkingDays: number;

  @Field(() => Float)
  capacityHours: number;

  @Field(() => Float)
  utilizationPercent: number;

  @Field(() => PCActorLoadStatusEnum)
  status: PCActorLoadStatusEnum;

  @Field(() => [Int])
  taskIds: number[];
}

@ObjectType('PCAccelerationSuggestionObjectType')
export class PCAccelerationSuggestionModel {
  @Field(() => Int)
  taskId: number;

  @Field(() => String)
  taskCode: string;

  @Field(() => Int)
  fromActorId: number;

  @Field(() => Int)
  toActorId: number;

  @Field(() => Float)
  estimatedDaysSaved: number;

  @Field(() => String)
  rationale: string;
}

@ObjectType('PCCapacityInsightsObjectType')
export class PCCapacityInsightsModel {
  @Field(() => Int)
  projectId: number;

  @Field(() => Float)
  workingHoursPerDay: number;

  @Field(() => String)
  workingDays: string;

  @Field(() => Date, { nullable: true })
  baselineEndDate?: Date | null;

  @Field(() => Float)
  baselineWorkingDays: number;

  @Field(() => Float)
  totalAssignedHours: number;

  @Field(() => Int)
  unassignedTaskCount: number;

  @Field(() => [PCActorLoadModel])
  actorLoads: PCActorLoadModel[];

  @Field(() => [PCAccelerationSuggestionModel])
  accelerationSuggestions: PCAccelerationSuggestionModel[];

  @Field(() => [Int])
  criticalTaskIds: number[];

  @Field(() => [String])
  warnings: string[];

  @Field(() => Int)
  backlogItemCount: number;
}

@InputType('PCScenarioInputType')
export class PCScenarioInputModel {
  @Field(() => PCScenarioTypeEnum)
  type: PCScenarioTypeEnum;

  @Field(() => Int, { nullable: true })
  actorId?: number;

  @Field(() => Date, { nullable: true })
  fromDate?: Date;

  @Field(() => Date, { nullable: true })
  toDate?: Date;

  @Field(() => Int, { nullable: true })
  reassignToActorId?: number | null;

  @Field(() => Float, { nullable: true })
  hourlyCost?: number;

  @Field(() => Float, { nullable: true })
  dailyHours?: number;

  @Field(() => Float, { nullable: true })
  dedicationPercent?: number;

  @Field(() => Float, { nullable: true })
  monthWorkingDays?: number;

  @Field(() => Float, { nullable: true })
  assumeHours?: number;
}

@ObjectType('PCScenarioSnapshotObjectType')
export class PCScenarioSnapshotModel {
  @Field(() => Date, { nullable: true })
  estimatedEndDate?: Date | null;

  @Field(() => Float)
  totalWorkingDays: number;

  @Field(() => [PCActorLoadModel])
  actorLoads: PCActorLoadModel[];

  @Field(() => [String], { nullable: true })
  warnings?: string[];
}

@ObjectType('PCScenarioResultObjectType')
export class PCScenarioResultModel {
  @Field(() => PCScenarioTypeEnum)
  scenarioType: PCScenarioTypeEnum;

  @Field(() => String)
  scenarioLabel: string;

  @Field(() => PCScenarioSnapshotModel)
  baseline: PCScenarioSnapshotModel;

  @Field(() => PCScenarioSnapshotModel)
  simulated: PCScenarioSnapshotModel;

  @Field(() => Float)
  endDateDeltaDays: number;

  @Field(() => Float)
  costDelta: number;

  @Field(() => [Int])
  impactedTaskIds: number[];

  @Field(() => [String])
  warnings: string[];
}
