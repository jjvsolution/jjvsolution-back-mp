import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QBusinessAllModel } from './qBusiness.model';

@ObjectType('QUsersObjectType')
@InputType('QUsersInputType')
export class QUsersModel {
  @Field(() => String)
  UID: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@ObjectType('QUsersAllObjectType')
@InputType('QUsersAllInputType')
export class QUsersAllModel extends QUsersModel {
  @Field(() => Number)
  id: number;

  @Field(() => [QBusinessAllModel], {nullable: true})
  business?: QBusinessAllModel[];
}

