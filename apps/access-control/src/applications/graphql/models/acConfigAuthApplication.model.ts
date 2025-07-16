import { Field, ObjectType, InputType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType('ACConfigAuthApplicationObjectType')
@InputType('ACConfigAuthApplicationInputType')
export class ACConfigAuthApplicationModel {
  @Field(() => GraphQLJSON, { nullable: true })
  jwt?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  google?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  github?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  facebook?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  linkedin?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  apple?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  twitter?: any | null;

  @Field(() => GraphQLJSON, { nullable: true })
  microsoft?: any | null;
}

@ObjectType('ACConfigAuthApplicationAllObjectType')
@InputType('ACConfigAuthApplicationAllInputType')
export class ACConfigAuthApplicationAllModel extends ACConfigAuthApplicationModel {
  @Field(() => Number)
  id: number;
}
