import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACRolsObjectType')
@InputType('ACRolsInputType')
export class ACRolsModel {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  details?: string | null;
}

@ObjectType('ACRolsAllObjectType')
@InputType('ACRolsAllInputType')
export class ACRolsAllModel extends ACRolsModel {
  @Field(() => Number)
  id: number;
}
