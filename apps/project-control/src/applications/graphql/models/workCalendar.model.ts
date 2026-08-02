import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PCWorkCalendarTaskObjectType')
export class PCWorkCalendarTaskModel {
  @Field(() => Int)
  backlogItemId: number;

  @Field(() => String)
  code: string;

  @Field(() => String)
  title: string;

  @Field(() => Float)
  taskEstimatedHours: number;

  @Field(() => Float)
  plannedEstimatedHours: number;

  @Field(() => Float)
  actualHours: number;

  @Field(() => [Int])
  timeEntryIds: number[];

  @Field(() => Boolean)
  fromPlan: boolean;
}

@ObjectType('PCWorkCalendarCellObjectType')
export class PCWorkCalendarCellModel {
  @Field(() => Int)
  actorId: number;

  @Field(() => String)
  date: string;

  @Field(() => [PCWorkCalendarTaskModel])
  tasks: PCWorkCalendarTaskModel[];

  @Field(() => Float)
  totalPlannedHours: number;

  @Field(() => Float)
  totalActualHours: number;
}

@ObjectType('PCWorkCalendarActorObjectType')
export class PCWorkCalendarActorModel {
  @Field(() => Int)
  actorId: number;

  @Field(() => String)
  name: string;

  @Field(() => Float)
  dailyCapacity: number;
}

@ObjectType('PCWorkCalendarObjectType')
export class PCWorkCalendarModel {
  @Field(() => Int)
  projectId: number;

  @Field(() => String)
  fromDate: string;

  @Field(() => String)
  toDate: string;

  @Field(() => String)
  workingDays: string;

  @Field(() => [String])
  days: string[];

  @Field(() => [PCWorkCalendarActorModel])
  actors: PCWorkCalendarActorModel[];

  @Field(() => [PCWorkCalendarCellModel])
  cells: PCWorkCalendarCellModel[];
}
