import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  QTemplateAllModel,
  QTemplateModel,
  ResponseObjectType,
} from './models';
import { QTemplateRepository } from '@database/prisma';
import { QTemplateBusiness } from '@business';
import { replaceInterface } from 'common/business/generic/generate-pdf.business';

@Resolver(() => QTemplateAllModel)
export class QTemplateResolver {
  constructor(
    private readonly qTemplateRepository: QTemplateRepository,
    private readonly qTemplateBusiness: QTemplateBusiness,
  ) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QTemplateAllModel])
  async QTemplate(): Promise<QTemplateAllModel[]> {
    return this.qTemplateRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QTemplateAllModel, { nullable: true })
  async QTemplateById(
    @Args('id') id: number,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QTemplateAllModel, { nullable: true })
  async QTemplateByKey(
    @Args('key') key: string,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.findUnique({ where: { key } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QTemplateAllModel, { nullable: true })
  async QTemplateCreate(
    @Args('data') data: QTemplateModel,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QTemplateAllModel, { nullable: true })
  async QTemplateUpdate(
    @Args('id') id: number,
    @Args('data') data: QTemplateModel,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.update({ data, where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QTemplateAllModel, { nullable: true })
  async QTemplateDelete(
    @Args('id') id: number,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ResponseObjectType<string>)
  async getTemplatePlantilla(@Args('quotationId') quotationId: number,): Promise<
    ResponseObjectType<replaceInterface[]>
  > {
    return this.qTemplateBusiness.getTemplatePlantilla(1, quotationId);
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => ResponseObjectType<string>)
  async getTemplate(@Args('quotationId') quotationId: number,): Promise<ResponseObjectType<string>> {
    return this.qTemplateBusiness.getTemplate(1, quotationId);
  }

  //@UseGuards(JwtAuthGuard)
  @Query(() => ResponseObjectType<string>)
  async getUserTemplate(): Promise<ResponseObjectType<string>> {
    return this.qTemplateBusiness.getUserTemplate(1);
  }
}
