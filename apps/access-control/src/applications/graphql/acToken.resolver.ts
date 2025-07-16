import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACTokenAllModel, ACTokenModel } from './models';
import { ACTokenRepository } from '@database/prisma';

@Resolver(() => ACTokenAllModel)
export class ACTokenResolver {
  constructor(private readonly ACTokenRepository: ACTokenRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACTokenAllModel])
  async ACToken(): Promise<ACTokenAllModel[]> {
    return this.ACTokenRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACTokenAllModel, { nullable: true })
  async ACTokenById(
    @Args('id') id: number,
  ): Promise<ACTokenAllModel | null> {
    return this.ACTokenRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACTokenAllModel, { nullable: true })
  async ACTokenCreate(
    @Args('data') data: ACTokenModel,
  ): Promise<ACTokenAllModel | null> {
    return this.ACTokenRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACTokenAllModel, { nullable: true })
  async ACTokenUpdate(
    @Args('id') id: number,
    @Args('data') data: ACTokenModel,
  ): Promise<ACTokenAllModel | null> {
    return this.ACTokenRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACTokenAllModel, { nullable: true })
  async ACTokenDelete(
    @Args('id') id: number,
  ): Promise<ACTokenAllModel | null> {
    return this.ACTokenRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
