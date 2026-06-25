import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';
import { PPDuesOfPay, PPStatusPayment } from '@prisma/client';
import { ResponseClass } from 'common/config';

export interface PPDashboardKpisResult {
  totalDebt: number;
  totalPaid: number;
  totalPending: number;
  overdueAmount: number;
  monthlyCollection: number;
  debtsCount: number;
  duesCount: number;
  overdueDuesCount: number;
}

export interface PPDashboardCollectionItem {
  month: string;
  total: number;
  count: number;
}

export interface PPDashboardOverdueResult {
  total: number;
  count: number;
  items: PPDuesOfPay[];
}

@Injectable()
export class PPDashboardBusiness extends ResponseClass {
  constructor(private readonly prisma: Prisma) {
    super();
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private startOfMonth(date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private endOfMonth(date = new Date()): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  }

  async getKpis(userId?: string): Promise<PPDashboardKpisResult> {
    const startOfToday = this.startOfToday();
    const startOfMonth = this.startOfMonth();
    const endOfMonth = this.endOfMonth();

    const [
      totalDebtAgg,
      totalPaidAgg,
      totalPendingAgg,
      overdueAgg,
      monthlyCollectionAgg,
      debtsCount,
      duesCount,
      overdueDuesCount,
    ] = await Promise.all([
      this.prisma.pPDuesOfPay.aggregate({
        _sum: { amount: true },
        ...{where: userId ? { DebtsToPay: { userId } } : {}},
      }),
      this.prisma.pPDuesOfPay.aggregate({
        where: { paid: true,  ...(userId ? { DebtsToPay: { userId } } : {})},
        _sum: { amount: true },
      }),
      this.prisma.pPDuesOfPay.aggregate({
        where: { paid: false,  ...(userId ? { DebtsToPay: { userId } } : {}) },
        _sum: { amount: true },
      }),
      this.prisma.pPDuesOfPay.aggregate({
        where: {
          paid: false,
          expirationDate: { lt: startOfToday },
          ...(userId ? { DebtsToPay: { userId } } : {}),
        },
        _sum: { amount: true },
      }),
      this.prisma.pPPayment.aggregate({
        where: {
          status: PPStatusPayment.COMPLETED,
          paymentDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          ...(userId ? { PPPaymentDeuesOfPay: { every: { duesOfPay: { DebtsToPay: { userId } } } } } : {}),
        },
        _sum: { amount: true },
      }),
      this.prisma.pPDebtsToPay.count({
        where: userId ? { userId } : {},
      }),
      this.prisma.pPDuesOfPay.count({
        where: userId ? { DebtsToPay: { userId } } : {},
      }),
      this.prisma.pPDuesOfPay.count({
        where: {
          paid: false,
          expirationDate: { lt: startOfToday },
          ...(userId ? { DebtsToPay: { userId } } : {}),
        },
      }),
    ]);

    return {
      totalDebt: totalDebtAgg._sum.amount ?? 0,
      totalPaid: totalPaidAgg._sum.amount ?? 0,
      totalPending: totalPendingAgg._sum.amount ?? 0,
      overdueAmount: overdueAgg._sum.amount ?? 0,
      monthlyCollection: monthlyCollectionAgg._sum.amount ?? 0,
      debtsCount,
      duesCount,
      overdueDuesCount,
    };
  }

  async getSummary(userId?: string) {
    const [kpis, collection, overdue] = await Promise.all([
      this.getKpis(userId),
      this.getCollection(userId),
      this.getOverdue(userId),
    ]);

    return {
      ...kpis,
      collection,
      overdueTotal: overdue.total,
      overdueCount: overdue.count,
      generatedAt: new Date(),
    };
  }

  async getCollection(userId?: string): Promise<PPDashboardCollectionItem[]> {
    const fromDate = this.startOfMonth(
      new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
    );

    const payments = await this.prisma.pPPayment.findMany({
      where: {
        status: PPStatusPayment.COMPLETED,
        paymentDate: { gte: fromDate },
        ...(userId
          ? {
              PPPaymentDeuesOfPay: {
                every: { duesOfPay: { DebtsToPay: { userId } } },
              },
            }
          : {}),
      },
      select: { paymentDate: true, amount: true },
      orderBy: { paymentDate: 'desc' },
    });

    const grouped = new Map<string, { total: number; count: number }>();

    for (const payment of payments) {
      const monthKey = `${payment.paymentDate.getFullYear()}-${String(
        payment.paymentDate.getMonth() + 1,
      ).padStart(2, '0')}`;
      const current = grouped.get(monthKey) ?? { total: 0, count: 0 };
      current.total += payment.amount;
      current.count += 1;
      grouped.set(monthKey, current);
    }

    return Array.from(grouped.entries())
      .map(([monthKey, data]) => ({
        month: new Date(`${monthKey}-01T00:00:00.000Z`).toISOString(),
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
      .slice(0, 12);
  }

  getOverdueItems(userId?: string) {
    return this.prisma.pPDuesOfPay.findMany({
      where: {
        paid: false,
        expirationDate: { lt: this.startOfToday() },
        ...(userId
          ? {
              DebtsToPay: {
                userId,
              },
            }
          : {}),
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  async getOverdue(userId?: string): Promise<PPDashboardOverdueResult> {
    const [aggregate, items] = await Promise.all([
      this.prisma.pPDuesOfPay.aggregate({
        where: {
          paid: false,
          expirationDate: { lt: this.startOfToday() },
          ...(userId
            ? {
                DebtsToPay: {
                  userId,
                },
              }
            : {}),
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.getOverdueItems(),
    ]);

    return {
      total: aggregate._sum.amount ?? 0,
      count: aggregate._count,
      items,
    };
  }
}
