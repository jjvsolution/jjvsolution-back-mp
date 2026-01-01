import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation, Context } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACApplicationsAllModel, ACApplicationsModel } from './models';
import { ACApplicationsRepository } from '@database/prisma';
import { RequestWithUserInterface } from '@interfaces';

@Resolver(() => ACApplicationsAllModel)
export class ACApplicationsResolver {
  constructor(
    private readonly ACApplicationsRepository: ACApplicationsRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACApplicationsAllModel])
  async ACApplications(): Promise<ACApplicationsAllModel[]> {
    return this.ACApplicationsRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => [ACApplicationsAllModel])
  async ACApplicationsByUser(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<ACApplicationsAllModel[]> {
    return this.ACApplicationsRepository.db.findMany({
      where: { isDeleted: false, id: { in: ctx.req.user.applications } },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACApplicationsAllModel, { nullable: true })
  async ACApplicationsById(
    @Args('id') id: string,
  ): Promise<ACApplicationsAllModel | null> {
    return this.ACApplicationsRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACApplicationsAllModel, { nullable: true })
  async ACApplicationsCreate(
    @Args('data') data: ACApplicationsModel,
  ): Promise<ACApplicationsAllModel | null> {
    return this.ACApplicationsRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACApplicationsAllModel, { nullable: true })
  async ACApplicationsUpdate(
    @Args('id') id: string,
    @Args('data') data: ACApplicationsModel,
  ): Promise<ACApplicationsAllModel | null> {
    return this.ACApplicationsRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACApplicationsAllModel, { nullable: true })
  async ACApplicationsDelete(
    @Args('id') id: string,
  ): Promise<ACApplicationsAllModel | null> {
    return this.ACApplicationsRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
