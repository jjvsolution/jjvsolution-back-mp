import { Controller, Get } from '@nestjs/common';
import { QuotationService } from './quotation.service';

@Controller()
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get()
  getHello(): string {
    return this.quotationService.getHello();
  }
}
