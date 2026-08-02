import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import { PCHistoryBusiness } from '@business';
import { PCHistoryModel } from './models/history.model';

@Resolver(() => PCHistoryModel)
export class PCHistoryResolver {
  constructor(private readonly pcHistoryBusiness: PCHistoryBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCHistoryModel])
  PCHistoryByProject(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcHistoryBusiness.listByProject(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }
}
