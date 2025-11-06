import { NestFactory } from '@nestjs/core';
import { PaymentPortalModule } from './payment-portal.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(PaymentPortalModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-id'],
  });
  app.setGlobalPrefix('payment-portal');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.PORT_PAYMENT_PORTAL ?? 3000);
}
bootstrap();
