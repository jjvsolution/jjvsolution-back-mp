import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlController } from './access-control.controller';
import { AccessControlService } from './access-control.service';

describe('AccessControlController', () => {
  let accessControlController: AccessControlController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AccessControlController],
      providers: [AccessControlService],
    }).compile();

    accessControlController = app.get<AccessControlController>(
      AccessControlController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(accessControlController.getHello()).toBe('Hello World!');
    });
  });
});
