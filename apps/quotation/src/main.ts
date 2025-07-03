import { NestFactory } from '@nestjs/core';
import { QuotationModule } from './quotation.module';
import { INestApplication, VersioningType } from '@nestjs/common';

export let app: INestApplication;
async function bootstrap() {
  app = await NestFactory.create(QuotationModule);
  app.enableCors({
    origin: 'http://localhost:4204',
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-id'],
  });
  app.setGlobalPrefix('quotation');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.POST_QUOTATION ?? 3000);
}
bootstrap();
