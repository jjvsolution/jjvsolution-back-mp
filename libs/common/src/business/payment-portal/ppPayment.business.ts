import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';
import { PPStatusPayment, PPTypePaymentType, Prisma as PrismaTypes } from '@prisma/client';
import { ResponseClass } from 'common/config';

export interface PPPaymentCreateInput {
  paymentDate: Date;
  paymentType: PPTypePaymentType;
  amount: number;
  status: PPStatusPayment;
  duesOfPayIds: number[];
}

export interface PPPaymentUpdateInput {
  paymentDate?: Date;
  paymentType?: PPTypePaymentType;
  amount?: number;
  status?: PPStatusPayment;
  duesOfPayIds?: number[];
}

@Injectable()
export class PPPaymentBusiness extends ResponseClass {
  constructor(private readonly prisma: Prisma) {
    super();
  }

  listAll() {
    return this.prisma.pPPayment.findMany({
      orderBy: { id: 'desc' },
    });
  }

  getById(id: number) {
    return this.prisma.pPPayment.findUnique({ where: { id } });
  }

  getDuesByPaymentId(paymentId: number) {
    return this.prisma.pPDuesOfPay.findMany({
      where: {
        PPPaymentDeuesOfPay: {
          some: { paymentId },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async createPayment(data: PPPaymentCreateInput) {
    const { duesOfPayIds, ...paymentData } = data;

    if (!duesOfPayIds?.length) {
      this.badRequest('DUES_OF_PAY_IDS_REQUIRED');
    }

    const dues = await this.prisma.pPDuesOfPay.findMany({
      where: { id: { in: duesOfPayIds } },
    });

    if (dues.length !== duesOfPayIds.length) {
      this.notFound('DUES_OF_PAY_NOT_FOUND');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.pPPayment.create({
        data: paymentData,
      });

      await tx.pPPaymentDeuesOfPay.createMany({
        data: duesOfPayIds.map((duesOfPayId) => ({
          paymentId: payment.id,
          duesOfPayId,
        })),
      });

      for (const duesOfPayId of duesOfPayIds) {
        await this.syncDuePaidStatus(tx, duesOfPayId);
      }

      return payment;
    });
  }

  async updatePayment(id: number, data: PPPaymentUpdateInput) {
    const { duesOfPayIds, ...paymentData } = data;
    const existing = await this.prisma.pPPayment.findUnique({ where: { id } });

    if (!existing) {
      this.notFound('PAYMENT_NOT_FOUND');
    }

    const previousLinks = await this.prisma.pPPaymentDeuesOfPay.findMany({
      where: { paymentId: id },
    });
    const previousDuesIds = previousLinks.map((link) => link.duesOfPayId);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.pPPayment.update({
        data: paymentData,
        where: { id },
      });

      if (duesOfPayIds?.length) {
        const dues = await tx.pPDuesOfPay.findMany({
          where: { id: { in: duesOfPayIds } },
        });

        if (dues.length !== duesOfPayIds.length) {
          this.notFound('DUES_OF_PAY_NOT_FOUND');
        }

        await tx.pPPaymentDeuesOfPay.deleteMany({ where: { paymentId: id } });
        await tx.pPPaymentDeuesOfPay.createMany({
          data: duesOfPayIds.map((duesOfPayId) => ({
            paymentId: id,
            duesOfPayId,
          })),
        });
      }

      const affectedDuesIds = Array.from(
        new Set([...previousDuesIds, ...(duesOfPayIds ?? [])]),
      );

      for (const duesOfPayId of affectedDuesIds) {
        await this.syncDuePaidStatus(tx, duesOfPayId);
      }

      return payment;
    });
  }

  async deletePayment(id: number) {
    const existing = await this.prisma.pPPayment.findUnique({ where: { id } });

    if (!existing) {
      this.notFound('PAYMENT_NOT_FOUND');
    }

    const links = await this.prisma.pPPaymentDeuesOfPay.findMany({
      where: { paymentId: id },
    });
    const affectedDuesIds = links.map((link) => link.duesOfPayId);

    return this.prisma.$transaction(async (tx) => {
      await tx.pPPaymentDeuesOfPay.deleteMany({ where: { paymentId: id } });
      const payment = await tx.pPPayment.delete({ where: { id } });

      for (const duesOfPayId of affectedDuesIds) {
        await this.syncDuePaidStatus(tx, duesOfPayId);
      }

      return payment;
    });
  }

  private async syncDuePaidStatus(
    tx: PrismaTypes.TransactionClient,
    duesOfPayId: number,
  ): Promise<void> {
    const due = await tx.pPDuesOfPay.findUnique({ where: { id: duesOfPayId } });

    if (!due) {
      return;
    }

    const coveredAmount = await this.getCoveredAmountForDue(tx, duesOfPayId);

    await tx.pPDuesOfPay.update({
      where: { id: duesOfPayId },
      data: { paid: coveredAmount >= due.amount },
    });
  }

  private async getCoveredAmountForDue(
    tx: PrismaTypes.TransactionClient,
    duesOfPayId: number,
  ): Promise<number> {
    const links = await tx.pPPaymentDeuesOfPay.findMany({
      where: { duesOfPayId },
      include: {
        payment: {
          include: {
            PPPaymentDeuesOfPay: true,
          },
        },
      },
    });

    let coveredAmount = 0;

    for (const link of links) {
      if (link.payment.status !== PPStatusPayment.COMPLETED) {
        continue;
      }

      const linksCount = link.payment.PPPaymentDeuesOfPay.length || 1;
      coveredAmount += link.payment.amount / linksCount;
    }

    return coveredAmount;
  }
}
