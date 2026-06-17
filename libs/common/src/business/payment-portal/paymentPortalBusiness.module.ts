import { Module, Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@services';
import { PassportModule } from '@nestjs/passport';
import {
  AccessControlPrismaModule,
  PaymentPortalPrismaModule,
} from '@database/prisma';
import { PPDuesOfPayBusiness } from './ppDuesOfPay.business';
import { PPDebtsToPayBusiness } from './ppDebtsToPay.business';
import { PPPaymentBusiness } from './ppPayment.business';
import { PPDashboardBusiness } from './ppDashboard.business';

const businessExport: Provider[] = [
  AuthService,
  PPDuesOfPayBusiness,
  PPDebtsToPayBusiness,
  PPPaymentBusiness,
  PPDashboardBusiness,
];

@Module({
  imports: [
    PaymentPortalPrismaModule,
    AccessControlPrismaModule,
    PassportModule,
  ],
  providers: [...businessExport, JwtService],
  exports: businessExport,
})
export class PaymentPortalBusinessModule {}
