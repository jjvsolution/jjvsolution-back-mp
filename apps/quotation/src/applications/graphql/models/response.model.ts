import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType('ResponseObjectType')
export class ResponseObjectType<T> {
  @Field(() => Number, { nullable: true })
  code: number;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  payload: T;

  @Field(() => String, { nullable: true })
  monitoringCode?: string;

  @Field(() => [String], { nullable: true })
  errors?: string[];

  @Field(() => [DataObjectType], { nullable: true })
  data?: DataObjectType[];
}

export type TypeData = '' | 'WARN' | 'ERROR' | 'SUCCESS' | 'INFO';

@ObjectType('DataObjectType')
export class DataObjectType {
  @Field(() => String, { nullable: true })
  message: string;

  @Field(() => String, { nullable: true })
  type: TypeData;

  @Field(() => String, { nullable: true })
  monitoringCode: string;

  @Field(() => Boolean, { nullable: true })
  closable?: boolean = false;

  @Field(() => Boolean, { nullable: true })
  duration?: number = 5000;
}
