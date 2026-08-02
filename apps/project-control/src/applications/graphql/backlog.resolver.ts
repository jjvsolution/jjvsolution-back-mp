import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import {
  PCBacklogBusiness,
  PCDependenciesBusiness,
  PCSprintsBusiness,
} from '@business';
import {
  PCBacklogItemsAllModel,
  PCBacklogItemsModel,
  PCBacklogStatus,
  PCBacklogType,
  PCPriority,
  PCSprintsAllModel,
  PCSprintsModel,
  PCTaskDependenciesAllModel,
  PCTaskDependenciesModel,
  PCPlanningResultModel,
} from './models';
import GraphQLJSON from 'graphql-type-json';

@Resolver()
export class PCBacklogResolver {
  constructor(private readonly pcBacklogBusiness: PCBacklogBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCBacklogItemsAllModel])
  PCBacklogByProject(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('sprintId', { nullable: true }) sprintId?: number,
    @Args('type', { type: () => PCBacklogType, nullable: true })
    type?: PCBacklogType,
    @Args('status', { type: () => PCBacklogStatus, nullable: true })
    status?: PCBacklogStatus,
    @Args('priority', { type: () => PCPriority, nullable: true })
    priority?: PCPriority,
    @Args('responsibleId', { nullable: true }) responsibleId?: number,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.pcBacklogBusiness.findAll(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      { sprintId, type, status, priority, responsibleId, search },
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCBacklogItemsAllModel)
  PCBacklogById(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcBacklogBusiness.findById(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCBacklogItemsAllModel)
  PCBacklogCreate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('data') data: PCBacklogItemsModel,
  ) {
    return this.pcBacklogBusiness.createItem(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCBacklogItemsAllModel)
  PCBacklogUpdate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
    @Args('data') data: PCBacklogItemsModel,
  ) {
    return this.pcBacklogBusiness.update(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => [PCBacklogItemsAllModel])
  PCBacklogReorder(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('orderedIds', { type: () => [Int] }) orderedIds: number[],
  ) {
    return this.pcBacklogBusiness.reorder(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      orderedIds,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCBacklogItemsAllModel)
  PCBacklogDelete(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcBacklogBusiness.softDelete(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }
}

@Resolver()
export class PCSprintsResolver {
  constructor(private readonly pcSprintsBusiness: PCSprintsBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCSprintsAllModel])
  PCSprintsByProject(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcSprintsBusiness.findAll(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCSprintsAllModel)
  PCSprintById(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcSprintsBusiness.findById(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCSprintsAllModel)
  PCSprintCreate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('data') data: PCSprintsModel,
  ) {
    return this.pcSprintsBusiness.createSprint(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCSprintsAllModel)
  PCSprintUpdate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
    @Args('data') data: PCSprintsModel,
  ) {
    return this.pcSprintsBusiness.update(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCSprintsAllModel)
  PCSprintStart(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcSprintsBusiness.start(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCSprintsAllModel)
  PCSprintFinish(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcSprintsBusiness.finish(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCSprintsAllModel)
  PCSprintCancel(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcSprintsBusiness.cancel(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => GraphQLJSON)
  PCSprintCapacity(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcSprintsBusiness.capacity(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => GraphQLJSON)
  PCSprintMetrics(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcSprintsBusiness.metrics(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }
}

@Resolver()
export class PCDependenciesResolver {
  constructor(
    private readonly pcDependenciesBusiness: PCDependenciesBusiness,
  ) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCTaskDependenciesAllModel])
  PCDependenciesByProject(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcDependenciesBusiness.list(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCTaskDependenciesAllModel)
  PCDependencyCreate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('data') data: PCTaskDependenciesModel,
  ) {
    return this.pcDependenciesBusiness.createDependency(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      data as never,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCTaskDependenciesAllModel)
  PCDependencyDelete(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcDependenciesBusiness.remove(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => GraphQLJSON)
  PCDependencyValidateGraph(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcDependenciesBusiness.validateGraph(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCPlanningResultModel)
  PCPlanningGet(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcDependenciesBusiness.getPlanning(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }
}
