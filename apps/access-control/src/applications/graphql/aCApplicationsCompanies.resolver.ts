import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  ACApplicationsCompaniesAllModel,
  ACApplicationsCompaniesModel,
} from './models';
import { ACApplicationsCompaniesRepository } from '@database/prisma';

@Resolver(() => ACApplicationsCompaniesAllModel)
export class ACApplicationsCompaniesResolver {
  constructor(
    private readonly ACApplicationsCompaniesRepository: ACApplicationsCompaniesRepository,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Mutation(() => [ACApplicationsCompaniesAllModel])
  async ACApplicationsCompaniesCreateMany(
    @Args('data', { type: () => [ACApplicationsCompaniesModel] })
    data: ACApplicationsCompaniesModel[],
  ): Promise<ACApplicationsCompaniesAllModel[]> {
    const results: ACApplicationsCompaniesAllModel[] = [];

    for (const item of data) {
      const existing = await this.ACApplicationsCompaniesRepository.db.findFirst({
        where: {
          companiesId: item.companiesId,
          applicationsId: item.applicationsId,
        },
      });

      if (existing) {
        results.push(existing);
        continue;
      }

      try {
        const created = await this.ACApplicationsCompaniesRepository.db.create({
          data: {
            companiesId: item.companiesId,
            applicationsId: item.applicationsId,
          },
        });
        results.push(created);
      } catch (error: any) {
        if (error?.code === 'P2002') {
          const found = await this.ACApplicationsCompaniesRepository.db.findFirst({
            where: {
              companiesId: item.companiesId,
              applicationsId: item.applicationsId,
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
}
