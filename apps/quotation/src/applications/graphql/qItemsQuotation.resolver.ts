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
import {
  QItemsQuotationAllModel,
  QItemsQuotationModel,
  QProdServAllModel,
  QQuotationAllModel,
} from './models';
import {
  QItemsQuotationRepository,
  QProdServRepository,
  QQuotationRepository,
} from '@database/prisma';

@Resolver(() => QItemsQuotationAllModel)
export class QItemsQuotationResolver {
  constructor(
    private readonly qItemsQuotationRepository: QItemsQuotationRepository,
    private readonly qProdServRepository: QProdServRepository,
    private readonly qQuotationRepository: QQuotationRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QItemsQuotationAllModel])
  async QItemsQuotation(): Promise<QItemsQuotationAllModel[]> {
    return this.qItemsQuotationRepository.db.findMany({
      where: { isDeleted: false },
      orderBy: { id: 'asc' }
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QItemsQuotationAllModel, { nullable: true })
  async QItemsQuotationById(
    @Args('id') id: number,
  ): Promise<QItemsQuotationAllModel | null> {
    return this.qItemsQuotationRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QItemsQuotationAllModel, { nullable: true })
  async QItemsQuotationCreate(
    @Args('data') data: QItemsQuotationModel,
  ): Promise<QItemsQuotationAllModel | null> {
    return this.qItemsQuotationRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QItemsQuotationAllModel, { nullable: true })
  async QItemsQuotationUpdate(
    @Args('id') id: number,
    @Args('data') data: QItemsQuotationModel,
  ): Promise<QItemsQuotationAllModel | null> {
    return this.qItemsQuotationRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QItemsQuotationAllModel, { nullable: true })
  async QItemsQuotationDelete(
    @Args('id') id: number,
  ): Promise<QItemsQuotationAllModel | null> {
    return this.qItemsQuotationRepository.db.delete({
      where: { id },
    });
  }
  @ResolveField(() => QProdServAllModel)
  prodServ(@Parent() qItemsQuotationAllModel: QItemsQuotationAllModel) {
    if (!qItemsQuotationAllModel?.prodServId) return {};
    return this.qProdServRepository.db.findUnique({
      where: { id: qItemsQuotationAllModel.prodServId, isDeleted: false },
    });
  }
  @ResolveField(() => QQuotationAllModel)
  quotation(@Parent() qItemsQuotationAllModel: QItemsQuotationAllModel) {
    if (!qItemsQuotationAllModel?.quotationId) return {};
    return this.qQuotationRepository.db.findUnique({
      where: { id: qItemsQuotationAllModel.quotationId, isDeleted: false },
    });
  }
}
