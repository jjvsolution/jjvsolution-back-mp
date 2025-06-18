import { UseGuards } from '@nestjs/common';
import {
  Query,
  Args,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { QClientsAllModel, QItemsQuotationAllModel, QQuotationAllModel, QQuotationModel, QStatusAllModel } from './models';
import {
  QClientsRepository,
  QItemsQuotationRepository,
  QQuotationRepository,
  QStatusRepository,
} from '@database/prisma';
import { QQuotationBusiness } from 'common/business/quotation/qQuotation.business';

import GraphQLJSON from 'graphql-type-json';

@Resolver(() => QQuotationAllModel)
export class QQuotationResolver {
  constructor(
    private readonly qQuotationBusiness: QQuotationBusiness,
    private readonly qQuotationRepository: QQuotationRepository,
    private readonly qClientsRepository: QClientsRepository,
    private readonly qStatusRepository: QStatusRepository,
    private readonly qItemsQuotationRepository: QItemsQuotationRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QQuotationAllModel])
  async QQuotation(): Promise<QQuotationAllModel[]> {
    return this.qQuotationRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QQuotationAllModel, { nullable: true })
  async QQuotationById(
    @Args('id') id: number,
  ): Promise<QQuotationAllModel | null> {
    return this.qQuotationRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QQuotationAllModel, { nullable: true })
  async QQuotationCreate(
    @Args('data') data: QQuotationModel,
  ): Promise<QQuotationAllModel | null> {
    return this.qQuotationBusiness.createQuotation(data);
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QQuotationAllModel, { nullable: true })
  async QQuotationUpdate(
    @Args('id') id: number,
    @Args('data') data: QQuotationModel,
  ): Promise<QQuotationAllModel | null> {
    return this.qQuotationRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QQuotationAllModel, { nullable: true })
  async QQuotationDelete(
    @Args('id') id: number,
  ): Promise<QQuotationAllModel | null> {
    return this.qQuotationRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async createFolio(@Args('id') id: number): Promise<undefined> {
    await this.qQuotationBusiness.createFolio(id);
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async sendQuotation(@Args('id') id: number): Promise<undefined> {
    await this.qQuotationBusiness.sendQuotation(id);
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async approvedQuotation(@Args('id') id: number): Promise<undefined> {
    await this.qQuotationBusiness.approvedQuotation(id);
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async refusedQuotation(@Args('id') id: number): Promise<undefined> {
    await this.qQuotationBusiness.refusedQuotation(id);
  }
  @ResolveField(() => QClientsAllModel)
  clients(@Parent() qQuotationAllModel: QQuotationAllModel) {
    return this.qClientsRepository.db.findUnique({
      where: { id: qQuotationAllModel.clientsId, isDeleted: false },
    });
  }
  @ResolveField(() => QStatusAllModel)
  status(@Parent() qQuotationAllModel: QQuotationAllModel) {
    return this.qStatusRepository.db.findUnique({
      where: { id: qQuotationAllModel.statusId, isDeleted: false },
    });
  }
  @ResolveField(() => [QItemsQuotationAllModel])
  ItemsQuotation(@Parent() qQuotationAllModel: QQuotationAllModel) {
    return this.qItemsQuotationRepository.db.findMany({
      where: { quotationId: qQuotationAllModel.id, isDeleted: false },
      orderBy: { id: 'asc' }
    });
  }
}
