import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  ACConfigAuthApplicationAllModel,
  ACConfigAuthApplicationModel,
} from './models';
import { ACConfigAuthApplicationRepository } from '@database/prisma';

@Resolver(() => ACConfigAuthApplicationAllModel)
export class ACConfigAuthApplicationResolver {
  constructor(
    private readonly ACConfigAuthApplicationRepository: ACConfigAuthApplicationRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACConfigAuthApplicationAllModel])
  async ACConfigAuthApplication(): Promise<ACConfigAuthApplicationAllModel[]> {
    return this.ACConfigAuthApplicationRepository.db.findMany({});
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACConfigAuthApplicationAllModel, { nullable: true })
  async ACConfigAuthApplicationById(
    @Args('id') id: number,
  ): Promise<ACConfigAuthApplicationAllModel | null> {
    return this.ACConfigAuthApplicationRepository.db.findUnique({
      where: { id },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACConfigAuthApplicationAllModel, { nullable: true })
  async ACConfigAuthApplicationCreate(
    @Args('data') data: ACConfigAuthApplicationModel,
  ): Promise<ACConfigAuthApplicationAllModel | null> {
    return this.ACConfigAuthApplicationRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACConfigAuthApplicationAllModel, { nullable: true })
  async ACConfigAuthApplicationUpdate(
    @Args('id') id: number,
    @Args('data') data: ACConfigAuthApplicationModel,
  ): Promise<ACConfigAuthApplicationAllModel | null> {
    return this.ACConfigAuthApplicationRepository.db.update({
      data,
      where: { id },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACConfigAuthApplicationAllModel, { nullable: true })
  async ACConfigAuthApplicationDelete(
    @Args('id') id: number,
  ): Promise<ACConfigAuthApplicationAllModel | null> {
    return this.ACConfigAuthApplicationRepository.db.delete({
      where: { id },
    });
  }
}
