import { Module } from '@nestjs/common';
import { ProjectControlController } from './project-control.controller';
import { ProjectControlService } from './project-control.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '@config/configuration';
import { Log4jsModule } from '@shared';
import { useFactoryLogger } from '@config';
import { PrismaModule } from '@database/prisma';
import { GraphQlProjectControlModule } from './applications/graphql';
import { RestModule } from './applications/rest';

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
    GraphQlProjectControlModule,
    RestModule,
  ],
  controllers: [ProjectControlController],
  providers: [ProjectControlService],
})
export class ProjectControlModule {}
