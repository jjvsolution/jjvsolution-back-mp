import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import { PCJiraImportBusiness } from '@business';
import {
  PCJiraConnectionInputModel,
  PCJiraConnectionModel,
  PCJiraConnectionTestModel,
  PCJiraImportConfirmModel,
  PCJiraImportPreviewModel,
} from './models';

@Resolver()
export class PCJiraImportResolver {
  constructor(private readonly pcJiraImportBusiness: PCJiraImportBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => PCJiraConnectionModel)
  PCJiraConnectionGet(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcJiraImportBusiness.getConnection(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCJiraConnectionModel)
  PCJiraConnectionSave(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('data') data: PCJiraConnectionInputModel,
  ) {
    return this.pcJiraImportBusiness.saveConnection(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCJiraConnectionTestModel)
  PCJiraConnectionTest(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcJiraImportBusiness.testConnection(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCJiraImportPreviewModel)
  PCJiraImportPreview(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcJiraImportBusiness.preview(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCJiraImportConfirmModel)
  PCJiraImportConfirm(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('issueKeys', { type: () => [String], nullable: true })
    issueKeys?: string[] | null,
  ) {
    return this.pcJiraImportBusiness.confirm(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      issueKeys,
    );
  }
}
