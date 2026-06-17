import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { $Enums } from '@prisma/client';

@ObjectType('DuesofPayObjectType')
@InputType('DuesofPayInputType')
export class DuesofPayObjectType {
  @Field(() => Date)
  expirationDate: Date;

  @Field(() => String)
  description: string;

  @Field(() => Number)
  amount: number;

  @Field(() => String)
  TypeOfCurrency: $Enums.PPTypeTypeOfCurrency;

  @Field(() => Boolean)
  paid: boolean;

  @Field(() => String, { nullable: true })
  paymentType?: $Enums.PPTypePaymentType | null;

  @Field(() => Number)
  debtsToPayId: number;
  
}

@ObjectType('DuesofPayAllObjectType')
@InputType('DuesofPayAllInputType')
export class DuesofPayAllObjectType extends DuesofPayObjectType {
  @Field(() => Number)
  id: number;
}
