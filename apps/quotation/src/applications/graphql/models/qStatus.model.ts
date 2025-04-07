import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QQuotationAllModel } from './qQuotation.model';

@ObjectType('QStatusObjectType')
@InputType('QStatusInputType')
export class QStatusModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  type: string;
}

@ObjectType('QStatusAllObjectType')
@InputType('QStatusAllInputType')
export class QStatusAllModel extends QStatusModel {
  @Field(() => Number)
  id: number;

  @Field(() => QQuotationAllModel, { nullable: true })
  quotation?: QQuotationAllModel;
}
