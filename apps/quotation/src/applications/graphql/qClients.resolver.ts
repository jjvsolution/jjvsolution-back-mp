import { UseGuards } from '@nestjs/common';
import {
  Query,
  Args,
  Resolver,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QBusinessAllModel, QClientsAllModel, QClientsModel, QQuotationAllModel } from './models';
import {
  QBusinessRepository,
  QClientsRepository,
  QQuotationRepository,
} from '@database/prisma';

@Resolver(() => QClientsAllModel)
export class QClientsResolver {
  constructor(
    private readonly qClientsRepository: QClientsRepository,
    private readonly qBusinessRepository: QBusinessRepository,
    private readonly qQuotationRepository: QQuotationRepository,
  ) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QClientsAllModel])
  async QClients(): Promise<QClientsAllModel[]> {
    return this.qClientsRepository.db.findMany({ where: { isDeleted: false } });
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QClientsAllModel, { nullable: true })
  async QClientsById(@Args('id') id: number): Promise<QClientsAllModel | null> {
    return this.qClientsRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => [QClientsAllModel], { nullable: true })
  async QClientsByRut(
    @Args('rutOrName') rutOrName: string,
  ): Promise<QClientsAllModel[] | null> {
    return this.qClientsRepository.db.findMany({
      where: {
        OR: [
          {
            rut: {
              contains: rutOrName,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: rutOrName,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QClientsAllModel, { nullable: true })
  async QClientsCreate(
    @Args('data') data: QClientsModel,
  ): Promise<QClientsAllModel | null> {
    return this.qClientsRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QClientsAllModel, { nullable: true })
  async QClientsUpdate(
    @Args('id') id: number,
    @Args('data') data: QClientsModel,
  ): Promise<QClientsAllModel | null> {
    return this.qClientsRepository.db.update({ data, where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QClientsAllModel, { nullable: true })
  async QClientsDelete(
    @Args('id') id: number,
  ): Promise<QClientsAllModel | null> {
    return this.qClientsRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
  @ResolveField(() => QBusinessAllModel)
  business(@Parent() qClientsAllModel: QClientsAllModel) {
    return this.qBusinessRepository.db.findUnique({
      where: { id: qClientsAllModel.businessId, isDeleted: false },
    });
  }
  @ResolveField(() => QQuotationAllModel)
  quotation(@Parent() qClientsAllModel: QClientsAllModel) {
    return this.qQuotationRepository.db.findMany({
      where: { clientsId: qClientsAllModel.id, isDeleted: false },
    });
  }
}
