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
  @Mutation(() => [ACRolsProfilesAllModel])
  async ACRolsProfilesCreateMany(
    @Args('data', { type: () => [ACRolsProfilesModel] }) data: ACRolsProfilesModel[],
  ): Promise<ACRolsProfilesAllModel[]> {
    const results: ACRolsProfilesAllModel[] = [];

    for (const item of data) {
      const existing = await this.ACRolsProfilesRepository.db.findFirst({
        where: {
          profileId: item.profileId,
          rolsId: item.rolsId,
        },
      });

      if (existing) {
        results.push(existing);
        continue;
      }

      try {
        const created = await this.ACRolsProfilesRepository.db.create({
          data: {
            profileId: item.profileId,
            rolsId: item.rolsId,
          },
        });
        results.push(created);
      } catch (error: any) {
        if (error?.code === 'P2002') {
          const found = await this.ACRolsProfilesRepository.db.findFirst({
            where: {
              profileId: item.profileId,
              rolsId: item.rolsId,
            },
          });
          if (found) {
            results.push(found);
          }
        } else {
          throw error;
        }
      }
    }

    return results;
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
