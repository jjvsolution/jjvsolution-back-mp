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
  console.log(process.env.PORT_ACCESS_CONTROL);
  await app.listen(process.env.PORT_ACCESS_CONTROL ?? 3000);
}
bootstrap();
