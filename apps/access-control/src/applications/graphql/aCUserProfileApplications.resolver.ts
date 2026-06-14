import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  ACUserProfileApplicationsAllModel,
  ACUserProfileApplicationsModel,
} from './models';
import { ACUserProfileApplicationsRepository } from '@database/prisma';

@Resolver(() => ACUserProfileApplicationsAllModel)
export class ACUserProfileApplicationsResolver {
  constructor(
    private readonly ACUserProfileApplicationsRepository: ACUserProfileApplicationsRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACUserProfileApplicationsAllModel])
  async ACUserProfileApplications(): Promise<ACUserProfileApplicationsAllModel[]> {
    return this.ACUserProfileApplicationsRepository.db.findMany({
      where: {
        Users: { isDeleted: false },
        Profiles: { isDeleted: false },
      },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => ACUserProfileApplicationsAllModel, { nullable: true })
  async ACUserProfileApplicationsById(
    @Args('id') id: number,
  ): Promise<ACUserProfileApplicationsAllModel | null> {
    return this.ACUserProfileApplicationsRepository.db.findUnique({
      where: { id },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACUserProfileApplicationsAllModel, { nullable: true })
  async ACUserProfileApplicationsCreate(
    @Args('data') data: ACUserProfileApplicationsModel,
  ): Promise<ACUserProfileApplicationsAllModel | null> {
    const existing = await this.ACUserProfileApplicationsRepository.db.findFirst({
      where: {
        usersId: data.usersId,
        profileId: data.profileId,
      },
    });

    if (existing) {
      return null;
    }

    try {
      return await this.ACUserProfileApplicationsRepository.db.create({
        data: {
          usersId: data.usersId,
          profileId: data.profileId,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return null;
      }

      throw error;
    }
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACUserProfileApplicationsAllModel, { nullable: true })
  async ACUserProfileApplicationsUpdate(
    @Args('id') id: number,
    @Args('data') data: ACUserProfileApplicationsModel,
  ): Promise<ACUserProfileApplicationsAllModel | null> {
    const existing = await this.ACUserProfileApplicationsRepository.db.findFirst({
      where: {
        usersId: data.usersId,
        profileId: data.profileId,
        NOT: { id },
      },
    });

    if (existing) {
      return null;
    }

    return this.ACUserProfileApplicationsRepository.db.update({
      data: {
        usersId: data.usersId,
        profileId: data.profileId,
      },
      where: { id },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACUserProfileApplicationsAllModel, { nullable: true })
  async ACUserProfileApplicationsDelete(
    @Args('id') id: number,
  ): Promise<ACUserProfileApplicationsAllModel | null> {
    return this.ACUserProfileApplicationsRepository.db.delete({
      where: { id },
    });
  }
}
