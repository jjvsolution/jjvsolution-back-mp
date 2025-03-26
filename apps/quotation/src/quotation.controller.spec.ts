import { Test, TestingModule } from '@nestjs/testing';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';

describe('QuotationController', () => {
  let quotationController: QuotationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QuotationController],
      providers: [QuotationService],
    }).compile();

    quotationController = app.get<QuotationController>(QuotationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(quotationController.getHello()).toBe('Hello World!');
    });
  });
});
