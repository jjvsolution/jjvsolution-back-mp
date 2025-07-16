import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACApplicationsObjectType')
@InputType('ACApplicationsInputType')
export class ACApplicationsModel {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  url?: string | null;

  @Field(() => Number, { nullable: true })
  aCConfigAuthApplicationId?: number | null;
}

@ObjectType('ACApplicationsAllObjectType')
@InputType('ACApplicationsAllInputType')
export class ACApplicationsAllModel extends ACApplicationsModel {
  @Field(() => String)
  id: string;
}
