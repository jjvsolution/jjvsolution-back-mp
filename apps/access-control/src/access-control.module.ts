import { Module } from '@nestjs/common';
import { AccessControlController } from './access-control.controller';
import { AccessControlService } from './access-control.service';
import { RestModule } from './applications/rest/rest.module';
import { GraphQlAccessControlModule } from './applications/graphql/graph-ql.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'common/config/configuration';
import { Log4jsModule } from 'common/shared';
import { useFactoryLogger } from 'common/config';

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
    RestModule,
    GraphQlAccessControlModule,
  ],
  controllers: [AccessControlController],
  providers: [AccessControlService],
})
export class AccessControlModule {}
