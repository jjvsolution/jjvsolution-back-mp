import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QUsersModel } from './qUsers.model';
import { QClientsAllModel } from './qClients.model';

@ObjectType('QBusinessObjectType')
@InputType('QBusinessInputType')
export class QBusinessModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  businessName: string;

  @Field(() => String)
  rut: string;

  @Field(() => String)
  address: string;

  @Field(() => String, { nullable: true })
  emails?: string | null;

  @Field(() => String, { nullable: true })
  emailAdditionals?: string | null;

  @Field(() => Number, { nullable: true })
  usersId?: number;
}

@ObjectType('QBusinessAllObjectType')
@InputType('QBusinessAllInputType')
export class QBusinessAllModel extends QBusinessModel {
  @Field(() => Number)
  id: number;

  @Field(() => QUsersModel, { nullable: true })
  users?: QUsersModel;

  @Field(() => [QClientsAllModel], { nullable: true })
  clients?: QClientsAllModel[];
}
