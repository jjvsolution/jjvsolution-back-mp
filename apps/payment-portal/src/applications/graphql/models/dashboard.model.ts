import { Field, ObjectType } from '@nestjs/graphql';
import { DuesofPayAllObjectType } from './duesOfPay.model';

@ObjectType('PPDashboardKpisObjectType')
export class PPDashboardKpisObjectType {
  @Field(() => Number)
  totalDebt: number;

  @Field(() => Number)
  totalPaid: number;

  @Field(() => Number)
  totalPending: number;

  @Field(() => Number)
  overdueAmount: number;

  @Field(() => Number)
  monthlyCollection: number;

  @Field(() => Number)
  debtsCount: number;

  @Field(() => Number)
  duesCount: number;

  @Field(() => Number)
  overdueDuesCount: number;
}

@ObjectType('PPDashboardCollectionItemObjectType')
export class PPDashboardCollectionItemObjectType {
  @Field(() => String)
  month: string;

  @Field(() => Number)
  total: number;

  @Field(() => Number)
  count: number;
}

@ObjectType('PPDashboardOverdueObjectType')
export class PPDashboardOverdueObjectType {
  @Field(() => Number)
  total: number;

  @Field(() => Number)
  count: number;

  @Field(() => [DuesofPayAllObjectType])
  items: DuesofPayAllObjectType[];
}

@ObjectType('PPDashboardSummaryObjectType')
export class PPDashboardSummaryObjectType extends PPDashboardKpisObjectType {
  @Field(() => [PPDashboardCollectionItemObjectType])
  collection: PPDashboardCollectionItemObjectType[];

  @Field(() => Number)
  overdueTotal: number;

  @Field(() => Number)
  overdueCount: number;

  @Field(() => Date)
  generatedAt: Date;
}
