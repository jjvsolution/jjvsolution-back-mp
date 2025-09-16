import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { QReportBusiness } from 'common/business';
import { GQLInternalGuard } from 'common/config/cross/guards';
import GraphQLJSON from 'graphql-type-json';

@Resolver(() => String)
export class QReportResolver {
  constructor(private readonly qReportBusiness: QReportBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => GraphQLJSON)
  async QDashboard(): Promise<object> {
    return this.qReportBusiness.QDashboard();
  }
}
