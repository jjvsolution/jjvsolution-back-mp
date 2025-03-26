import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  app.setGlobalPrefix('admin');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  await app.listen(process.env.PORT_ADMIN ?? 3000);
}
bootstrap();
