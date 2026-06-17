import { Field, ObjectType } from '@nestjs/graphql';
import { DebtsToPayAllObjectType } from './debtsToPay.model';

@ObjectType('PPDebtsToPayDueDetailObjectType')
export class PPDebtsToPayDueDetailObjectType {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  description: string;

  @Field(() => Date)
  expirationDate: Date;

  @Field(() => Number)
  amount: number;

  @Field(() => Number)
  paidAmount: number;

  @Field(() => Number)
  pendingBalance: number;

  @Field(() => String)
  status: string;
}

@ObjectType('PPDebtsToPayDetailObjectType')
export class PPDebtsToPayDetailObjectType {
  @Field(() => DebtsToPayAllObjectType)
  debt: DebtsToPayAllObjectType;

  @Field(() => Number)
  totalDebt: number;

  @Field(() => Number)
  totalPaid: number;

  @Field(() => Number)
  totalPending: number;

  @Field(() => [PPDebtsToPayDueDetailObjectType])
  dues: PPDebtsToPayDueDetailObjectType[];
}
