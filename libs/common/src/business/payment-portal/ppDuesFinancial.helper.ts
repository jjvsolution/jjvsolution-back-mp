import { PPStatusPayment } from '@prisma/client';

export type PPDuesFinancialStatus =
  | 'PENDIENTE'
  | 'PARCIALMENTE_PAGADA'
  | 'PAGADA'
  | 'VENCIDA';

type PaymentLink = {
  payment: {
    id?: number;
    amount: number;
    status: PPStatusPayment;
  };
};

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function calculatePaidAmountFromLinks(links: PaymentLink[]): number {
  let paidAmount = 0;

  for (const link of links) {
    if (link.payment.status !== PPStatusPayment.COMPLETED) {
      continue;
    }

    paidAmount += link.payment.amount;
  }

  return paidAmount;
}

export function calculateTotalPaidFromUniquePayments(
  links: PaymentLink[],
): number {
  const paymentAmounts = new Map<number, number>();

  for (const link of links) {
    if (link.payment.status !== PPStatusPayment.COMPLETED) {
      continue;
    }

    if (link.payment.id != null) {
      paymentAmounts.set(link.payment.id, link.payment.amount);
    }
  }

  return Array.from(paymentAmounts.values()).reduce((sum, amount) => sum + amount, 0);
}

export function calculateDueFinancialStatus(
  due: { amount: number; expirationDate: Date },
  paidAmount: number,
): PPDuesFinancialStatus {
  const epsilon = 0.001;

  if (paidAmount >= due.amount - epsilon) {
    return 'PAGADA';
  }

  if (due.expirationDate < startOfToday()) {
    return 'VENCIDA';
  }

  if (paidAmount > epsilon) {
    return 'PARCIALMENTE_PAGADA';
  }

  return 'PENDIENTE';
}
