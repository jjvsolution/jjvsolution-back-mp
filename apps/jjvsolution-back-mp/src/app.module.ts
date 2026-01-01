import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { AccessControlModule } from '@access-control/access-control.module';
import { AdminModule } from '@admin/admin.module';
import { LandingModule } from '@landing/landing.module';
import { QuotationModule } from '@quotation/quotation.module';
import { GraphQLModule as GQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface } from 'common/interfaces';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { GraphQLFormattedError } from 'graphql';
import { PaymentPortalModule } from 'apps/payment-portal/src/payment-portal.module';

@Module({
  imports: [
    GQLModule.forRootAsync<ApolloDriverConfig>({
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (config: ConfigService<ConfigurationsInterface>) => {
        const plugins =
          ['LOCAL', 'DEV'].includes(`${config.get<string>('ENVIRONMENT')?.toUpperCase()}`)
            ? [ApolloServerPluginLandingPageLocalDefault()]
            : [];
        return {
          autoSchemaFile: join(process.cwd(), 'apps/schema.gql'),
          playground: false,
          subscriptions: { 'graphql-ws': true },
          path: '/graphql',
          plugins,
          formatError: (
            formattedError: GraphQLFormattedError,
            error: Error,
          ) => {
            let newError: { message?: string } | string | { payload?: string };
            try {
              newError = JSON.parse(error.message) as object;
            } catch (error2) {
              newError = (error2 as { message?: string })?.message || '';
            }

            return {
              message: (newError as { payload?: string })?.payload || 'Errors', //originalError.message,
              code:
                (newError as { message?: string })?.message ||
                formattedError.extensions?.code,
            };
          },
        };
      },
    }),
    AccessControlModule,
    AdminModule,
    LandingModule,
    QuotationModule,
    PaymentPortalModule,
    RouterModule.register([
      { path: 'access-control', module: AccessControlModule },
      { path: 'admin', module: AdminModule },
      { path: 'landing', module: LandingModule },
      { path: 'quotation', module: QuotationModule },
      { path: 'payment-portal', module: PaymentPortalModule },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
