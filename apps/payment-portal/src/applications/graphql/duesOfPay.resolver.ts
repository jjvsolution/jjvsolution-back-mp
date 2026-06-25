import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation, Int, Context } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { PPDuesOfPayRepository } from '@database/prisma';
import { PPDuesOfPayBusiness } from '@business';
import {
  DuesofPayAllObjectType,
  DuesofPayObjectType,
  PPDuesofPayBalanceObjectType,
  PPDuesofPayDetailObjectType,
} from './models';
import { RequestWithUserInterface } from '@interfaces';

@Resolver(() => DuesofPayAllObjectType)
export class PPDuesofPayResolver {
  constructor(
    private readonly ppDuesOfPayRepository: PPDuesOfPayRepository,
    private readonly ppDuesOfPayBusiness: PPDuesOfPayBusiness,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPay(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<DuesofPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDuesOfPayBusiness.listAll(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => DuesofPayAllObjectType, { nullable: true })
  async PPDuesofPayById(
    @Args('id') id: number,
  ): Promise<DuesofPayAllObjectType | null> {
    return this.ppDuesOfPayBusiness.getById(id);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPayPending(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<DuesofPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDuesOfPayBusiness.getPending(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPayOverdue(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<DuesofPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDuesOfPayBusiness.getOverdue(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPayPaid(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<DuesofPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDuesOfPayBusiness.getPaid(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPayByDebtsToPayId(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('debtsToPayId', { type: () => Int }) debtsToPayId: number,
  ): Promise<DuesofPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDuesOfPayBusiness.getByDebtsToPayId(userId, debtsToPayId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDuesofPayBalanceObjectType)
  async PPDuesofPayPendingBalance(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('debtsToPayId', { type: () => Int, nullable: true })
    debtsToPayId?: number,
  ): Promise<PPDuesofPayBalanceObjectType> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDuesOfPayBusiness.getPendingBalance(userId, debtsToPayId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDuesofPayDetailObjectType, { nullable: true })
  async PPDuesofPayDetail(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('id') id: number,
  ): Promise<PPDuesofPayDetailObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDuesOfPayBusiness.getDetail(userId, id);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => DuesofPayAllObjectType, { nullable: true })
  async PPCreateDuesofPay(
    @Args('data') data: DuesofPayObjectType,
  ): Promise<DuesofPayAllObjectType | null> {
    return this.ppDuesOfPayRepository.db.create({ data });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => DuesofPayAllObjectType, { nullable: true })
  async PPUpdateDuesofPay(
    @Args('id') id: number,
    @Args('data') data: DuesofPayObjectType,
  ): Promise<DuesofPayAllObjectType | null> {
    return this.ppDuesOfPayRepository.db.update({ data, where: { id } });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => DuesofPayAllObjectType, { nullable: true })
  async PPDeleteDuesofPay(
    @Args('id') id: number,
  ): Promise<DuesofPayAllObjectType | null> {
    return this.ppDuesOfPayRepository.db.delete({ where: { id } });
  }
}
