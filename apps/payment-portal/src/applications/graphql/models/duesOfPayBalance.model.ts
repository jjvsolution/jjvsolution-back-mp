import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('PPDuesofPayBalanceObjectType')
export class PPDuesofPayBalanceObjectType {
  @Field(() => Number)
  total: number;

  @Field(() => Number)
  count: number;
}
