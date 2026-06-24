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
  async PPDuesofPay(@Context() ctx: { req: RequestWithUserInterface }): Promise<DuesofPayAllObjectType[]> {
    return this.ppDuesOfPayBusiness.listAll(ctx.req.user.uid);
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
  async PPDuesofPayPending(): Promise<DuesofPayAllObjectType[]> {
    return this.ppDuesOfPayBusiness.getPending();
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPayOverdue(): Promise<DuesofPayAllObjectType[]> {
    return this.ppDuesOfPayBusiness.getOverdue();
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPayPaid(): Promise<DuesofPayAllObjectType[]> {
    return this.ppDuesOfPayBusiness.getPaid();
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DuesofPayAllObjectType])
  async PPDuesofPayByDebtsToPayId(
    @Args('debtsToPayId', { type: () => Int }) debtsToPayId: number,
  ): Promise<DuesofPayAllObjectType[]> {
    return this.ppDuesOfPayBusiness.getByDebtsToPayId(debtsToPayId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDuesofPayBalanceObjectType)
  async PPDuesofPayPendingBalance(
    @Args('debtsToPayId', { type: () => Int, nullable: true })
    debtsToPayId?: number,
  ): Promise<PPDuesofPayBalanceObjectType> {
    return this.ppDuesOfPayBusiness.getPendingBalance(debtsToPayId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDuesofPayDetailObjectType, { nullable: true })
  async PPDuesofPayDetail(
    @Args('id') id: number,
  ): Promise<PPDuesofPayDetailObjectType | null> {
    return this.ppDuesOfPayBusiness.getDetail(id);
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
