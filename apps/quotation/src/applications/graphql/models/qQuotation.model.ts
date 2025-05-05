import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QClientsAllModel } from './qClients.model';
import { QStatusAllModel } from './qStatus.model';
import { QItemsQuotationAllModel } from './qItemsQuotation.model';

@ObjectType('QQuotationObjectType')
@InputType('QQuotationInputType')
export class QQuotationModel {
  @Field(() => String)
  folio: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  detail: string;

  @Field(() => String)
  dateQuote: string;

  @Field(() => Number)
  clientsId: number;

  @Field(() => Number)
  statusId: number;
}

@ObjectType('QQuotationAllObjectType')
@InputType('QQuotationAllInputType')
export class QQuotationAllModel extends QQuotationModel {
  @Field(() => Number)
  id: number;

  @Field(() => QClientsAllModel, { nullable: true })
  clients?: QClientsAllModel;

  @Field(() => QStatusAllModel, { nullable: true })
  status?: QStatusAllModel;

  @Field(() => [QItemsQuotationAllModel], { nullable: true })
  ItemsQuotation?: QItemsQuotationAllModel[];
}
