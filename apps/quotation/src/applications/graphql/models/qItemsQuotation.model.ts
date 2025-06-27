import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QProdServAllModel } from './qProdServ.model';
import { QQuotationAllModel } from './qQuotation.model';

@ObjectType('QItemsQuotationObjectType')
@InputType('QItemsQuotationInputType')
export class QItemsQuotationModel {
  @Field(() => Number)
  cant: number;

  @Field(() => String)
  detail: string;

  @Field(() => Number, { nullable: true })
  prodServId?: number | null;

  @Field(() => Number, { nullable: true })
  quotationId?: number | null;
}

@ObjectType('QItemsQuotationAllObjectType')
@InputType('QItemsQuotationAllInputType')
export class QItemsQuotationAllModel extends QItemsQuotationModel {
  @Field(() => Number)
  id: number;

  @Field(() => QProdServAllModel, { nullable: true })
  prodServ?: QProdServAllModel;

  @Field(() => QQuotationAllModel, { nullable: true })
  quotation?: QQuotationAllModel;
}
