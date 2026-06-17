import { Module } from '@nestjs/common';
import { AccessControlPrismaModule } from '@database/prisma';
import { AccessControlBusinessModule, PaymentPortalBusinessModule } from '@business';
import { TokenService } from 'common/services';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    PaymentPortalBusinessModule,
    AccessControlPrismaModule,
    AccessControlBusinessModule,
  ],
  controllers: [DashboardController],
  providers: [TokenService],
})
export class RestModule {}
