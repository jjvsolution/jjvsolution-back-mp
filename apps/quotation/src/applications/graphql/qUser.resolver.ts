import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QUsersAllModel, QUsersModel } from './models';
import { QUsersRepository } from '@database/prisma';

@Resolver(() => QUsersAllModel)
export class QUserResolver {
  constructor(private readonly qUsersRepository: QUsersRepository) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QUsersAllModel])
  async QUser(): Promise<QUsersAllModel[]> {
    return this.qUsersRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QUsersAllModel, { nullable: true })
  async QUserById(@Args('id') id: number): Promise<QUsersAllModel | null> {
    return this.qUsersRepository.db.findUnique({ where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QUsersAllModel, { nullable: true })
  async QUserCreate(
    @Args('data') data: QUsersModel,
  ): Promise<QUsersAllModel | null> {
    return this.qUsersRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QUsersAllModel, { nullable: true })
  async QUserUpdate(
    @Args('id') id: number,
    @Args('data') data: QUsersModel,
  ): Promise<QUsersAllModel | null> {
    return this.qUsersRepository.db.update({ data, where: { id } });
  }
}
