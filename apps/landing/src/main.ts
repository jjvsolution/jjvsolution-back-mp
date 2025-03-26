import { NestFactory } from '@nestjs/core';
import { LandingModule } from './landing.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(LandingModule);
  app.setGlobalPrefix('landing');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
