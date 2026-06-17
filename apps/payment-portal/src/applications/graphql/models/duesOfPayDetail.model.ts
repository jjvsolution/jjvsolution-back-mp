import { Field, ObjectType } from '@nestjs/graphql';
import { DebtsToPayAllObjectType } from './debtsToPay.model';
import { DuesofPayAllObjectType } from './duesOfPay.model';
import { PaymentAllObjectType } from './payment.model';

@ObjectType('PPDuesofPayDetailObjectType')
export class PPDuesofPayDetailObjectType {
  @Field(() => DuesofPayAllObjectType)
  due: DuesofPayAllObjectType;

  @Field(() => DebtsToPayAllObjectType)
  debt: DebtsToPayAllObjectType;

  @Field(() => [PaymentAllObjectType])
  payments: PaymentAllObjectType[];

  @Field(() => Number)
  totalAmount: number;

  @Field(() => Number)
  paidAmount: number;

  @Field(() => Number)
  pendingBalance: number;

  @Field(() => String)
  status: string;
}
