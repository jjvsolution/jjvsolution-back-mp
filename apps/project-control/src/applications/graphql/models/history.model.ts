import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PCHistoryObjectType')
export class PCHistoryModel {
  @Field(() => Int)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Int)
  companyId: number;

  @Field(() => String)
  userId: string;

  @Field(() => Int)
  projectId: number;

  @Field(() => String)
  entityType: string;

  @Field(() => Int)
  entityId: number;

  @Field(() => String)
  action: string;

  @Field(() => String, { nullable: true })
  fieldName?: string | null;

  @Field(() => String, { nullable: true })
  oldValue?: string | null;

  @Field(() => String, { nullable: true })
  newValue?: string | null;
}
