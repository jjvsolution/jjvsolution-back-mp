import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QTypeFileAllModel } from './qTypeFile.model';
import { QQuotationAllModel } from './qQuotation.model';

@ObjectType('QFileObjectType')
@InputType('QFileInputType')
export class QFileModel {
  @Field(() => String)
  url: string;

  @Field(() => Number)
  typeFileId: number;
}

@ObjectType('QFileAllObjectType')
@InputType('QFileAllInputType')
export class QFileAllModel extends QFileModel {
  @Field(() => Number)
  id: number;

  @Field(() => QTypeFileAllModel, { nullable: true })
  typeFile?: QTypeFileAllModel;

  @Field(() => QQuotationAllModel, { nullable: true })
  quotation?: QQuotationAllModel;
}
