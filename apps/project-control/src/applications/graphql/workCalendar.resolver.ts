import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { GQLInternalGuard } from '@config/cross/guards';
import { RequestWithUserInterface } from '@interfaces';
import { PCWorkCalendarBusiness } from '@business';
import { PCWorkCalendarModel } from './models';

@Resolver()
export class PCWorkCalendarResolver {
  constructor(private readonly pcWorkCalendarBusiness: PCWorkCalendarBusiness) {}

  @UseGuards(GQLInternalGuard)
  @Query(() => PCWorkCalendarModel)
  PCWorkCalendar(
    @Context() ctx: { req: RequestWithUserInterface },
    @Args('companyId') companyId: number,
    @Args('projectId') projectId: number,
    @Args('fromDate') fromDate: Date,
    @Args('toDate') toDate: Date,
  ) {
    return this.pcWorkCalendarBusiness.getWorkCalendar(
      companyId,
      ctx.req.user.getUserIdIsAdmin,
      projectId,
      fromDate,
      toDate,
    );
  }
}
