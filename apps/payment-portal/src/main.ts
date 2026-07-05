import { NestFactory } from '@nestjs/core';
import { PaymentPortalModule } from './payment-portal.module';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(PaymentPortalModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-id'],
  });
  app.setGlobalPrefix('payment-portal');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payment Portal API')
    .setDescription('API REST del portal de pago')
    .setVersion('1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('payment-portal/docu', app, document);

  await app.listen(process.env.PORT_PAYMENT_PORTAL ?? 3000);
}
bootstrap();
