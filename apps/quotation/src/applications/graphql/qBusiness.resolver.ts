import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { QBusinessAllModel, QBusinessModel } from './models';
import { QBusinessRepository } from '@database/prisma';

@Resolver(() => QBusinessAllModel)
export class QBusinessResolver {
  constructor(private readonly qBusinessRepository: QBusinessRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QBusinessAllModel])
  async QBusiness(): Promise<QBusinessAllModel[]> {
    return this.qBusinessRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QBusinessAllModel, { nullable: true })
  async QBusinessById(
    @Args('id') id: number,
  ): Promise<QBusinessAllModel | null> {
    return this.qBusinessRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QBusinessAllModel, { nullable: true })
  async QBusinessCreate(
    @Args('data') data: QBusinessModel,
  ): Promise<QBusinessAllModel | null> {
    return this.qBusinessRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QBusinessAllModel, { nullable: true })
  async QBusinessUpdate(
    @Args('id') id: number,
    @Args('data') data: QBusinessModel,
  ): Promise<QBusinessAllModel | null> {
    return this.qBusinessRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QBusinessAllModel, { nullable: true })
  async QBusinessDelete(
    @Args('id') id: number,
  ): Promise<QBusinessAllModel | null> {
    return this.qBusinessRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
