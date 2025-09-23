import { Injectable } from '@nestjs/common';
import { ResponseClass } from 'common/config';
import {
  QClientsRepository,
  QQuotationRepository,
} from 'common/database/prisma';

@Injectable()
export class QReportBusiness extends ResponseClass {
  constructor(
    private readonly qQuotationRepository: QQuotationRepository,
    private readonly qClientsRepository: QClientsRepository,
  ) {
    super();
  }
  async QDashboard() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const startOfNextMonth = new Date(year, month + 1, 1, 0, 0, 0, 0);

    const countClient = await this.qClientsRepository.db.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    });

    const quotationAll: {
      folio: string;
      title: string;
      detail: string;
      ItemsQuotation: {
        cant: number;
        prodServ: {
          detail: string;
          price: number;
        } | null;
      }[];
      status: {
        key: string;
      } | null;
    }[] = await this.qQuotationRepository.db.findMany({
      select: {
        folio: true,
        title: true,
        detail: true,
        status: { select: { key: true } },
        ItemsQuotation: {
          select: {
            cant: true,
            prodServ: {
              select: {
                detail: true,
                price: true,
              },
            },
          },
        },
      },
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    });

    const quotation: object[] = [];
    let totalQuotationPrice: number = 0;
    let totalQuotationEarned: number = 0;
    let totalProdServ: number = 0;
    const prodServPlus = {};
    for (const q of quotationAll) {
      let total = 0;
      for (const iq of q.ItemsQuotation) {
        total += iq.cant * (iq.prodServ?.price || 0);
        totalProdServ += iq.cant;
        const key = iq.prodServ?.detail || 'null';
        prodServPlus[key] = prodServPlus[key]
          ? +prodServPlus[key] + total
          : total;
        totalQuotationPrice += total;
      }
      const newq = {
        folio: q.folio,
        title: q.title,
        detail: q.detail,
        status: q.status?.key || '',
        total,
      };
      quotation.push(newq);
      totalQuotationEarned += newq.status === 'APPROVED' ? newq.total : 0;
    }
    const totalQuotation: number = quotation.length;

    const data = {
      totalQuotationPrice,
      totalQuotation,
      totalQuotationEarned,
      quotation,
      totalProdServ,
      prodServPlus,
      countClient,
    };
    return data;
  }
}
