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
import { PPDebtsToPayBusiness, PPDebtLinkAuthBusiness } from '@business';
import { RequestWithUserInterface } from '@interfaces';
import { TokenService } from 'common/services';

@Resolver(() => DebtsToPayAllObjectType)
export class PPDebtsToPayResolver {
  constructor(
    private readonly ppDebtsToPayRepository: PPDebtsToPayRepository,
    private readonly ppDuesOfPayRepository: PPDuesOfPayRepository,
    private readonly ppDebtsToPayBusiness: PPDebtsToPayBusiness,
    private readonly ppDebtLinkAuthBusiness: PPDebtLinkAuthBusiness,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [DebtsToPayAllObjectType])
  async PPDebtsToPay(
    @Context() ctx: { req: RequestWithUserInterface },
  ): Promise<DebtsToPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDebtsToPayRepository.db.findMany({
      where: userId ? { userId } : {},
    });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => DebtsToPayAllObjectType, { nullable: true })
  async PPDebtsToPayById(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('id') id: number,
  ): Promise<DebtsToPayAllObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDebtsToPayRepository.db.findUnique({
      where: { id, ...(userId ? { userId } : {}) },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => DebtsToPayAllObjectType, { nullable: true })
  async PPDebtsToPayPayId(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('payId') payId: string,
  ): Promise<DebtsToPayAllObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDebtsToPayRepository.db.findUnique({
      where: { payId, ...(userId ? { userId } : {}) },
    });
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
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: string,
  ): Promise<DebtsToPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDebtsToPayRepository.db.findMany({
      where: { companyId: Number(companyId), ...(userId ? { userId } : {}) },
    });
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PPDebtsToPayDetailObjectType, { nullable: true })
  async PPDebtsToPayDetail(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('id') id: number,
  ): Promise<PPDebtsToPayDetailObjectType | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    return this.ppDebtsToPayBusiness.getDetail(userId, id);
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => String, { nullable: true })
  async PPDebtsToPayPublicLinkToken(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('id') id: number,
  ): Promise<string | null> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    const debt = await this.ppDebtsToPayRepository.db.findUnique({
      where: { id, ...(userId ? { userId } : {}) },
    });

    if (!debt) {
      return null;
    }

    const appId = TokenService.appId(ctx.req);
    return this.ppDebtLinkAuthBusiness.generateToken(userId, appId, debt.payId);
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
      return await this.ppDebtsToPayRepository.db.update({
        data,
        where: { id },
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
    @Context() ctx: { req: RequestWithUserInterface },
    @Parent() debtsToPay: DebtsToPayAllObjectType,
  ): Promise<DuesofPayAllObjectType[]> {
    const userId = ctx.req.user.getUserIdIsAdmin;
    const { id } = debtsToPay;
    return this.ppDuesOfPayRepository.db.findMany({
      where: { debtsToPayId: id, ...(userId ? { userId } : {}) },
    });
  }
}
