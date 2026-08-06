import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PCProjectStatus } from './enums';

export enum PCRagStatus {
  GREEN = 'GREEN',
  AMBER = 'AMBER',
  RED = 'RED',
}

registerEnumType(PCRagStatus, { name: 'PCRagStatus' });

@ObjectType('PCPortfolioProjectCardObjectType')
export class PCPortfolioProjectCardModel {
  @Field(() => Int)
  projectId: number;

  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  clientName?: string | null;

  @Field(() => PCProjectStatus)
  status: PCProjectStatus;

  @Field(() => String)
  currency: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date, { nullable: true })
  targetEndDate?: Date | null;

  @Field(() => Int)
  membersCount: number;

  @Field(() => Int)
  backlogCount: number;

  @Field(() => Int)
  sprintsCount: number;

  @Field(() => Float, { nullable: true })
  budget?: number | null;

  @Field(() => Float)
  projectedFinalCost: number;

  @Field(() => Float)
  realCost: number;

  @Field(() => Float, { nullable: true })
  percentDeviation?: number | null;

  @Field(() => PCRagStatus)
  costRag: PCRagStatus;

  @Field(() => Date, { nullable: true })
  projectedEndDate?: Date | null;

  @Field(() => Float, { nullable: true })
  scheduleSlipDays?: number | null;

  @Field(() => PCRagStatus)
  scheduleRag: PCRagStatus;

  @Field(() => Int)
  overloadedMembers: number;

  @Field(() => Int)
  balancedMembers: number;

  @Field(() => Int)
  availableMembers: number;

  @Field(() => Float)
  maxUtilizationPercent: number;

  @Field(() => PCRagStatus)
  loadRag: PCRagStatus;

  @Field(() => PCRagStatus)
  overallRag: PCRagStatus;

  @Field(() => [String])
  warnings: string[];
}

@ObjectType('PCPortfolioRagTotalsObjectType')
export class PCPortfolioRagTotalsModel {
  @Field(() => Int)
  green: number;

  @Field(() => Int)
  amber: number;

  @Field(() => Int)
  red: number;
}

@ObjectType('PCPortfolioDashboardObjectType')
export class PCPortfolioDashboardModel {
  @Field(() => Int)
  companyId: number;

  @Field(() => Date)
  generatedAt: Date;

  @Field(() => [PCPortfolioProjectCardModel])
  projects: PCPortfolioProjectCardModel[];

  @Field(() => PCPortfolioRagTotalsModel)
  totals: PCPortfolioRagTotalsModel;

  @Field(() => Float, { nullable: true })
  portfolioBudget?: number | null;

  @Field(() => Float)
  portfolioProjectedCost: number;

  @Field(() => Float)
  portfolioRealCost: number;

  @Field(() => Int)
  projectsAtRisk: number;
}
