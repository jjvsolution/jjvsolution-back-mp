import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QQuotationAllModel, QQuotationModel } from './models';
import { QQuotationRepository } from '@database/prisma';
import { QQuotationBusiness } from 'common/business/quotation/qQuotation.business';

import GraphQLJSON from 'graphql-type-json';

@Resolver(() => QQuotationAllModel)
export class QQuotationResolver {
  constructor(
    private readonly qQuotationBusiness: QQuotationBusiness,
    private readonly qQuotationRepository: QQuotationRepository,
  ) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QQuotationAllModel])
  async QQuotation(): Promise<QQuotationAllModel[]> {
    return this.qQuotationRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QQuotationAllModel, { nullable: true })
  async QQuotationById(
    @Args('id') id: number,
  ): Promise<QQuotationAllModel | null> {
    return this.qQuotationRepository.db.findUnique({ where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QQuotationAllModel, { nullable: true })
  async QQuotationCreate(
    @Args('data') data: QQuotationModel,
  ): Promise<QQuotationAllModel | null> {
    return this.qQuotationBusiness.create(data);
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QQuotationAllModel, { nullable: true })
  async QQuotationUpdate(
    @Args('id') id: number,
    @Args('data') data: QQuotationModel,
  ): Promise<QQuotationAllModel | null> {
    return this.qQuotationRepository.db.update({ data, where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async createFolio(
    @Args('id') id: number,
  ): Promise<undefined> {
    await this.qQuotationBusiness.createFolio(id);
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async sendQuotation(
    @Args('id') id: number,
  ): Promise<undefined> {
    await this.qQuotationBusiness.sendQuotation(id);
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async approvedQuotation(
    @Args('id') id: number,
  ): Promise<undefined> {
    await this.qQuotationBusiness.approvedQuotation(id);
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => GraphQLJSON, { nullable: true })
  async refusedQuotation(
    @Args('id') id: number,
  ): Promise<undefined> {
    await this.qQuotationBusiness.refusedQuotation(id);
  }
}
