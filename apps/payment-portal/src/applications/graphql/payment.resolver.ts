import { UseGuards } from '@nestjs/common';
import {
  Query,
  Args,
  Resolver,
  Mutation,
  Parent,
  ResolveField,
  Context,
} from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { PPPaymentBusiness } from '@business';
import {
  PaymentAllObjectType,
  PaymentCreateInputType,
  PaymentUpdateInputType,
  DuesofPayAllObjectType,
} from './models';
import { RequestWithUserInterface } from '@interfaces';

@Resolver(() => PaymentAllObjectType)
export class PPPaymentResolver {
  constructor(private readonly ppPaymentBusiness: PPPaymentBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PaymentAllObjectType])
  async PPPayment(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<PaymentAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppPaymentBusiness.listAll(userId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PaymentAllObjectType, { nullable: true })
  async PPPaymentById(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('id') id: number,
  ): Promise<PaymentAllObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppPaymentBusiness.getById(userId, id);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PaymentAllObjectType, { nullable: true })
  async PPCreatePayment(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('data') data: PaymentCreateInputType,
  ): Promise<PaymentAllObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppPaymentBusiness.createPayment(userId, data);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PaymentAllObjectType, { nullable: true })
  async PPUpdatePayment(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('id') id: number,
    @Args('data') data: PaymentUpdateInputType,
  ): Promise<PaymentAllObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppPaymentBusiness.updatePayment(userId, id, data);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PaymentAllObjectType, { nullable: true })
  async PPDeletePayment(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('id') id: number,
  ): Promise<PaymentAllObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppPaymentBusiness.deletePayment(userId, id);
  }

  @UseGuards(GQLInternalGuard)
  @ResolveField(() => [DuesofPayAllObjectType])
  async PPDuesofPay(
    @Context() ctx: { req: RequestWithUserInterface },
    @Parent() payment: PaymentAllObjectType,
  ): Promise<DuesofPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    const a = await this.ppPaymentBusiness.getDuesByPaymentId(userId, payment.id);
    console.log(payment.id, JSON.stringify(a));
    return a;
  }
}
