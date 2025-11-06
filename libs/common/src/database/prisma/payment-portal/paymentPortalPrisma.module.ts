import { Module } from '@nestjs/common';
import { Prisma } from '../prisma';
import {
  PPDebtsToPayRepository,
  PPDuesOfPayRepository,
} from '.';

const provider = [
  Prisma,
  PPDebtsToPayRepository,
  PPDuesOfPayRepository,
];

@Module({
  providers: provider,
  exports: provider,
})
export class PaymentPortalPrismaModule {}
