import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { PPDashboardBusiness } from '@business';

describe('DashboardController', () => {
  let controller: DashboardController;
  const mockDashboardBusiness = {
    getSummary: jest.fn().mockResolvedValue({
      totalDebt: 1000,
      totalPaid: 400,
      totalPending: 600,
      overdueAmount: 200,
      monthlyCollection: 150,
      debtsCount: 2,
      duesCount: 5,
      overdueDuesCount: 1,
      collection: [],
      overdueTotal: 200,
      overdueCount: 1,
      generatedAt: new Date(),
    }),
    getKpis: jest.fn().mockResolvedValue({
      totalDebt: 1000,
      totalPaid: 400,
      totalPending: 600,
      overdueAmount: 200,
      monthlyCollection: 150,
      debtsCount: 2,
      duesCount: 5,
      overdueDuesCount: 1,
    }),
    getCollection: jest.fn().mockResolvedValue([]),
    getOverdue: jest.fn().mockResolvedValue({ total: 200, count: 1, items: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: PPDashboardBusiness,
          useValue: mockDashboardBusiness,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should return dashboard summary', async () => {
    await expect(controller.getSummary()).resolves.toMatchObject({
      totalDebt: 1000,
      debtsCount: 2,
    });
  });

  it('should return dashboard kpis', async () => {
    await expect(controller.getKpis()).resolves.toMatchObject({
      totalPending: 600,
      duesCount: 5,
    });
  });

  it('should return dashboard collection', async () => {
    await expect(controller.getCollection()).resolves.toEqual([]);
  });

  it('should return dashboard overdue', async () => {
    await expect(controller.getOverdue()).resolves.toMatchObject({
      total: 200,
      count: 1,
    });
  });
});
