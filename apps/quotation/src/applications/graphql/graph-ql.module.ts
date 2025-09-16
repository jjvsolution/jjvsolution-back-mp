import { ClassSerializerInterceptor, Module, Provider } from '@nestjs/common';
import {
  AccessControlPrismaModule,
  QuotationPrismaModule,
} from '@database/prisma';
import { CodeErrorRepository } from '@database/prisma/codeError.repository';
import { QuotationBusinessModule } from '@business';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jwtFactory } from '@config';
import { GraphQLModule as GQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { CoreClassSerializerInterceptor } from '@config/cross/interceptors';
//import { LoggingPlugin } from '@shared/graphQLPlugins/logging.plugin';
import {
  QBusinessResolver,
  QClientsResolver,
  QFileResolver,
  QItemsQuotationResolver,
  QProdServResolver,
  QQuotationResolver,
  QReportResolver,
  QStatusResolver,
  QTemplateResolver,
  QTypeFileResolver,
  QUserResolver,
} from '.';
import { GraphQLFormattedError } from 'graphql';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigurationsInterface } from 'common/interfaces';
import { TokenService } from 'common/services';

const resolver: Provider[] = [
  QBusinessResolver,
  QClientsResolver,
  QFileResolver,
  QItemsQuotationResolver,
  QProdServResolver,
  QQuotationResolver,
  QReportResolver,
  QStatusResolver,
  QTemplateResolver,
  QTypeFileResolver,
  QUserResolver,
];

const onlyServer = `${process?.env?.ONLY_SERVER}` == 'true';
@Module({
  imports: [
    QuotationPrismaModule,
    AccessControlPrismaModule,
    QuotationBusinessModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtFactory,
    }),
    ...(onlyServer === true
      ? [
          GQLModule.forRootAsync<ApolloDriverConfig>({
            inject: [ConfigService],
            driver: ApolloDriver,
            useFactory: (config: ConfigService<ConfigurationsInterface>) => {
              const plugins =
                config.get<string>('ENVIRONMENT')?.toUpperCase() === 'LOCAL'
                  ? [ApolloServerPluginLandingPageLocalDefault()]
                  : [];
              return {
                autoSchemaFile: join(
                  process.cwd(),
                  'apps/quotation/src/applications/graphql/schema.gql',
                ),
                playground: false,
                subscriptions: {
                  'graphql-ws': true,
                },
                path: '/quotation/graphql',
                plugins,
                formatError: (
                  formattedError: GraphQLFormattedError,
                  error: Error,
                ) => {
                  let newError:
                    | { message?: string }
                    | string
                    | { payload?: string };
                  try {
                    newError = JSON.parse(error.message) as object;
                  } catch (error2) {
                    newError = (error2 as { message?: string })?.message || '';
                  }

                  return {
                    message:
                      (newError as { payload?: string })?.payload || 'Errors', //originalError.message,
                    code:
                      (newError as { message?: string })?.message ||
                      formattedError.extensions?.code,
                  };
                },
              };
            },
          }),
        ]
      : []),
  ],
  providers: [
    CodeErrorRepository,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (
        reflector: any,
        codeErrorRepository: CodeErrorRepository,
      ): ClassSerializerInterceptor =>
        new CoreClassSerializerInterceptor(reflector, codeErrorRepository),
      inject: [Reflector, CodeErrorRepository],
    },
    /* LoggingPlugin, */ // se debe descomentar para ver logs, solo funciona al ejecutar solo la app de quotation
    JwtService,
    TokenService,
    ...resolver,
  ],
})
export class GraphQlQuotationModule {}
