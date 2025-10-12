import { Module } from '@nestjs/common';
import { PaymentPortalController } from './payment-portal.controller';
import { PaymentPortalService } from './payment-portal.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@config/configuration';
import { Log4jsModule } from '@shared';
import { useFactoryLogger } from '@config';
import { PrismaModule } from '@database/prisma';
import { GraphQlPaymentPortalModule } from './applications/graphql';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    Log4jsModule.forRootAsync({
      useFactory: useFactoryLogger,
      inject: [ConfigService],
    }),
    PrismaModule,
    GraphQlPaymentPortalModule,
  ],
  controllers: [PaymentPortalController],
  providers: [PaymentPortalService],
})
export class PaymentPortalModule {}
