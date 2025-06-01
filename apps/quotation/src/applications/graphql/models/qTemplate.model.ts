import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QUsersModel } from './qUsers.model';

@ObjectType('QTemplateObjectType')
@InputType('QTemplateInputType')
export class QTemplateModel {
  @Field(() => String)
  key: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  template: string;

  @Field(() => Boolean)
  isPrincipal: boolean;

  @Field(() => Number)
  usersId: number;
}

@ObjectType('QTemplateAllObjectType')
@InputType('QTemplateAllInputType')
export class QTemplateAllModel extends QTemplateModel {
  @Field(() => Number)
  id: number;

  @Field(() => QUsersModel, { nullable: true })
  users?: QUsersModel;
}
