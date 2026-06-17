import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { PPDashboardBusiness } from '@business';
import {
  PPDashboardCollectionItemObjectType,
  PPDashboardKpisObjectType,
  PPDashboardOverdueObjectType,
  PPDashboardSummaryObjectType,
} from './models';

@Resolver()
export class PPDashboardResolver {
  constructor(private readonly ppDashboardBusiness: PPDashboardBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDashboardSummaryObjectType)
  PPDashboardSummary(): Promise<PPDashboardSummaryObjectType> {
    return this.ppDashboardBusiness.getSummary();
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDashboardKpisObjectType)
  PPDashboardKpis(): Promise<PPDashboardKpisObjectType> {
    return this.ppDashboardBusiness.getKpis();
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [PPDashboardCollectionItemObjectType])
  PPDashboardCollection(): Promise<PPDashboardCollectionItemObjectType[]> {
    return this.ppDashboardBusiness.getCollection();
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDashboardOverdueObjectType)
  PPDashboardOverdue(): Promise<PPDashboardOverdueObjectType> {
    return this.ppDashboardBusiness.getOverdue();
  }
}
