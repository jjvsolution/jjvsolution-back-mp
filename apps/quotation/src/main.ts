import { NestFactory } from '@nestjs/core';
import { QuotationModule } from './quotation.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(QuotationModule);
  app.setGlobalPrefix('quotation');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
