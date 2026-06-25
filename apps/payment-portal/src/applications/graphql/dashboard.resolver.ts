import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { PPDashboardBusiness } from '@business';
import {
  PPDashboardCollectionItemObjectType,
  PPDashboardKpisObjectType,
  PPDashboardOverdueObjectType,
  PPDashboardSummaryObjectType,
} from './models';
import { RequestWithUserInterface } from '@interfaces';

@Resolver()
export class PPDashboardResolver {
  constructor(private readonly ppDashboardBusiness: PPDashboardBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDashboardSummaryObjectType)
  PPDashboardSummary(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<PPDashboardSummaryObjectType> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDashboardBusiness.getSummary(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDashboardKpisObjectType)
  PPDashboardKpis(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<PPDashboardKpisObjectType> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDashboardBusiness.getKpis(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [PPDashboardCollectionItemObjectType])
  PPDashboardCollection(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<PPDashboardCollectionItemObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDashboardBusiness.getCollection(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDashboardOverdueObjectType)
  PPDashboardOverdue(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<PPDashboardOverdueObjectType> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDashboardBusiness.getOverdue(userId);
  }
}
