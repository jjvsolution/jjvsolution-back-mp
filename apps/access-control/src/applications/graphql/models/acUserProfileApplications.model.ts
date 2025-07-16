import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACUserProfileApplicationsObjectType')
@InputType('ACUserProfileApplicationsInputType')
export class ACUserProfileApplicationsModel {
  @Field(() => String)
  usersId: string;

  @Field(() => String)
  profileId: number;
}

@ObjectType('ACUserProfileApplicationsAllObjectType')
@InputType('ACUserProfileApplicationsAllInputType')
export class ACUserProfileApplicationsAllModel extends ACUserProfileApplicationsModel {
  @Field(() => Number)
  id: number;
}
