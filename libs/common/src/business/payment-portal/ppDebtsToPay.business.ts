import { Injectable } from '@nestjs/common';
import { PPDebtsToPayRepository } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { ResponseClass } from 'common/config';
import {
  calculateDueFinancialStatus,
  calculatePaidAmountFromLinks,
  calculateTotalPaidFromUniquePayments,
  PPDuesFinancialStatus,
} from './ppDuesFinancial.helper';

export interface PPDebtsToPayDueDetailItem {
  id: number;
  description: string;
  expirationDate: Date;
  amount: number;
  paidAmount: number;
  pendingBalance: number;
  status: PPDuesFinancialStatus;
}

export interface PPDebtsToPayDetailResult {
  debt: Prisma.PPDebtsToPayGetPayload<object>;
  totalDebt: number;
  totalPaid: number;
  totalPending: number;
  dues: PPDebtsToPayDueDetailItem[];
}

@Injectable()
export class PPDebtsToPayBusiness extends ResponseClass {
  constructor(private readonly ppDebtsToPayRepository: PPDebtsToPayRepository) {
    super();
  }

  async getDetail(
    userId: string | undefined,
    id: number,
  ): Promise<PPDebtsToPayDetailResult> {
    const debt = await this.ppDebtsToPayRepository.db.findUnique({
      where: { id, ...(userId ? { userId } : {}) },
      include: {
        DuesofPay: {
          include: {
            PPPaymentDeuesOfPay: {
              include: {
                payment: true,
              },
            },
          },
          orderBy: { expirationDate: 'asc' },
        },
      },
    });

    if (!debt) {
      this.notFound('DEBTS_TO_PAY_NOT_FOUND');
    }

    const { DuesofPay, ...debtData } = debt;
    const totalDebt = DuesofPay.reduce((sum, due) => sum + due.amount, 0);
    const allLinks = DuesofPay.flatMap((due) => due.PPPaymentDeuesOfPay);
    const totalPaid = calculateTotalPaidFromUniquePayments(allLinks);
    const totalPending = Math.max(0, totalDebt - totalPaid);

    const dues = DuesofPay.map((due) => {
      const paidAmount = calculatePaidAmountFromLinks(due.PPPaymentDeuesOfPay);
      const pendingBalance = Math.max(0, due.amount - paidAmount);
      const status = calculateDueFinancialStatus(due, paidAmount);

      return {
        id: due.id,
        description: due.description,
        expirationDate: due.expirationDate,
        amount: due.amount,
        paidAmount,
        pendingBalance,
        status,
      };
    });

    return {
      debt: debtData,
      totalDebt,
      totalPaid,
      totalPending,
      dues,
    };
  }
}
