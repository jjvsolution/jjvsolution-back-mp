import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QClientsAllModel, QClientsModel } from './models';
import { QClientsRepository } from '@database/prisma';

@Resolver(() => QClientsAllModel)
export class QClientsResolver {
  constructor(private readonly qClientsRepository: QClientsRepository) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QClientsAllModel])
  async QClients(): Promise<QClientsAllModel[]> {
    return this.qClientsRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QClientsAllModel, { nullable: true })
  async QClientsById(@Args('id') id: number): Promise<QClientsAllModel | null> {
    return this.qClientsRepository.db.findUnique({ where: { id } });
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
}
