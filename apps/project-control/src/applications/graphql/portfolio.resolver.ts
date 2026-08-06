import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import { PCPortfolioBusiness } from '@business';
import { PCProjectStatus } from './models/enums';
import { PCPortfolioDashboardModel } from './models/portfolio.model';

@Resolver(() => PCPortfolioDashboardModel)
export class PCPortfolioResolver {
  constructor(private readonly pcPortfolioBusiness: PCPortfolioBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => PCPortfolioDashboardModel)
  PCPortfolioDashboard(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('statuses', {
      type: () => [PCProjectStatus],
      nullable: true,
    })
    statuses?: PCProjectStatus[] | null,
  ) {
    return this.pcPortfolioBusiness.dashboard(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      statuses,
    );
  }
}
