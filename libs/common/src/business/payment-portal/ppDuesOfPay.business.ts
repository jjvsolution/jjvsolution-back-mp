import { Injectable } from '@nestjs/common';
import { PPDuesOfPayRepository } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { ResponseClass } from 'common/config';
import {
  calculateDueFinancialStatus,
  calculatePaidAmountFromLinks,
  PPDuesFinancialStatus,
} from './ppDuesFinancial.helper';

export type PPDuesOfPayDetailStatus = PPDuesFinancialStatus;

export interface PPDuesOfPayDetailResult {
  due: Omit<
    Prisma.PPDuesOfPayGetPayload<object>,
    'PPPaymentDeuesOfPay' | 'DebtsToPay'
  >;
  debt: Prisma.PPDebtsToPayGetPayload<object>;
  payments: Prisma.PPPaymentGetPayload<object>[];
  totalAmount: number;
  paidAmount: number;
  pendingBalance: number;
  status: PPDuesOfPayDetailStatus;
}

@Injectable()
export class PPDuesOfPayBusiness extends ResponseClass {
  constructor(private readonly ppDuesOfPayRepository: PPDuesOfPayRepository) {
    super();
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  listAll(userId: string) {
    return this.ppDuesOfPayRepository.db.findMany({
      where: { DebtsToPay: { userId } },
      orderBy: { id: 'asc' },
    });
  }

  getById(id: number) {
    return this.ppDuesOfPayRepository.db.findUnique({ where: { id } });
  }

  getPending() {
    return this.ppDuesOfPayRepository.db.findMany({
      where: { paid: false },
      orderBy: { expirationDate: 'asc' },
    });
  }

  getOverdue() {
    return this.ppDuesOfPayRepository.db.findMany({
      where: {
        paid: false,
        expirationDate: { lt: this.startOfToday() },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  getPaid() {
    return this.ppDuesOfPayRepository.db.findMany({
      where: { paid: true },
      orderBy: { expirationDate: 'desc' },
    });
  }

  getByDebtsToPayId(debtsToPayId: number) {
    return this.ppDuesOfPayRepository.db.findMany({
      where: { debtsToPayId },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async getPendingBalance(debtsToPayId?: number) {
    const where: Prisma.PPDuesOfPayWhereInput = {
      paid: false,
      ...(debtsToPayId != null ? { debtsToPayId } : {}),
    };
    const result = await this.ppDuesOfPayRepository.db.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });
    return {
      total: result._sum.amount ?? 0,
      count: result._count,
    };
  }

  async getDetail(id: number): Promise<PPDuesOfPayDetailResult> {
    const due = await this.ppDuesOfPayRepository.db.findUnique({
      where: { id },
      include: {
        DebtsToPay: true,
        PPPaymentDeuesOfPay: {
          include: {
            payment: {
              include: {
                PPPaymentDeuesOfPay: true,
              },
            },
          },
        },
      },
    });

    if (!due) {
      this.notFound('DUES_OF_PAY_NOT_FOUND');
    }

    const payments = due.PPPaymentDeuesOfPay
      .map((link) => link.payment)
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      );

    const paidAmount = calculatePaidAmountFromLinks(due.PPPaymentDeuesOfPay);
    const totalAmount = due.amount;
    const pendingBalance = Math.max(0, totalAmount - paidAmount);
    const status = calculateDueFinancialStatus(due, paidAmount);

    const { PPPaymentDeuesOfPay, DebtsToPay, ...dueData } = due;

    return {
      due: dueData,
      debt: DebtsToPay,
      payments,
      totalAmount,
      paidAmount,
      pendingBalance,
      status,
    };
  }
}
