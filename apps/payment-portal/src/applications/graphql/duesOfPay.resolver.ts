import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { PPDuesOfPayRepository } from '@database/prisma';
import { DuesofPayAllObjectType, DuesofPayObjectType } from './models';

@Resolver(() => DuesofPayAllObjectType)
export class PPDuesofPayResolver {
  constructor(private readonly ppDuesOfPayRepository: PPDuesOfPayRepository) {}

  // @UseGuards(GQLInternalGuard)
  @Query(() => DuesofPayAllObjectType, { nullable: true })
  async PPDebtsToPayPayId(
    @Args('id') id: number,
  ): Promise<DuesofPayAllObjectType | null> {
    return this.ppDuesOfPayRepository.db.findUnique({ where: { id } });
  }

  // @UseGuards(GQLInternalGuard)
  @Mutation(() => DuesofPayObjectType, { nullable: true })
  async PPCreateDuesofPay(
    @Args('data') data: DuesofPayObjectType,
  ): Promise<DuesofPayObjectType | null> {
    return this.ppDuesOfPayRepository.db.create({ data });
  }

  // @UseGuards(GQLInternalGuard)
  @Mutation(() => DuesofPayObjectType, { nullable: true })
  async PPUpdateDuesofPay(
    @Args('id') id: number,
    @Args('data') data: DuesofPayObjectType,
  ): Promise<DuesofPayObjectType | null> {
    return this.ppDuesOfPayRepository.db.update({ data, where: { id } });
  }
}
