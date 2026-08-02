import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PCActorsObjectType')
@InputType('PCActorsInputType')
export class PCActorsModel {
  @Field(() => Int)
  companyId: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  position: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => Float, { nullable: true })
  defaultHourlyCost?: number;

  @Field(() => Float, { nullable: true })
  defaultDailyHours?: number;

  @Field(() => Boolean, { nullable: true })
  active?: boolean;
}

@ObjectType('PCActorsAllObjectType')
@InputType('PCActorsAllInputType')
export class PCActorsAllModel extends PCActorsModel {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  userId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isDeleted: boolean;
}
