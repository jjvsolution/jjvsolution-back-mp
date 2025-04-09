import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import {
  QTemplateAllModel,
  QTemplateModel,
  ResponseObjectType,
} from './models';
import { QTemplateRepository } from '@database/prisma';
import { QTemplateBusiness } from '@business';

@Resolver(() => QTemplateAllModel)
export class QTemplateResolver {
  constructor(
    private readonly qTemplateRepository: QTemplateRepository,
    private readonly qTemplateBusiness: QTemplateBusiness,
  ) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QTemplateAllModel])
  async QTemplate(): Promise<QTemplateAllModel[]> {
    return this.qTemplateRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QTemplateAllModel, { nullable: true })
  async QTemplateById(
    @Args('id') id: number,
  ): Promise<QTemplateAllModel | null> {
    return this.qTemplateRepository.db.findUnique({ where: { id } });
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
  @Query(() => ResponseObjectType<string>)
  async getTemplate(): Promise<ResponseObjectType<string>> {
    return this.qTemplateBusiness.getTemplate();
  }
}
