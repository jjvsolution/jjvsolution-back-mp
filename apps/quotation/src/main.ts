import { NestFactory } from '@nestjs/core';
import { QuotationModule } from './quotation.module';
import { INestApplication, VersioningType } from '@nestjs/common';

export let app: INestApplication;
async function bootstrap() {
  app = await NestFactory.create(QuotationModule);
  app.setGlobalPrefix('quotation');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors();
  await app.listen(process.env.POST_QUOTATION ?? 3000);
}
bootstrap();
