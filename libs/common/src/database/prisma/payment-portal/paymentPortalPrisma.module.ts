import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  PPDebtsToPayRepository,
  PPDuesOfPayRepository,
  PPPaymentDuesOfPayRepository,
  PPPaymentRepository,
} from '.';

const provider = [
  Prisma,
  PPDebtsToPayRepository,
  PPDuesOfPayRepository,
  PPPaymentRepository,
  PPPaymentDuesOfPayRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class PaymentPortalPrismaModule {}
