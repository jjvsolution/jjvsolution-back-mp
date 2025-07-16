import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { TypeToken } from '@prisma/client';

@ObjectType('ACTokenObjectType')
@InputType('ACTokenInputType')
export class ACTokenModel {
  @Field(() => String)
  type: TypeToken;

  @Field(() => String)
  token: string;

  @Field(() => String, { nullable: true })
  accessToken?: string | null;

  @Field(() => String, { nullable: true })
  refreshToken?: string | null;

  @Field(() => String, { nullable: true })
  openId?: string | null;

  @Field(() => String)
  userId: string;
}

@ObjectType('ACTokenAllObjectType')
@InputType('ACTokenAllInputType')
export class ACTokenAllModel extends ACTokenModel {
  @Field(() => Number)
  id: number;
}
