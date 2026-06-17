import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACRolsProfilesAllModel, ACRolsProfilesModel } from './models';
import { ACRolsProfilesRepository } from '@database/prisma';

@Resolver(() => ACRolsProfilesAllModel)
export class ACRolsProfilesResolver {
  constructor(
    private readonly ACRolsProfilesRepository: ACRolsProfilesRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACRolsProfilesAllModel])
  async ACRolsProfilesByProfileId(
    @Args('profileId') profileId: number,
  ): Promise<ACRolsProfilesAllModel[]> {
    return this.ACRolsProfilesRepository.db.findMany({
      where: { profileId },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACRolsProfilesAllModel, { nullable: true })
  async ACRolsProfilesCreate(
    @Args('data') data: ACRolsProfilesModel,
  ): Promise<ACRolsProfilesAllModel | null> {
    const existing = await this.ACRolsProfilesRepository.db.findFirst({
      where: {
        profileId: data.profileId,
        rolsId: data.rolsId,
      },
    });

    if (existing) {
      return existing;
    }

    try {
      return await this.ACRolsProfilesRepository.db.create({
        data: {
          profileId: data.profileId,
          rolsId: data.rolsId,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        return this.ACRolsProfilesRepository.db.findFirst({
          where: {
            profileId: data.profileId,
            rolsId: data.rolsId,
          },
        });
      }

      throw error;
    }
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACRolsProfilesAllModel, { nullable: true })
  async ACRolsProfilesDelete(
    @Args('id') id: number,
  ): Promise<ACRolsProfilesAllModel | null> {
    return this.ACRolsProfilesRepository.db.delete({
      where: { id },
    });
  }
}
