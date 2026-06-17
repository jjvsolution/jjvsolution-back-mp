import { UseGuards } from '@nestjs/common';
import {
  Query,
  Args,
  Resolver,
  Mutation,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { PPPaymentBusiness } from '@business';
import {
  PaymentAllObjectType,
  PaymentCreateInputType,
  PaymentUpdateInputType,
  DuesofPayAllObjectType,
} from './models';

@Resolver(() => PaymentAllObjectType)
export class PPPaymentResolver {
  constructor(private readonly ppPaymentBusiness: PPPaymentBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PaymentAllObjectType])
  async PPPayment(): Promise<PaymentAllObjectType[]> {
    return this.ppPaymentBusiness.listAll();
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PaymentAllObjectType, { nullable: true })
  async PPPaymentById(
    @Args('id') id: number,
  ): Promise<PaymentAllObjectType | null> {
    return this.ppPaymentBusiness.getById(id);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PaymentAllObjectType, { nullable: true })
  async PPCreatePayment(
    @Args('data') data: PaymentCreateInputType,
  ): Promise<PaymentAllObjectType | null> {
    return this.ppPaymentBusiness.createPayment(data);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PaymentAllObjectType, { nullable: true })
  async PPUpdatePayment(
    @Args('id') id: number,
    @Args('data') data: PaymentUpdateInputType,
  ): Promise<PaymentAllObjectType | null> {
    return this.ppPaymentBusiness.updatePayment(id, data);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PaymentAllObjectType, { nullable: true })
  async PPDeletePayment(
    @Args('id') id: number,
  ): Promise<PaymentAllObjectType | null> {
    return this.ppPaymentBusiness.deletePayment(id);
  }

  @UseGuards(GQLInternalGuard)
  @ResolveField(() => [DuesofPayAllObjectType])
  async PPDuesofPay(
    @Parent() payment: PaymentAllObjectType,
  ): Promise<DuesofPayAllObjectType[]> {
    return this.ppPaymentBusiness.getDuesByPaymentId(payment.id);
  }
}
