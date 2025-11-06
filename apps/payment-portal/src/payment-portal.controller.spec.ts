import { Test, TestingModule } from '@nestjs/testing';
import { PaymentPortalController } from './payment-portal.controller';
import { PaymentPortalService } from './payment-portal.service';

describe('PaymentPortalController', () => {
  let paymentPortalController: PaymentPortalController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentPortalController],
      providers: [PaymentPortalService],
    }).compile();

    paymentPortalController = app.get<PaymentPortalController>(PaymentPortalController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(paymentPortalController.getHello()).toBe('Hello World!');
    });
  });
});
