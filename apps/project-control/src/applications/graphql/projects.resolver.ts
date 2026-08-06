import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import { PCProjectsBusiness } from '@business';
import {
  PCProjectMembersAllModel,
  PCProjectMembersModel,
  PCProjectResourcesAllModel,
  PCProjectResourcesModel,
  PCProjectsAllModel,
  PCProjectsModel,
  PCProjectStatus,
  PCProjectSummaryModel,
} from './models';

@Resolver(() => PCProjectsAllModel)
export class PCProjectsResolver {
  constructor(private readonly pcProjectsBusiness: PCProjectsBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCProjectsAllModel])
  PCProjectsByCompany(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
  ) {
    return this.pcProjectsBusiness.findAll(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCProjectsAllModel)
  PCProjectById(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
  ) {
    return this.pcProjectsBusiness.findById(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCProjectSummaryModel)
  PCProjectSummary(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
  ) {
    return this.pcProjectsBusiness.summary(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectsAllModel)
  PCProjectCreate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('data') data: PCProjectsModel,
  ) {
    return this.pcProjectsBusiness.createProject(ctx.req.user.uid, data);
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectsAllModel)
  PCProjectUpdate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
    @Args('data') data: PCProjectsModel,
  ) {
    return this.pcProjectsBusiness.update(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectsAllModel)
  PCProjectChangeStatus(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('id') id: number,
    @Args('status', { type: () => PCProjectStatus }) status: PCProjectStatus,
  ) {
    return this.pcProjectsBusiness.changeStatus(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      id,
      status,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCProjectMembersAllModel])
  PCProjectMembers(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcProjectsBusiness.listMembers(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectMembersAllModel)
  PCProjectMemberAdd(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('data') data: PCProjectMembersModel,
  ) {
    return this.pcProjectsBusiness.addMember(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectMembersAllModel)
  PCProjectMemberUpdate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('memberId') memberId: number,
    @Args('data') data: PCProjectMembersModel,
  ) {
    return this.pcProjectsBusiness.updateMember(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      memberId,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectMembersAllModel)
  PCProjectMemberRemove(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('memberId') memberId: number,
  ) {
    return this.pcProjectsBusiness.removeMember(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      memberId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCProjectResourcesAllModel])
  PCProjectResources(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcProjectsBusiness.listResources(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectResourcesAllModel)
  PCProjectResourceAdd(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('data') data: PCProjectResourcesModel,
  ) {
    return this.pcProjectsBusiness.addResource(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectResourcesAllModel)
  PCProjectResourceUpdate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('resourceId') resourceId: number,
    @Args('data') data: PCProjectResourcesModel,
  ) {
    return this.pcProjectsBusiness.updateResource(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      resourceId,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCProjectResourcesAllModel)
  PCProjectResourceRemove(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('resourceId') resourceId: number,
  ) {
    return this.pcProjectsBusiness.removeResource(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      resourceId,
    );
  }
}
