import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType('DebtsToPayObjectType')
@InputType('DebtsToPayInputType')
export class DebtsToPayObjectType {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  payId: string;

  @Field(() => String)
  description: string;

  @Field(() => [DebtsToPayAllObjectType], { nullable: true })
  debtsToPay?: DebtsToPayAllObjectType[];
}

@ObjectType('DebtsToPayAllObjectType')
@InputType('DebtsToPayAllInputType')
export class DebtsToPayAllObjectType extends DebtsToPayObjectType {
  @Field(() => Number)
  id: number;
}
