import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACUserAllModel, ACUserModel } from './models';
import { ACUserRepository } from '@database/prisma';

@Resolver(() => ACUserAllModel)
export class ACUserResolver {
  constructor(private readonly ACUserRepository: ACUserRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACUserAllModel])
  async ACUser(): Promise<ACUserAllModel[]> {
    return this.ACUserRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACUserAllModel, { nullable: true })
  async ACUserById(@Args('id') id: string): Promise<ACUserAllModel | null> {
    return this.ACUserRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACUserAllModel, { nullable: true })
  async ACUserCreate(
    @Args('data') data: ACUserModel,
  ): Promise<ACUserAllModel | null> {
    return this.ACUserRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACUserAllModel, { nullable: true })
  async ACUserUpdate(
    @Args('id') id: string,
    @Args('data') data: ACUserModel,
  ): Promise<ACUserAllModel | null> {
    return this.ACUserRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACUserAllModel, { nullable: true })
  async ACUserDelete(@Args('id') id: string): Promise<ACUserAllModel | null> {
    return this.ACUserRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
