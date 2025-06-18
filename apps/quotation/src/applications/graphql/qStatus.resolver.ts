import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { QStatusAllModel, QStatusModel } from './models';
import { QStatusRepository } from '@database/prisma';

@Resolver(() => QStatusAllModel)
export class QStatusResolver {
  constructor(private readonly qStatusRepository: QStatusRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QStatusAllModel])
  async QStatus(): Promise<QStatusAllModel[]> {
    return this.qStatusRepository.db.findMany({ where: { isDeleted: false } });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QStatusAllModel, { nullable: true })
  async QStatusById(@Args('id') id: number): Promise<QStatusAllModel | null> {
    return this.qStatusRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QStatusAllModel, { nullable: true })
  async QStatusCreate(
    @Args('data') data: QStatusModel,
  ): Promise<QStatusAllModel | null> {
    return this.qStatusRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QStatusAllModel, { nullable: true })
  async QStatusUpdate(
    @Args('id') id: number,
    @Args('data') data: QStatusModel,
  ): Promise<QStatusAllModel | null> {
    return this.qStatusRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QStatusAllModel, { nullable: true })
  async QStatusDelete(@Args('id') id: number): Promise<QStatusAllModel | null> {
    return this.qStatusRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
