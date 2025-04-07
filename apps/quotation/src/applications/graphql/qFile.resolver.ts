import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QFileAllModel, QFileModel } from './models';
import { QFileRepository } from '@database/prisma';

@Resolver(() => QFileAllModel)
export class QFileResolver {
  constructor(private readonly qFileRepository: QFileRepository) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QFileAllModel])
  async QUser(): Promise<QFileAllModel[]> {
    return this.qFileRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QFileAllModel, { nullable: true })
  async QUserById(@Args('id') id: number): Promise<QFileAllModel | null> {
    return this.qFileRepository.db.findUnique({ where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QFileAllModel, { nullable: true })
  async QUserCreate(
    @Args('data') data: QFileModel,
  ): Promise<QFileAllModel | null> {
    return this.qFileRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QFileAllModel, { nullable: true })
  async QUserUpdate(
    @Args('id') id: number,
    @Args('data') data: QFileModel,
  ): Promise<QFileAllModel | null> {
    return this.qFileRepository.db.update({ data, where: { id } });
  }
}
