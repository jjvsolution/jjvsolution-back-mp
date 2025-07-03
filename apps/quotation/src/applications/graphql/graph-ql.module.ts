import { ClassSerializerInterceptor, Module, Provider } from '@nestjs/common';
import { AccessControlPrismaModule, QuotationPrismaModule } from '@database/prisma';
import { CodeErrorRepository } from '@database/prisma/codeError.repository';
import { QuotationBusinessModule } from '@business';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { graphQLFactory, jwtFactory } from '@config';
import { GraphQLModule as GQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { CoreClassSerializerInterceptor } from '@config/cross/interceptors';
import { LoggingPlugin } from '@shared/graphQLPlugins/logging.plugin';
import {
  QBusinessResolver,
  QClientsResolver,
  QFileResolver,
  QItemsQuotationResolver,
  QProdServResolver,
  QQuotationResolver,
  QStatusResolver,
  QTemplateResolver,
  QTypeFileResolver,
  QUserResolver,
} from '.';
import { GraphQLFormattedError } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
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
  QStatusResolver,
  QTemplateResolver,
  QTypeFileResolver,
  QUserResolver,
];

@Module({
  imports: [
    QuotationPrismaModule,
    AccessControlPrismaModule,
    QuotationBusinessModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtFactory,
    }),
    GQLModule.forRootAsync<ApolloDriverConfig>({
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: async (config: ConfigService<ConfigurationsInterface>) => {
        const plugins =
          config.get('ENVIRONMENT').toUpperCase() === 'LOCAL'
            ? [ApolloServerPluginLandingPageLocalDefault()]
            : [];
        return {
          /* resolvers: { JSON: GraphQLJSON }, */
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
            let newError: any;
            try {
              newError = JSON.parse(error.message);
            } catch (error) {
              newError = error?.message;
            }

            return {
              message: newError?.payload || 'Errors', //originalError.message,
              code: newError?.message || formattedError.extensions?.code,
            };
          },
        };
      },
    }),
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
export class GraphQlModule {}
