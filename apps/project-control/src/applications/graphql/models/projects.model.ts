import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { PCProjectMemberRole, PCProjectStatus } from './enums';

@ObjectType('PCProjectsObjectType')
@InputType('PCProjectsInputType')
export class PCProjectsModel {
  @Field(() => Int)
  companyId: number;

  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  clientName?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date, { nullable: true })
  targetEndDate?: Date | null;

  @Field(() => String, { nullable: true })
  currency?: string;

  @Field(() => Float, { nullable: true })
  workingHoursPerDay?: number;

  @Field(() => String, { nullable: true })
  workingDays?: string;

  @Field(() => Float, { nullable: true })
  budget?: number | null;

  @Field(() => Float, { nullable: true })
  contingencyPercent?: number;

  @Field(() => Int, { nullable: true })
  productOwnerId?: number | null;

  @Field(() => Int, { nullable: true })
  scrumMasterId?: number | null;
}

@ObjectType('PCProjectsAllObjectType')
@InputType('PCProjectsAllInputType')
export class PCProjectsAllModel extends PCProjectsModel {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  userId: string;

  @Field(() => PCProjectStatus)
  status: PCProjectStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isDeleted: boolean;
}

@ObjectType('PCProjectMembersObjectType')
@InputType('PCProjectMembersInputType')
export class PCProjectMembersModel {
  @Field(() => Int)
  actorId: number;

  @Field(() => PCProjectMemberRole, { nullable: true })
  projectRole?: PCProjectMemberRole;

  @Field(() => Float, { nullable: true })
  projectHourlyCost?: number;

  @Field(() => Float, { nullable: true })
  dailyHours?: number;

  @Field(() => Float, { nullable: true })
  dedicationPercent?: number;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date | null;
}

@ObjectType('PCProjectMembersAllObjectType')
@InputType('PCProjectMembersAllInputType')
export class PCProjectMembersAllModel extends PCProjectMembersModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  companyId: number;

  @Field(() => Int)
  projectId: number;

  @Field(() => String)
  userId: string;

  @Field(() => Boolean)
  active: boolean;
}

@ObjectType('PCProjectSummaryObjectType')
export class PCProjectSummaryModel {
  @Field(() => PCProjectsAllModel)
  project: PCProjectsAllModel;

  @Field(() => Int)
  membersCount: number;

  @Field(() => Int)
  backlogCount: number;

  @Field(() => Int)
  sprintsCount: number;
}
