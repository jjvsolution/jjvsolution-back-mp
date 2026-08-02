import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import { PCActorsBusiness } from '@business';
import { PCActorsAllModel, PCActorsModel } from './models';

@Resolver(() => PCActorsAllModel)
export class PCActorsResolver {
  constructor(private readonly pcActorsBusiness: PCActorsBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCActorsAllModel])
  PCActorsByCompany(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('active', { nullable: true }) active?: boolean,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.pcActorsBusiness.findAll(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      { active, search },
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCActorsAllModel)
  PCActorById(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
  ) {
    return this.pcActorsBusiness.findById(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCActorsAllModel)
  PCActorCreate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('data') data: PCActorsModel,
  ) {
    return this.pcActorsBusiness.createActor(ctx.req.user.uid, data);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCActorsAllModel)
  PCActorUpdate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
    @Args('data') data: PCActorsModel,
  ) {
    return this.pcActorsBusiness.update(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCActorsAllModel)
  PCActorActivate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
  ) {
    return this.pcActorsBusiness.setActive(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
      true,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCActorsAllModel)
  PCActorDeactivate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
  ) {
    return this.pcActorsBusiness.setActive(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
      false,
    );
  }
}
