import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';
import { DuesofPayAllObjectType } from './duesOfPay.model';

@ObjectType('PaymentObjectType')
@InputType('PaymentInputType')
export class PaymentObjectType {
  @Field(() => Date)
  paymentDate: Date;

  @Field(() => String)
  paymentType: $Enums.PPTypePaymentType;

  @Field(() => Number)
  amount: number;

  @Field(() => String)
  status: $Enums.PPStatusPayment;
}

@InputType('PaymentCreateInputType')
export class PaymentCreateInputType extends PaymentObjectType {
  @Field(() => [Int])
  duesOfPayIds: number[];
}

@InputType('PaymentUpdateInputType')
export class PaymentUpdateInputType extends PaymentObjectType {
  @Field(() => [Int], { nullable: true })
  duesOfPayIds?: number[];
}

@ObjectType('PaymentAllObjectType')
export class PaymentAllObjectType extends PaymentObjectType {
  @Field(() => Number)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [DuesofPayAllObjectType], { nullable: true })
  PPDuesofPay?: DuesofPayAllObjectType[];
}
