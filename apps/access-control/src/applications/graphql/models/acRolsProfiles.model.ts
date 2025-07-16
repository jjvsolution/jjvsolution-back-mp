import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACRolsProfilesObjectType')
@InputType('ACRolsProfilesInputType')
export class ACRolsProfilesModel {
  @Field(() => Number)
  profileId: number;

  @Field(() => Number)
  rolsId: number;
}

@ObjectType('ACRolsProfilesAllObjectType')
@InputType('ACRolsProfilesAllInputType')
export class ACRolsProfilesAllModel extends ACRolsProfilesModel {
  @Field(() => Number)
  id: number;
}
