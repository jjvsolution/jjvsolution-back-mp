import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  QBusinessRepository,
  QClientsRepository,
  QFileRepository,
  QItemsQuotationRepository,
  QProdServRepository,
  QQuotationRepository,
  QStatusRepository,
  QTemplateRepository,
  QTypeFileRepository,
  QUsersRepository,
} from '.';

const provider = [
  Prisma,
  QBusinessRepository,
  QClientsRepository,
  QFileRepository,
  QItemsQuotationRepository,
  QProdServRepository,
  QQuotationRepository,
  QStatusRepository,
  QTemplateRepository,
  QTypeFileRepository,
  QUsersRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class QuotationPrismaModule {}
