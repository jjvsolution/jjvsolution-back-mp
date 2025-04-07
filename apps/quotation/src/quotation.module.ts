import { Module } from '@nestjs/common';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';
import { PrismaModule } from '@database/prisma';
import { GraphQlModule } from './applications/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'common/config/configuration';
import { Log4jsModule } from 'common/shared';
import { useFactoryLogger } from 'common/config';

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
    GraphQlModule,
  ],
  controllers: [QuotationController],
  providers: [QuotationService],
})
export class QuotationModule {}
