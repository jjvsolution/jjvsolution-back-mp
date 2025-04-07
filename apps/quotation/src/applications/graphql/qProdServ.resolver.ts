import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from '@config/cross/guards';
import { QProdServAllModel, QProdServModel } from './models';
import { QProdServRepository } from '@database/prisma';

@Resolver(() => QProdServAllModel)
export class QProdServResolver {
  constructor(private readonly qProdServRepository: QProdServRepository) {}

  //@UseGuards(JwtAuthGuard)
  @Query(() => [QProdServAllModel])
  async QProdServ(): Promise<QProdServAllModel[]> {
    return this.qProdServRepository.db.findMany();
  }
  //@UseGuards(JwtAuthGuard)
  @Query(() => QProdServAllModel, { nullable: true })
  async QProdServById(@Args('id') id: number): Promise<QProdServAllModel | null> {
    return this.qProdServRepository.db.findUnique({ where: { id } });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QProdServAllModel, { nullable: true })
  async QProdServCreate(
    @Args('data') data: QProdServModel,
  ): Promise<QProdServAllModel | null> {
    return this.qProdServRepository.db.create({ data });
  }
  //@UseGuards(JwtAuthGuard)
  @Mutation(() => QProdServAllModel, { nullable: true })
  async QProdServUpdate(
    @Args('id') id: number,
    @Args('data') data: QProdServModel,
  ): Promise<QProdServAllModel | null> {
    return this.qProdServRepository.db.update({ data, where: { id } });
  }
}
