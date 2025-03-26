import { NestFactory } from '@nestjs/core';
import { AccessControlModule } from './access-control.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AccessControlModule);
  app.setGlobalPrefix('access-control');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
