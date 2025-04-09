import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('QTemplateObjectType')
@InputType('QTemplateInputType')
export class QTemplateModel {
  @Field(() => String)
  key: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  template: string;
}

@ObjectType('QTemplateAllObjectType')
@InputType('QTemplateAllInputType')
export class QTemplateAllModel extends QTemplateModel {
  @Field(() => Number)
  id: number;
}
