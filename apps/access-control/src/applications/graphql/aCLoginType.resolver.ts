import { UseGuards } from '@nestjs/common';
import { Query, Args, Resolver, Mutation } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { ACLoginTypeAllModel, ACLoginTypeModel } from './models';
import { ACLoginTypeRepository } from '@database/prisma';

@Resolver(() => ACLoginTypeAllModel)
export class ACLoginTypeResolver {
  constructor(private readonly ACLoginTypeRepository: ACLoginTypeRepository) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [ACLoginTypeAllModel])
  async ACLoginType(): Promise<ACLoginTypeAllModel[]> {
    return this.ACLoginTypeRepository.db.findMany({
      where: { isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Query(() => ACLoginTypeAllModel, { nullable: true })
  async ACLoginTypeById(@Args('id') id: number): Promise<ACLoginTypeAllModel | null> {
    return this.ACLoginTypeRepository.db.findUnique({
      where: { id, isDeleted: false },
    });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACLoginTypeAllModel, { nullable: true })
  async ACLoginTypeCreate(
    @Args('data') data: ACLoginTypeModel,
  ): Promise<ACLoginTypeAllModel | null> {
    return this.ACLoginTypeRepository.db.create({ data });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACLoginTypeAllModel, { nullable: true })
  async ACLoginTypeUpdate(
    @Args('id') id: number,
    @Args('data') data: ACLoginTypeModel,
  ): Promise<ACLoginTypeAllModel | null> {
    return this.ACLoginTypeRepository.db.update({ data, where: { id } });
  }
  @UseGuards(GQLInternalGuard)
  @Mutation(() => ACLoginTypeAllModel, { nullable: true })
  async ACLoginTypeDelete(@Args('id') id: number): Promise<ACLoginTypeAllModel | null> {
    return this.ACLoginTypeRepository.db.update({
      data: { isDeleted: true },
      where: { id },
    });
  }
}
