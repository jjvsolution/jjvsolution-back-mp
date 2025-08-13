import { Module } from '@nestjs/common';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';
import { PrismaModule } from '@database/prisma';
import { GraphQlQuotationModule } from './applications/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'common/config/configuration';
import { Log4jsModule } from 'common/shared';
import { useFactoryLogger } from 'common/config';
import puppeteer from 'puppeteer';

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
    GraphQlQuotationModule,
  ],
  controllers: [QuotationController],
  providers: [QuotationService],
})
export class QuotationModule {
  constructor() {
    puppeteer
      .launch({
        executablePath: process.env.CHROMIUM_PATH, // usar el chromium del sistema
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      .then((browser) => console.log(browser));
  }
}
