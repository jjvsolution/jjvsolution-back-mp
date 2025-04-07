import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QBusinessAllModel, QBusinessModel } from './models';
import { QBusinessRepository } from '@database/prisma';

@Resolver(() => QBusinessAllModel)
export class QBusinessResolver {
  constructor(private readonly qBusinessRepository: QBusinessRepository) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QBusinessAllModel])
  async QBusiness(): Promise<QBusinessAllModel[]> {
    return this.qBusinessRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QBusinessAllModel, { nullable: true })
  async QBusinessById(@Args('id') id: number): Promise<QBusinessAllModel | null> {
    return this.qBusinessRepository.db.findUnique({ where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QBusinessAllModel, { nullable: true })
  async QBusinessCreate(
    @Args('data') data: QBusinessModel,
  ): Promise<QBusinessAllModel | null> {
    return this.qBusinessRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QBusinessAllModel, { nullable: true })
  async QBusinessUpdate(
    @Args('id') id: number,
    @Args('data') data: QBusinessModel,
  ): Promise<QBusinessAllModel | null> {
    return this.qBusinessRepository.db.update({ data, where: { id } });
  }
}
