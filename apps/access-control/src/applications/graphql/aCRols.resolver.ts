import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACRolsAllModel, ACRolsModel } from './models';
import { ACRolsRepository } from '@database/prisma';

@Resolver(() => ACRolsAllModel)
export class ACRolsResolver {
  constructor(private readonly ACRolsRepository: ACRolsRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACRolsAllModel])
  async ACRols(): Promise<ACRolsAllModel[]> {
    return this.ACRolsRepository.db.findMany({});
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACRolsAllModel, { nullable: true })
  async ACRolsById(@Args('id') id: number): Promise<ACRolsAllModel | null> {
    return this.ACRolsRepository.db.findUnique({
      where: { id },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACRolsAllModel, { nullable: true })
  async ACRolsCreate(
    @Args('data') data: ACRolsModel,
  ): Promise<ACRolsAllModel | null> {
    return this.ACRolsRepository.db.create({
      data: {
        name: data.name,
        details: data.details ?? null,
      },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACRolsAllModel, { nullable: true })
  async ACRolsUpdate(
    @Args('id') id: number,
    @Args('data') data: ACRolsModel,
  ): Promise<ACRolsAllModel | null> {
    return this.ACRolsRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACRolsAllModel, { nullable: true })
  async ACRolsDelete(@Args('id') id: number): Promise<ACRolsAllModel | null> {
    return this.ACRolsRepository.db.delete({
      where: { id },
    });
  }
}
