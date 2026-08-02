import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import {
  PCCostsBusiness,
  PCImportBusiness,
  PCTimeEntriesBusiness,
} from '@business';
import {
  PCBaselinesAllModel,
  PCCostSummaryModel,
  PCImportPreviewModel,
  PCQaRulesAllModel,
  PCQaRulesModel,
  PCTimeEntriesAllModel,
  PCTimeEntriesModel,
} from './models';
import GraphQLJSON from 'graphql-type-json';

@Resolver()
export class PCTimeEntriesResolver {
  constructor(private readonly pcTimeEntriesBusiness: PCTimeEntriesBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCTimeEntriesAllModel])
  PCTimeEntriesByProject(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('actorId', { nullable: true }) actorId?: number,
    @Args('backlogItemId', { nullable: true }) backlogItemId?: number,
  ) {
    return this.pcTimeEntriesBusiness.list(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      { actorId, backlogItemId },
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCTimeEntriesAllModel)
  PCTimeEntryCreate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('data') data: PCTimeEntriesModel,
  ) {
    return this.pcTimeEntriesBusiness.createEntry(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCTimeEntriesAllModel)
  PCTimeEntryUpdate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
    @Args('data') data: PCTimeEntriesModel,
  ) {
    return this.pcTimeEntriesBusiness.update(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCTimeEntriesAllModel)
  PCTimeEntryDelete(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcTimeEntriesBusiness.softDelete(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => GraphQLJSON)
  PCTimeEntriesSummaryByActor(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcTimeEntriesBusiness.summaryByActor(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }
}

@Resolver()
export class PCCostsResolver {
  constructor(private readonly pcCostsBusiness: PCCostsBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => PCCostSummaryModel)
  PCCostProjectSummary(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcCostsBusiness.summary(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCQaRulesAllModel])
  PCQaRulesByProject(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcCostsBusiness.listQaRules(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCQaRulesAllModel)
  PCQaRuleUpsert(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('data') data: PCQaRulesModel,
  ) {
    return this.pcCostsBusiness.upsertQaRule(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      data,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCBaselinesAllModel)
  PCBaselineCreate(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('name') name: string,
  ) {
    return this.pcCostsBusiness.createBaseline(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      name,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => [PCBaselinesAllModel])
  PCBaselinesByProject(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
  ) {
    return this.pcCostsBusiness.listBaselines(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Query(() => PCBaselinesAllModel)
  PCBaselineById(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('id') id: number,
  ) {
    return this.pcCostsBusiness.getBaseline(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      id,
    );
  }
}

@Resolver()
export class PCImportResolver {
  constructor(private readonly pcImportBusiness: PCImportBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => GraphQLJSON)
  PCBacklogImportTemplate() {
    return this.pcImportBusiness.getTemplateDefinition();
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => PCImportPreviewModel)
  async PCBacklogImportPreview(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('fileBase64') fileBase64: string,
  ) {
    const buffer = Buffer.from(fileBase64, 'base64');
    return this.pcImportBusiness.previewFromBuffer(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      buffer,
    );
  }

  @UseGuards(GQLInternalGuard)
  @Mutation(() => GraphQLJSON)
  PCBacklogImportConfirm(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('rows', { type: () => GraphQLJSON }) rows: unknown,
    @Args('actorCodeToId', { type: () => GraphQLJSON, nullable: true })
    actorCodeToId?: Record<string, number>,
  ) {
    return this.pcImportBusiness.confirm(
      companyId,
      ctx.req.user.uid,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      rows as never,
      actorCodeToId,
    );
  }
}
