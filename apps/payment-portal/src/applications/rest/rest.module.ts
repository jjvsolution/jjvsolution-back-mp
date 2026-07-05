import { Module } from '@nestjs/common';
import { AccessControlPrismaModule } from '@database/prisma';
import { AccessControlBusinessModule, PaymentPortalBusinessModule } from '@business';
import { TokenService } from 'common/services';
import { DashboardController } from './dashboard.controller';
import { DebtLinkAuthController } from './debtLinkAuth.controller';
import { PublicDebtLinkGuard } from '@config/cross/guards/public-debt-link.guard';

@Module({
  imports: [
    PaymentPortalBusinessModule,
    AccessControlPrismaModule,
    AccessControlBusinessModule,
  ],
  controllers: [DashboardController, DebtLinkAuthController],
  providers: [TokenService, PublicDebtLinkGuard],
})
export class RestModule {}
