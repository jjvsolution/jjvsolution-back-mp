import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PPDashboardBusiness } from '@business';
import { CustomAuthGuard } from '@config/cross/guards/internal.guard';
import {
  DashboardCollectionItemDto,
  DashboardKpisDto,
  DashboardOverdueDto,
  DashboardSummaryDto,
} from 'common/dto/payment-portal';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(CustomAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly ppDashboardBusiness: PPDashboardBusiness) {}

  @Get('summary')
  @ApiOkResponse({ type: DashboardSummaryDto })
  getSummary(): Promise<DashboardSummaryDto> {
    return this.ppDashboardBusiness.getSummary();
  }

  @Get('kpis')
  @ApiOkResponse({ type: DashboardKpisDto })
  getKpis(): Promise<DashboardKpisDto> {
    return this.ppDashboardBusiness.getKpis();
  }

  @Get('collection')
  @ApiOkResponse({ type: [DashboardCollectionItemDto] })
  getCollection(): Promise<DashboardCollectionItemDto[]> {
    return this.ppDashboardBusiness.getCollection();
  }

  @Get('overdue')
  @ApiOkResponse({ type: DashboardOverdueDto })
  getOverdue(): Promise<DashboardOverdueDto> {
    return this.ppDashboardBusiness.getOverdue();
  }
}
