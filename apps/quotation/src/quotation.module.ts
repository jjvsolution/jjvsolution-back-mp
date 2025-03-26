import { Module } from '@nestjs/common';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';

@Module({
  imports: [],
  controllers: [QuotationController],
  providers: [QuotationService],
})
export class QuotationModule {}
