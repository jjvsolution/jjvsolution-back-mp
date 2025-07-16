import { Field, ObjectType, InputType } from '@nestjs/graphql';

@ObjectType('ACApplicationsCompaniesObjectType')
@InputType('ACApplicationsCompaniesInputType')
export class ACApplicationsCompaniesModel {
  @Field(() => Number)
  companiesId: number;

  @Field(() => String)
  applicationsId: string;
}

@ObjectType('ACApplicationsCompaniesAllObjectType')
@InputType('ACApplicationsCompaniesAllInputType')
export class ACApplicationsCompaniesAllModel extends ACApplicationsCompaniesModel {
  @Field(() => Number)
  id: number;
}
