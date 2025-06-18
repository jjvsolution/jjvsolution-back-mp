import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { QFileAllModel, QFileModel } from './models';
import { QFileRepository } from '@database/prisma';

@Resolver(() => QFileAllModel)
export class QFileResolver {
  constructor(private readonly qFileRepository: QFileRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QFileAllModel])
  async QFile(): Promise<QFileAllModel[]> {
    return this.qFileRepository.db.findMany({ where: { isDeleted: false } });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QFileAllModel, { nullable: true })
  async QFileById(@Args('id') id: number): Promise<QFileAllModel | null> {
    return this.qFileRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QFileAllModel, { nullable: true })
  async QFileCreate(
    @Args('data') data: QFileModel,
  ): Promise<QFileAllModel | null> {
    return this.qFileRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QFileAllModel, { nullable: true })
  async QFileUpdate(
    @Args('id') id: number,
    @Args('data') data: QFileModel,
  ): Promise<QFileAllModel | null> {
    return this.qFileRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QFileAllModel, { nullable: true })
  async QFileDelete(@Args('id') id: number): Promise<QFileAllModel | null> {
    return this.qFileRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
