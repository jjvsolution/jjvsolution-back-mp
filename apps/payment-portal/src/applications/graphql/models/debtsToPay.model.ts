import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { DuesofPayAllObjectType } from './duesOfPay.model';

@ObjectType('DebtsToPayObjectType')
@InputType('DebtsToPayInputType')
export class DebtsToPayObjectType {
  @Field(() => String)
  userId: string;

  @Field(() => Number)
  companyId: number;

  @Field(() => String, { nullable: true })
  payId?: string;

  @Field(() => String)
  description: string;
}

@ObjectType('DebtsToPayAllObjectType')
@InputType('DebtsToPayAllInputType')
export class DebtsToPayAllObjectType extends DebtsToPayObjectType {
  @Field(() => Number)
  id: number;

  @Field(() => [DuesofPayAllObjectType], { nullable: true })
  PPDuesofPay?: DuesofPayAllObjectType[];
}
