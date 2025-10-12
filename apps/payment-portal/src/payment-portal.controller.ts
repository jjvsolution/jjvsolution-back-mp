import { Controller, Get } from '@nestjs/common';
import { PaymentPortalService } from './payment-portal.service';

@Controller()
export class PaymentPortalController {
  constructor(private readonly paymentPortalService: PaymentPortalService) {}

  @Get()
  getHello(): string {
    return this.paymentPortalService.getHello();
  }
}
