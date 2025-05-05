import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { TypeTypeProdServ } from '@prisma/client';
import { QItemsQuotationAllModel } from './qItemsQuotation.model';

@ObjectType('QProdServObjectType')
@InputType('QProdServInputType')
export class QProdServModel {
  @Field(() => String)
  detail: string;

  @Field(() => String)
  gloss: string;

  @Field(() => Number)
  price: number;

  @Field(() => String)
  type: TypeTypeProdServ;
}

@ObjectType('QProdServAllObjectType')
@InputType('QProdServAllInputType')
export class QProdServAllModel extends QProdServModel {
  @Field(() => Number)
  id: number;

  @Field(() => [QItemsQuotationAllModel], { nullable: true })
  itemsQuotation?: QItemsQuotationAllModel[];
}
