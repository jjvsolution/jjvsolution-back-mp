import { Injectable } from '@nestjs/common';
import { QQuotationRepository, QStatusRepository } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { ResponseClass } from 'common/config';

@Injectable()
export class QQuotationBusiness extends ResponseClass {
  constructor(
    private readonly qQuotationRepository: QQuotationRepository,
    private readonly qStatusRepository: QStatusRepository,
  ) {
    super();
  }
  async createQuotation(data: Prisma.QQuotationUncheckedCreateInput) {
    const status = await this.qStatusRepository.db.findFirst({
      where: {
        key: 'DRAFT',
        type: 'QUOTATION',
      },
    });
    return this.qQuotationRepository.db.create({
      data: { ...data, statusId: status!.id },
    });
  }
  async createFolio(id: number): Promise<undefined> {
    /**
     * Se busca si el folio es borrador
     */
    const q = await this.qQuotationRepository.db.findFirst({
      where: {
        id: id,
      },
      include: {
        status: {},
      },
    });
    if (
      q &&
      q.status &&
      q.status.key == 'DRAFT' &&
      q.status.type == 'QUOTATION'
    ) {
      const quotation = await this.qQuotationRepository.db.aggregate({
        _max: {
          folio: true,
        },
      });
      const status = await this.qStatusRepository.db.findFirst({
        where: {
          key: 'CREATED',
          type: 'QUOTATION',
        },
      });
      if (quotation && quotation?._max && quotation?._max?.folio) {
        console.log(quotation._max.folio, quotation);
        const folioTmp = ['null', ''].includes(
          quotation._max.folio.toLowerCase(),
        )
          ? 1
          : parseInt(quotation._max.folio) + 1;
        const folio = `${folioTmp}`.padStart(10, '0');
        await this.qQuotationRepository.db.update({
          where: {
            id: id,
          },
          data: {
            folio,
            statusId: status!.id,
          },
        });
      }
    }
  }
  async sendQuotation(id: number): Promise<undefined> {
    const q = await this.qQuotationRepository.db.findFirst({
      where: {
        id: id,
      },
      include: {
        status: {},
      },
    });
    if (
      q &&
      q?.status &&
      q?.status?.key == 'CREATED' &&
      q.status.type == 'QUOTATION'
    ) {
      const status = await this.qStatusRepository.db.findFirst({
        where: {
          key: 'SENT',
          type: 'QUOTATION',
        },
      });
      await this.qQuotationRepository.db.update({
        where: {
          id: id,
        },
        data: {
          statusId: status!.id,
        },
      });
    }
  }
  async approvedQuotation(id: number): Promise<undefined> {
    const q = await this.qQuotationRepository.db.findFirst({
      where: {
        id: id,
      },
      include: {
        status: {},
      },
    });
    if (
      q &&
      q?.status &&
      ['CREATED', 'SENT'].includes(q?.status?.key) &&
      q.status.type == 'QUOTATION'
    ) {
      const status = await this.qStatusRepository.db.findFirst({
        where: {
          key: 'APPROVED',
          type: 'QUOTATION',
        },
      });
      await this.qQuotationRepository.db.update({
        where: {
          id: id,
        },
        data: {
          statusId: status!.id,
        },
      });
    }
  }
  async refusedQuotation(id: number): Promise<undefined> {
    const q = await this.qQuotationRepository.db.findFirst({
      where: {
        id: id,
      },
      include: {
        status: {},
      },
    });
    if (
      q &&
      q?.status &&
      ['CREATED', 'SENT'].includes(q?.status?.key) &&
      q.status.type == 'QUOTATION'
    ) {
      const status = await this.qStatusRepository.db.findFirst({
        where: {
          key: 'REFUSED',
          type: 'QUOTATION',
        },
      });
      await this.qQuotationRepository.db.update({
        where: {
          id: id,
        },
        data: {
          statusId: status!.id,
        },
      });
    }
  }
}
