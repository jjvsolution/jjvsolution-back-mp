import { Injectable } from '@nestjs/common';
import { PPDebtsToPayRepository, Prisma } from '@database/prisma';
import { PPStatusPayment, PPTypePaymentType } from '@prisma/client';
import { ResponseClass } from 'common/config';
import { AuthService } from 'common/services';
import { PublicDebtLinkPayloadInterface } from '@interfaces';
import { PPDebtsToPayBusiness } from './ppDebtsToPay.business';
import { PPPaymentBusiness } from './ppPayment.business';

export interface PPDebtLinkPaymentInput {
  id?: number;
  paymentDate: Date;
  paymentType: PPTypePaymentType;
  amount: number;
  duesOfPayIds: number[];
}

@Injectable()
export class PPDebtLinkAuthBusiness extends ResponseClass {
  private readonly publicScope: PublicDebtLinkPayloadInterface['scope'] =
    'PUBLIC_DEBT_LINK';

  constructor(
    private readonly authService: AuthService,
    private readonly ppDebtsToPayRepository: PPDebtsToPayRepository,
    private readonly ppDebtsToPayBusiness: PPDebtsToPayBusiness,
    private readonly ppPaymentBusiness: PPPaymentBusiness,
    private readonly prisma: Prisma,
  ) {
    super();
  }

  async generateToken(
    userId: string | undefined,
    appId: string,
    payId: string,
  ): Promise<string> {
    const debt = await this.ppDebtsToPayRepository.db.findUnique({
      where: { payId, ...(userId ? { userId } : {}) },
    });

    if (!debt) {
      this.notFound('DEBTS_TO_PAY_NOT_FOUND');
    }

    return this.authService.signToken(appId, {
      payId,
      scope: this.publicScope,
    });
  }

  async verifyToken(appId: string, token: string): Promise<string> {
    const payload = (await this.authService.verifyToken(
      appId,
      token,
    )) as unknown as Partial<PublicDebtLinkPayloadInterface>;

    if (payload.scope !== this.publicScope || !payload.payId) {
      this.unauthorized('INVALID_PUBLIC_LINK_TOKEN');
    }

    return payload.payId;
  }

  async getPublicAccess(
    userId: string | undefined,
    appId: string,
    payId: string,
  ) {
    if (!appId) {
      this.badRequest('APP_ID_REQUIRED');
    }

    const token = await this.generateToken(userId, appId, payId);
    const detail = await this.getPublicDetail(userId, payId);

    return {
      token,
      ...detail,
    };
  }

  async getPublicDetail(userId: string | undefined, payId: string) {
    const debt = await this.ppDebtsToPayRepository.db.findUnique({
      where: { payId },
    });

    if (!debt) {
      this.notFound('DEBTS_TO_PAY_NOT_FOUND');
    }

    const detail = await this.ppDebtsToPayBusiness.getDetail(userId, debt.id);
    const payments = await this.prisma.pPPayment.findMany({
      where: {
        PPPaymentDeuesOfPay: {
          every: {
            duesOfPay: { id: debt.id, ...(userId ? { userId } : {}) },
          },
        },
      },
      include: {
        PPPaymentDeuesOfPay: true,
      },
      orderBy: { paymentDate: 'desc' },
    });

    return {
      ...detail,
      payments: payments.map(({ PPPaymentDeuesOfPay, ...payment }) => ({
        ...payment,
        duesOfPayIds: PPPaymentDeuesOfPay.map((link) => link.duesOfPayId),
      })),
    };
  }

  async upsertPublicPayment(
    userId: string | undefined,
    payId: string,
    data: PPDebtLinkPaymentInput,
  ) {
    const debt = await this.ppDebtsToPayRepository.db.findUnique({
      where: { payId, ...(userId ? { userId } : {}) },
      include: { DuesofPay: true },
    });

    if (!debt) {
      this.notFound('DEBTS_TO_PAY_NOT_FOUND');
    }

    const debtDueIds = new Set(debt.DuesofPay.map((due) => due.id));

    if (!data.duesOfPayIds?.length) {
      this.badRequest('DUES_OF_PAY_IDS_REQUIRED');
    }

    for (const dueId of data.duesOfPayIds) {
      if (!debtDueIds.has(dueId)) {
        this.badRequest('DUES_NOT_IN_DEBT');
      }
    }

    const paymentData = {
      paymentDate: data.paymentDate,
      paymentType: data.paymentType,
      amount: data.amount,
      status: PPStatusPayment.PENDING,
      duesOfPayIds: data.duesOfPayIds,
    };

    const paymentId = Number(data.id);
    const isUpdate = Number.isInteger(paymentId) && paymentId > 0;

    if (isUpdate) {
      const existing = await this.prisma.pPPayment.findUnique({
        where: { id: paymentId, ...(userId ? { userId } : {}) },
      });

      if (!existing) {
        this.notFound('PAYMENT_NOT_FOUND');
      }

      if (existing.status !== PPStatusPayment.PENDING) {
        this.badRequest('PAYMENT_NOT_EDITABLE');
      }

      const links = await this.prisma.pPPaymentDeuesOfPay.findMany({
        where: { paymentId },
      });

      const belongsToDebt = links.some((link) =>
        debtDueIds.has(link.duesOfPayId),
      );

      if (!belongsToDebt) {
        this.badRequest('PAYMENT_NOT_IN_DEBT');
      }

      return this.ppPaymentBusiness.updatePayment(userId, paymentId, paymentData);
    }

    return this.ppPaymentBusiness.createPayment(userId, paymentData);
  }
}
