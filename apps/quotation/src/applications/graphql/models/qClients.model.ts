import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QBusinessAllModel } from './qBusiness.model';
import { QQuotationAllModel } from './qQuotation.model';

@ObjectType('QClientsObjectType')
@InputType('QClientsInputType')
export class QClientsModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  rut: string;

  @Field(() => String)
  address: string;

  @Field(() => String, { nullable: true })
  emails?: string | null;

  @Field(() => String, { nullable: true })
  emailAdditionals?: string | null;

  @Field(() => Number, { nullable: true })
  businessId?: number;
}

@ObjectType('QClientsAllObjectType')
@InputType('QClientsAllInputType')
export class QClientsAllModel extends QClientsModel {
  @Field(() => Number)
  id: number;

  @Field(() => QBusinessAllModel, { nullable: true })
  business?: QBusinessAllModel;

  @Field(() => QQuotationAllModel, { nullable: true })
  quotation?: QQuotationAllModel;
}
