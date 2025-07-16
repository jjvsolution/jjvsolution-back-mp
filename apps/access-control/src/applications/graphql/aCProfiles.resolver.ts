import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACProfilesAllModel, ACProfilesModel } from './models';
import { ACProfilesRepository } from '@database/prisma';

@Resolver(() => ACProfilesAllModel)
export class ACProfilesResolver {
  constructor(private readonly ACProfilesRepository: ACProfilesRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACProfilesAllModel])
  async ACProfiles(): Promise<ACProfilesAllModel[]> {
    return this.ACProfilesRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACProfilesAllModel, { nullable: true })
  async ACProfilesById(@Args('id') id: number): Promise<ACProfilesAllModel | null> {
    return this.ACProfilesRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACProfilesAllModel, { nullable: true })
  async ACProfilesCreate(
    @Args('data') data: ACProfilesModel,
  ): Promise<ACProfilesAllModel | null> {
    return this.ACProfilesRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACProfilesAllModel, { nullable: true })
  async ACProfilesUpdate(
    @Args('id') id: number,
    @Args('data') data: ACProfilesModel,
  ): Promise<ACProfilesAllModel | null> {
    return this.ACProfilesRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACProfilesAllModel, { nullable: true })
  async ACProfilesDelete(@Args('id') id: number): Promise<ACProfilesAllModel | null> {
    return this.ACProfilesRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
