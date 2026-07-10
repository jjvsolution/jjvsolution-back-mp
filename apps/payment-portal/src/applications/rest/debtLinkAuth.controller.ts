import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PPDebtLinkAuthBusiness } from '@business';
import { PublicDebtLinkGuard } from '@config/cross/guards/public-debt-link.guard';
import {
  DebtLinkAccessDto,
  DebtLinkPaymentDto,
  DebtLinkPaymentInputDto,
} from 'common/dto/payment-portal';
import { RequestWithPublicDebtLinkInterface, RequestWithUserInterface } from '@interfaces';
import { TokenService } from 'common/services';
import { Request } from 'express';

@ApiTags('Debt Link')
@Controller(['payment-portal/debt-link', 'debt-link'])
export class DebtLinkAuthController {
  constructor(
    private readonly ppDebtLinkAuthBusiness: PPDebtLinkAuthBusiness,
  ) {}

  @Get(':payId')
  @ApiOkResponse({ type: DebtLinkAccessDto })
  getDetail(
    @Param('payId') payId: string,
    @Req() req: RequestWithUserInterface,
  ): Promise<DebtLinkAccessDto> {
    //const userId = req.user.getUserIdIsAdmin;
    const appId = TokenService.appId(req);
    return this.ppDebtLinkAuthBusiness.getPublicAccess(undefined, appId, payId);
  }

  @Post('payment')
  @UseGuards(PublicDebtLinkGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: DebtLinkPaymentDto })
  upsertPayment(
    @Req() req: RequestWithUserInterface & RequestWithPublicDebtLinkInterface,
    @Body() data: DebtLinkPaymentInputDto,
  ) {
    const userId = req.user.getUserIdIsAdmin;
    return this.ppDebtLinkAuthBusiness.upsertPublicPayment(
      userId,
      req.publicDebtLink.payId,
      data,
    );
  }
}
