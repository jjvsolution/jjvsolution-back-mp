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
  QProdServAllModel,
  QProdServModel,
  QQuotationAllModel,
} from './models';
import {
  QItemsQuotationRepository,
  QProdServRepository,
} from '@database/prisma';

@Resolver(() => QProdServAllModel)
export class QProdServResolver {
  constructor(
    private readonly qProdServRepository: QProdServRepository,
    private readonly qItemsQuotationRepository: QItemsQuotationRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QProdServAllModel])
  async QProdServ(): Promise<QProdServAllModel[]> {
    return this.qProdServRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QProdServAllModel, { nullable: true })
  async QProdServById(
    @Args('id') id: number,
  ): Promise<QProdServAllModel | null> {
    return this.qProdServRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => [QProdServAllModel], { nullable: true })
  async QProdServByDetail(
    @Args('detail') detail: string,
  ): Promise<QProdServAllModel[] | null> {
    return this.qProdServRepository.db.findMany({
      where: {
        detail: {
          contains: detail,
          mode: 'insensitive',
        },
        isDeleted: false,
      },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QProdServAllModel, { nullable: true })
  async QProdServCreate(
    @Args('data') data: QProdServModel,
  ): Promise<QProdServAllModel | null> {
    return this.qProdServRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QProdServAllModel, { nullable: true })
  async QProdServUpdate(
    @Args('id') id: number,
    @Args('data') data: QProdServModel,
  ): Promise<QProdServAllModel | null> {
    return this.qProdServRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QProdServAllModel, { nullable: true })
  async QProdServDelete(
    @Args('id') id: number,
  ): Promise<QProdServAllModel | null> {
    return this.qProdServRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
  @ResolveField(() => [QItemsQuotationAllModel])
  ItemsQuotation(@Parent() qProdServAllModel: QProdServAllModel) {
    return this.qItemsQuotationRepository.db.findMany({
      where: { prodServId: qProdServAllModel.id, isDeleted: false },
      orderBy: { id: 'asc' }
    });
  }
}
