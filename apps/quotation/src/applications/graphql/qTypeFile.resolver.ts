import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QTypeFileAllModel, QTypeFileModel } from './models';
import { QTypeFileRepository } from '@database/prisma';

@Resolver(() => QTypeFileAllModel)
export class QTypeFileResolver {
  constructor(private readonly qTypeFileRepository: QTypeFileRepository) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QTypeFileAllModel])
  async QUser(): Promise<QTypeFileAllModel[]> {
    return this.qTypeFileRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QTypeFileAllModel, { nullable: true })
  async QUserById(@Args('id') id: number): Promise<QTypeFileAllModel | null> {
    return this.qTypeFileRepository.db.findUnique({ where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QTypeFileAllModel, { nullable: true })
  async QUserCreate(
    @Args('data') data: QTypeFileModel,
  ): Promise<QTypeFileAllModel | null> {
    return this.qTypeFileRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QTypeFileAllModel, { nullable: true })
  async QUserUpdate(
    @Args('id') id: number,
    @Args('data') data: QTypeFileModel,
  ): Promise<QTypeFileAllModel | null> {
    return this.qTypeFileRepository.db.update({ data, where: { id } });
  }
}
