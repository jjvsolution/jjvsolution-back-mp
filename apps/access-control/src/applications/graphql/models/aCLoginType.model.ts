import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { TypeToken } from '@prisma/client';

@ObjectType('ACLoginTypeObjectType')
@InputType('ACLoginTypeInputType')
export class ACLoginTypeModel {
  @Field(() => String)
  type: TypeToken;

  @Field(() => String)
  username: string;

  @Field(() => String, { nullable: true })
  password?: string | null;

  @Field(() => String)
  userId: string;
}

@ObjectType('ACLoginTypeAllObjectType')
@InputType('ACLoginTypeAllInputType')
export class ACLoginTypeAllModel extends ACLoginTypeModel {
  @Field(() => Number)
  id: number;
}
