import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import GraphQLJSON from 'graphql-type-json';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface } from '@interfaces';
import { GraphQLFormattedError } from 'graphql';

export const graphQLFactory = async (
  config: ConfigService<ConfigurationsInterface>,
) => {
  const plugins =
    config.get('ENVIRONMENT').toUpperCase() === 'LOCAL'
      ? [ApolloServerPluginLandingPageLocalDefault()]
      : [];
  return {
    resolvers: { JSON: GraphQLJSON },
    autoSchemaFile: join(process.cwd(), './schema.gql'),
    playground: false,
    subscriptions: {
      'graphql-ws': true,
    },
    plugins,
    formatError: (formattedError: GraphQLFormattedError, error: Error) => {
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
};
