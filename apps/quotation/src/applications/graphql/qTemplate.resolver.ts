import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation, Context } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  QTemplateAllModel,
  QTemplateModel,
  ResponseObjectType,
} from './models';
import { QTemplateRepository } from '@database/prisma';
import { QTemplateBusiness } from '@business';
import { replaceInterface } from 'common/business/generic/generate-pdf.business';
import { RequestWithUserInterface } from 'common/interfaces';

@Resolver(() => QTemplateAllModel)
export class QTemplateResolver {
  constructor(
    private readonly qTemplateRepository: QTemplateRepository,
    private readonly qTemplateBusiness: QTemplateBusiness,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QTemplateAllModel])
  async QTemplate(): Promise<QTemplateAllModel[]> {
    return this.qTemplateRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QTemplateAllModel, { nullable: true })
  async QTemplateById(
    @Args('id') id: number,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QTemplateAllModel, { nullable: true })
  async QTemplateByKey(
    @Args('key') key: string,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.findUnique({ where: { key } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QTemplateAllModel, { nullable: true })
  async QTemplateCreate(
    @Args('data') data: QTemplateModel,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QTemplateAllModel, { nullable: true })
  async QTemplateUpdate(
    @Args('id') id: number,
    @Args('data') data: QTemplateModel,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
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
  async getTemplatePlantilla(
    @Args('quotationId') quotationId: number,
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<ResponseObjectType<replaceInterface[]>> {
    return this.qTemplateBusiness.getTemplatePlantilla(ctx.req.user.uid, quotationId);
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ResponseObjectType<string>)
  async getTemplate(
    @Args('quotationId') quotationId: number,
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<ResponseObjectType<string>> {
    return this.qTemplateBusiness.getTemplate(ctx.req.user.uid, quotationId);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => ResponseObjectType<string>)
  async getUserTemplate(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<ResponseObjectType<string>> {
    return this.qTemplateBusiness.getUserTemplate(ctx.req.user.uid);
  }
}
