import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QItemsQuotationAllModel, QItemsQuotationModel } from './models';
import { QItemsQuotationRepository } from '@database/prisma';

@Resolver(() => QItemsQuotationAllModel)
export class QItemsQuotationResolver {
  constructor(private readonly qItemsQuotationRepository: QItemsQuotationRepository) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QItemsQuotationAllModel])
  async QItemsQuotation(): Promise<QItemsQuotationAllModel[]> {
    return this.qItemsQuotationRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QItemsQuotationAllModel, { nullable: true })
  async QItemsQuotationById(@Args('id') id: number): Promise<QItemsQuotationAllModel | null> {
    return this.qItemsQuotationRepository.db.findUnique({ where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QItemsQuotationAllModel, { nullable: true })
  async QItemsQuotationCreate(
    @Args('data') data: QItemsQuotationModel,
  ): Promise<QItemsQuotationAllModel | null> {
    return this.qItemsQuotationRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QItemsQuotationAllModel, { nullable: true })
  async QItemsQuotationUpdate(
    @Args('id') id: number,
    @Args('data') data: QItemsQuotationModel,
  ): Promise<QItemsQuotationAllModel | null> {
    return this.qItemsQuotationRepository.db.update({ data, where: { id } });
  }
}
