import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACCompaniesObjectType')
@InputType('ACCompaniesInputType')
export class ACCompaniesModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  rut: string;

  @Field(() => Number, { nullable: true })
  CompaniesParentId?: number | null;
}

@ObjectType('ACCompaniesAllObjectType')
@InputType('ACCompaniesAllInputType')
export class ACCompaniesAllModel extends ACCompaniesModel {
  @Field(() => Number)
  id: number;
}
