import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACProfilesObjectType')
@InputType('ACProfilesInputType')
export class ACProfilesModel {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  details?: string | null;

  @Field(() => String)
  applicationsId: string;
}

@ObjectType('ACProfilesAllObjectType')
@InputType('ACProfilesAllInputType')
export class ACProfilesAllModel extends ACProfilesModel {
  @Field(() => Number)
  id: number;
}
