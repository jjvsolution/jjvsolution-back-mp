import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { PCQaActorScope, PCQaCalcType } from './enums';

@ObjectType('PCTimeEntriesObjectType')
@InputType('PCTimeEntriesInputType')
export class PCTimeEntriesModel {
  @Field(() => Int)
  projectId: number;

  @Field(() => Int)
  backlogItemId: number;

  @Field(() => Int)
  actorId: number;

  @Field(() => Date)
  date: Date;

  @Field(() => Float)
  hours: number;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Boolean, { nullable: true })
  billable?: boolean;
}

@ObjectType('PCTimeEntriesAllObjectType')
@InputType('PCTimeEntriesAllInputType')
export class PCTimeEntriesAllModel extends PCTimeEntriesModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  companyId: number;

  @Field(() => String)
  userId: string;

  @Field(() => Float)
  appliedHourlyCost: number;

  @Field(() => Float)
  calculatedCost: number;
}

@ObjectType('PCQaRulesObjectType')
@InputType('PCQaRulesInputType')
export class PCQaRulesModel {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field(() => Int)
  projectId: number;

  @Field(() => Boolean, { nullable: true })
  active?: boolean;

  @Field(() => PCQaCalcType)
  calcType: PCQaCalcType;

  @Field(() => Float)
  value: number;

  @Field(() => PCQaActorScope, { nullable: true })
  actorScope?: PCQaActorScope;

  @Field(() => Int, { nullable: true })
  qaActorId?: number | null;

  @Field(() => [Int], { nullable: true })
  selectedActorIds?: number[];
}

@ObjectType('PCQaRulesAllObjectType')
export class PCQaRulesAllModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  projectId: number;

  @Field(() => Boolean)
  active: boolean;

  @Field(() => PCQaCalcType)
  calcType: PCQaCalcType;

  @Field(() => Float)
  value: number;

  @Field(() => PCQaActorScope)
  actorScope: PCQaActorScope;

  @Field(() => Int, { nullable: true })
  qaActorId?: number | null;
}

@ObjectType('PCBaselinesAllObjectType')
export class PCBaselinesAllModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  projectId: number;

  @Field(() => String)
  name: string;

  @Field(() => Date)
  date: Date;

  @Field(() => Float)
  estimatedHours: number;

  @Field(() => Float)
  estimatedCost: number;

  @Field(() => Date, { nullable: true })
  estimatedEndDate?: Date | null;

  @Field(() => Int)
  backlogItemsCount: number;

  @Field(() => String)
  snapshotData: string;
}

@ObjectType('PCCostSummaryObjectType')
export class PCCostSummaryModel {
  @Field(() => Float)
  estimatedCost: number;

  @Field(() => Float)
  realCost: number;

  @Field(() => Float)
  pendingCost: number;

  @Field(() => Float)
  projectedFinalCost: number;

  @Field(() => Float, { nullable: true })
  budget?: number | null;

  @Field(() => Float, { nullable: true })
  monetaryDeviation?: number | null;

  @Field(() => Float, { nullable: true })
  percentDeviation?: number | null;

  @Field(() => Float)
  qaHours: number;

  @Field(() => Float, { nullable: true })
  qaCost?: number | null;

  @Field(() => Float)
  contingency: number;

  @Field(() => GraphQLJSON)
  byActor: unknown;

  @Field(() => GraphQLJSON)
  bySprint: unknown;

  @Field(() => GraphQLJSON)
  byEpic: unknown;

  @Field(() => GraphQLJSON)
  byType: unknown;

  @Field(() => [String])
  warnings: string[];
}

@ObjectType('PCPlanningResultObjectType')
export class PCPlanningResultModel {
  @Field(() => GraphQLJSON)
  ideal: unknown;

  @Field(() => GraphQLJSON)
  adjusted: unknown;
}

@ObjectType('PCImportPreviewObjectType')
export class PCImportPreviewModel {
  @Field(() => GraphQLJSON)
  validRows: unknown;

  @Field(() => GraphQLJSON)
  invalidRows: unknown;

  @Field(() => [String])
  duplicateCodesInFile: string[];

  @Field(() => [String])
  existingCodes: string[];
}

@ObjectType('PCJiraConnectionObjectType')
export class PCJiraConnectionModel {
  @Field(() => String, { nullable: true })
  jiraBaseUrl?: string | null;

  @Field(() => String, { nullable: true })
  jiraEmail?: string | null;

  @Field(() => String, { nullable: true })
  jiraProjectKey?: string | null;

  @Field(() => Date, { nullable: true })
  jiraLastPullAt?: Date | null;

  @Field(() => Boolean)
  hasApiToken: boolean;
}

@InputType('PCJiraConnectionInputType')
export class PCJiraConnectionInputModel {
  @Field(() => String)
  jiraBaseUrl: string;

  @Field(() => String)
  jiraEmail: string;

  @Field(() => String, { nullable: true })
  jiraApiToken?: string | null;

  @Field(() => String)
  jiraProjectKey: string;
}

@ObjectType('PCJiraConnectionTestObjectType')
export class PCJiraConnectionTestModel {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  displayName?: string | null;

  @Field(() => String, { nullable: true })
  accountId?: string | null;

  @Field(() => String, { nullable: true })
  jiraProjectKey?: string | null;
}

@ObjectType('PCJiraImportPreviewObjectType')
export class PCJiraImportPreviewModel {
  @Field(() => GraphQLJSON)
  validRows: unknown;

  @Field(() => GraphQLJSON)
  invalidRows: unknown;

  @Field(() => [String])
  existingCodes: string[];

  @Field(() => Int)
  willCreateCount: number;

  @Field(() => Int)
  willUpdateCount: number;

  @Field(() => [String])
  warnings: string[];
}

@ObjectType('PCJiraImportConfirmObjectType')
export class PCJiraImportConfirmModel {
  @Field(() => Int)
  createdCount: number;

  @Field(() => Int)
  updatedCount: number;

  @Field(() => Int)
  worklogsCreated: number;

  @Field(() => Int)
  worklogsSkipped: number;

  @Field(() => [String])
  codes: string[];

  @Field(() => [String])
  warnings: string[];
}
