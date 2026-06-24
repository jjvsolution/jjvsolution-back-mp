import { ConflictException, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Query,
  Args,
  Resolver,
  Mutation,
  Parent,
  ResolveField,
  Context,
} from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import {
  DebtsToPayAllObjectType,
  DebtsToPayObjectType,
  DuesofPayAllObjectType,
  PPDebtsToPayDetailObjectType,
} from './models';
import {
  PPDebtsToPayRepository,
  PPDuesOfPayRepository,
} from '@database/prisma';
import { PPDebtsToPayBusiness } from '@business';
import { RequestWithUserInterface } from '@interfaces';

@Resolver(() => DebtsToPayAllObjectType)
export class PPDebtsToPayResolver {
  constructor(
    private readonly ppDebtsToPayRepository: PPDebtsToPayRepository,
    private readonly ppDuesOfPayRepository: PPDuesOfPayRepository,
    private readonly ppDebtsToPayBusiness: PPDebtsToPayBusiness,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [DebtsToPayAllObjectType])
  async PPDebtsToPay(@Context() ctx: { req: RequestWithUserInterface }): Promise<DebtsToPayAllObjectType[]> {
    return this.ppDebtsToPayRepository.db.findMany({
      where: { userId: ctx.req.user.uid as string },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => DebtsToPayAllObjectType, { nullable: true })
  async PPDebtsToPayById(
    @Args('id') id: number,
  ): Promise<DebtsToPayAllObjectType | null> {
    return this.ppDebtsToPayRepository.db.findUnique({ where: { id } });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => DebtsToPayAllObjectType, { nullable: true })
  async PPDebtsToPayPayId(
    @Args('payId') payId: string,
  ): Promise<DebtsToPayAllObjectType | null> {
    return this.ppDebtsToPayRepository.db.findUnique({ where: { payId } });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DebtsToPayAllObjectType])
  async PPDebtsToPayUserId(
    @Args('userId') userId: string,
  ): Promise<DebtsToPayAllObjectType[]> {
    return this.ppDebtsToPayRepository.db.findMany({ where: { userId } });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [DebtsToPayAllObjectType])
  async PPDebtsToPayCompanyId(
    @Args('companyId') companyId: string,
  ): Promise<DebtsToPayAllObjectType[]> {
    return this.ppDebtsToPayRepository.db.findMany({
      where: { companyId: Number(companyId) },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDebtsToPayDetailObjectType, { nullable: true })
  async PPDebtsToPayDetail(
    @Args('id') id: number,
  ): Promise<PPDebtsToPayDetailObjectType | null> {
    return this.ppDebtsToPayBusiness.getDetail(id);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => DebtsToPayAllObjectType, { nullable: true })
  async PPCreateDebtsToPay(
    @Args('data') data: DebtsToPayObjectType,
  ): Promise<DebtsToPayAllObjectType | null> {
    try {
      return await this.ppDebtsToPayRepository.db.create({
        data: { ...data, payId: randomUUID() },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('PAY_ID_ALREADY_EXISTS');
      }
      throw error;
    }
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => DebtsToPayAllObjectType, { nullable: true })
  async PPUpdateDebtsToPay(
    @Args('id') id: number,
    @Args('data') data: DebtsToPayObjectType,
  ): Promise<DebtsToPayAllObjectType | null> {
    try {
      return await this.ppDebtsToPayRepository.db.update({ data, where: { id } });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('PAY_ID_ALREADY_EXISTS');
      }
      throw error;
    }
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => DebtsToPayAllObjectType, { nullable: true })
  async PPDeleteDebtsToPay(
    @Args('id') id: number,
  ): Promise<DebtsToPayAllObjectType | null> {
    await this.ppDuesOfPayRepository.db.deleteMany({
      where: { debtsToPayId: id },
    });
    return this.ppDebtsToPayRepository.db.delete({ where: { id } });
  }

  @UseGuards(GQLInternalGuard)
  @ResolveField(() => [DuesofPayAllObjectType])
  async PPDuesofPay(
    @Parent() debtsToPay: DebtsToPayAllObjectType,
  ): Promise<DuesofPayAllObjectType[]> {
    const { id } = debtsToPay;
    return this.ppDuesOfPayRepository.db.findMany({
      where: { debtsToPayId: id },
    });
  }
}
