import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { QTypeFileAllModel, QTypeFileModel } from './models';
import { QTypeFileRepository } from '@database/prisma';

@Resolver(() => QTypeFileAllModel)
export class QTypeFileResolver {
  constructor(private readonly qTypeFileRepository: QTypeFileRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QTypeFileAllModel])
  async QTypeFile(): Promise<QTypeFileAllModel[]> {
    return this.qTypeFileRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => QTypeFileAllModel, { nullable: true })
  async QTypeFileById(
    @Args('id') id: number,
  ): Promise<QTypeFileAllModel | null> {
    return this.qTypeFileRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QTypeFileAllModel, { nullable: true })
  async QTypeFileCreate(
    @Args('data') data: QTypeFileModel,
  ): Promise<QTypeFileAllModel | null> {
    return this.qTypeFileRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QTypeFileAllModel, { nullable: true })
  async QTypeFileUpdate(
    @Args('id') id: number,
    @Args('data') data: QTypeFileModel,
  ): Promise<QTypeFileAllModel | null> {
    return this.qTypeFileRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => QTypeFileAllModel, { nullable: true })
  async QTypeFileDelete(
    @Args('id') id: number,
  ): Promise<QTypeFileAllModel | null> {
    return this.qTypeFileRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
