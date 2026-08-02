import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import { PCCapacityBusiness } from '@business';
import {
  PCCapacityInsightsModel,
  PCScenarioInputModel,
  PCScenarioResultModel,
} from './models';

@Resolver()
export class PCCapacityResolver {
  constructor(private readonly pcCapacityBusiness: PCCapacityBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => PCCapacityInsightsModel)
  PCCapacityInsights(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcCapacityBusiness.getCapacityInsights(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCScenarioResultModel)
  PCScenarioSimulate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('scenario') scenario: PCScenarioInputModel,
  ) {
    return this.pcCapacityBusiness.simulateScenario(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      scenario,
    );
  }
}
