import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACCompaniesAllModel, ACCompaniesModel } from './models';
import { ACCompaniesRepository } from '@database/prisma';

@Resolver(() => ACCompaniesAllModel)
export class ACCompaniesResolver {
  constructor(private readonly ACCompaniesRepository: ACCompaniesRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACCompaniesAllModel])
  async ACCompanies(): Promise<ACCompaniesAllModel[]> {
    return this.ACCompaniesRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACCompaniesAllModel, { nullable: true })
  async ACCompaniesById(@Args('id') id: number): Promise<ACCompaniesAllModel | null> {
    return this.ACCompaniesRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACCompaniesAllModel, { nullable: true })
  async ACCompaniesCreate(
    @Args('data') data: ACCompaniesModel,
  ): Promise<ACCompaniesAllModel | null> {
    return this.ACCompaniesRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACCompaniesAllModel, { nullable: true })
  async ACCompaniesUpdate(
    @Args('id') id: number,
    @Args('data') data: ACCompaniesModel,
  ): Promise<ACCompaniesAllModel | null> {
    return this.ACCompaniesRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACCompaniesAllModel, { nullable: true })
  async ACCompaniesDelete(@Args('id') id: number): Promise<ACCompaniesAllModel | null> {
    return this.ACCompaniesRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
