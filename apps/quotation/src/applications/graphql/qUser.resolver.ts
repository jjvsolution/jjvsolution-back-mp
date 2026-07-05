import { UseGuards } from '@nestjs/common';
import {
  Query,
  Args,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  QBusinessAllModel,
  QTemplateAllModel,
  QUsersAllModel,
  QUsersModel,
} from './models';
import {
  QBusinessRepository,
  QTemplateRepository,
  QUsersRepository,
} from '@database/prisma';

@Resolver(() => QUsersAllModel)
export class QUserResolver {
  constructor(
    private readonly qUsersRepository: QUsersRepository,
    private readonly qBusinessRepository: QBusinessRepository,
    private readonly qTemplateRepository: QTemplateRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [QUsersAllModel])
  async QUser(): Promise<QUsersAllModel[]> {
    return this.qUsersRepository.db.findMany({ where: { isDeleted: false } });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => QUsersAllModel, { nullable: true })
  async QUserById(@Args('id') id: number): Promise<QUsersAllModel | null> {
    return this.qUsersRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => QUsersAllModel, { nullable: true })
  async QUserCreate(
    @Args('data') data: QUsersModel,
  ): Promise<QUsersAllModel | null> {
    return this.qUsersRepository.db.create({ data });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => QUsersAllModel, { nullable: true })
  async QUserUpdate(
    @Args('id') id: number,
    @Args('data') data: QUsersModel,
  ): Promise<QUsersAllModel | null> {
    return this.qUsersRepository.db.update({ data, where: { id } });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => QUsersAllModel, { nullable: true })
  async QUserDelete(@Args('id') id: number): Promise<QUsersAllModel | null> {
    return this.qUsersRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }

  @ResolveField(() => [QBusinessAllModel], { nullable: true })
  business(@Parent() user: QUsersAllModel) {
    return this.qBusinessRepository.db.findMany({
      where: { usersId: user.id, isDeleted: false },
    });
  }

  @ResolveField(() => [QTemplateAllModel], { nullable: true })
  QTemplate(@Parent() user: QUsersAllModel) {
    return this.qTemplateRepository.db.findMany({
      where: { usersId: user.id, isDeleted: false },
    });
  }
}
