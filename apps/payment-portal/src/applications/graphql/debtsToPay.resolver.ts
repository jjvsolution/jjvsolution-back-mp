import { UseGuards } from '@nestjs/common';
import {
  Query,
  Args,
  Resolver,
  Mutation,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  DebtsToPayAllObjectType,
  DebtsToPayObjectType,
  DuesofPayAllObjectType,
} from './models';
import {
  PPDebtsToPayRepository,
  PPDuesOfPayRepository,
} from '@database/prisma';

@Resolver(() => DebtsToPayAllObjectType)
export class PPDebtsToPayResolver {
  constructor(
    private readonly ppDebtsToPayRepository: PPDebtsToPayRepository,
    private readonly ppDuesOfPayRepository: PPDuesOfPayRepository,
  ) {}

  //@UseGuards(GQLInternalGuard)
  @Query(() => DebtsToPayAllObjectType, { nullable: true })
  async PPDebtsToPayPayId(
    @Args('payId') payId: string,
  ): Promise<DebtsToPayAllObjectType | null> {
    return this.ppDebtsToPayRepository.db.findUnique({ where: { payId } });
  }

  //@UseGuards(GQLInternalGuard)
  @Query(() => DebtsToPayAllObjectType, { nullable: true })
  async PPDebtsToPay(
    @Args('id') id: number,
  ): Promise<DebtsToPayAllObjectType | null> {
    return this.ppDebtsToPayRepository.db.findUnique({ where: { id } });
  }

  //@UseGuards(GQLInternalGuard)
  @Query(() => [DebtsToPayAllObjectType])
  async PPDebtsToPayUserId(
    @Args('userId') userId: string,
  ): Promise<DebtsToPayAllObjectType[]> {
    return this.ppDebtsToPayRepository.db.findMany({ where: { userId } });
  }
  
  @Query(() => [DebtsToPayAllObjectType])
  async PPDebtsToPayCompanyId(
    @Args('companyId') companyId: string,
  ): Promise<DebtsToPayAllObjectType[]> {
    return this.ppDebtsToPayRepository.db.findMany({ where: { companyId: Number(companyId) } });
  }

  //@UseGuards(GQLInternalGuard)
  @ResolveField(() => [DuesofPayAllObjectType])
  async PPDuesofPay(
    @Parent() debtsToPay: DebtsToPayAllObjectType,
  ): Promise<DuesofPayAllObjectType[]> {
    const { id } = debtsToPay;
    return this.ppDuesOfPayRepository.db.findMany({
      where: { debtsToPayId: id },
    });
  }

  //@UseGuards(GQLInternalGuard)
  @Mutation(() => DebtsToPayObjectType, { nullable: true })
  async PPCreateDebtsToPay(
    @Args('data') data: DebtsToPayObjectType,
  ): Promise<DebtsToPayObjectType | null> {
    return this.ppDebtsToPayRepository.db.create({ data });
  }

  //@UseGuards(GQLInternalGuard)
  @Mutation(() => DebtsToPayObjectType, { nullable: true })
  async PPUpdateDebtsToPay(
    @Args('id') id: number,
    @Args('data') data: DebtsToPayObjectType,
  ): Promise<DebtsToPayObjectType | null> {
    return this.ppDebtsToPayRepository.db.update({ data, where: { id } });
  }
}
