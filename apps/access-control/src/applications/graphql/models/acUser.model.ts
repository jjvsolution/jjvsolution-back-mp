import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACUserObjectType')
@InputType('ACUserInputType')
export class ACUserModel {
  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  firstName?: string | null;

  @Field(() => String, { nullable: true })
  lastName?: string | null;

  @Field(() => String, { nullable: true })
  fullName?: string | null;

  @Field(() => String, { nullable: true })
  picture?: string | null;

  @Field(() => String, { nullable: true })
  twofa_auth_url?: string | null;

  @Field(() => String, { nullable: true })
  twofa_base32?: string | null;

  @Field(() => Boolean, { nullable: true })
  twofa_enabled?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  twofa_verified?: boolean | null;
}

@ObjectType('ACUserAllObjectType')
@InputType('ACUserAllInputType')
export class ACUserAllModel extends ACUserModel {
  @Field(() => String)
  id: string;
}
