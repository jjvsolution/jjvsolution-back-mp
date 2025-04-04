import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
  GraphQLRequestContextWillSendResponse,
} from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { ErrorRepository, LogRepository } from '@prisma';
import { Prisma } from '@prisma/client';
import { Log4jsService } from '@shared/log4js';
import { app } from 'apps/quotation/src/main';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(
    requestContext: GraphQLRequestContext<any>,
  ): Promise<GraphQLRequestListener<any>> {
    const logRepository = app.get(LogRepository);
    const errorRepository = app.get(ErrorRepository);
    const log = app.get(Log4jsService);
    let headers = {};
    let query = '';
    let variables = '';
    if (requestContext.request.operationName !== 'IntrospectionQuery') {
      headers = this.createHeaders(
        requestContext['contextValue']['req']['rawHeaders'],
      );
      query = requestContext.request.query || '';
      variables = JSON.stringify(requestContext.request.variables);
      const data: Prisma.LogCreateInput = {
        categoryName: 'request',
        data: JSON.stringify({
          query,
          variables,
          headers,
        }),
        url: requestContext?.request?.operationName || '',
        method: requestContext.request.http?.method || '',
        code: 0,
        error: '',
        level: 'INFO',
      };
      logRepository.db
        .create({
          data,
        })
        .then(() => {});
      //log.requestGQL(JSON.stringify(data));
      log.log(JSON.stringify(data));
    }
    return {
      async willSendResponse(
        requestContextWillSendResponse: GraphQLRequestContextWillSendResponse<any>,
      ) {
        if (
          requestContextWillSendResponse.request.operationName !==
          'IntrospectionQuery'
        ) {
          if (!requestContextWillSendResponse.errors) {
            const data: Prisma.LogCreateInput = {
              categoryName: 'response',
              data: JSON.stringify({
                data: requestContextWillSendResponse.response.body[
                  'singleResult'
                ]['data'],
                headers,
              }),
              url: requestContextWillSendResponse?.request?.operationName || '',
              method: requestContextWillSendResponse.request.http?.method || '',
              code: 0,
              error: '',
              level: 'INFO',
            };
            logRepository.db
              .create({
                data,
              })
              .then(() => {});
            //log.requestGQL(JSON.stringify(data));
            log.log(JSON.stringify(data));
          } else {
            const errors = requestContextWillSendResponse.errors.concat();
            const listError: any = [];
            const listStack: any = [];
            if (errors) {
              for (const e of errors) {
                listError.push(e.toJSON());
                listStack.push(e.stack);
              }
            }
            const data: Prisma.ErrorCreateInput = {
              error: JSON.stringify(listError),
              responseBody: '',
              url: requestContextWillSendResponse?.request?.operationName || '',
              body: query,
              params: variables,
              headers: JSON.stringify(headers),
              type: 'INFO',
              requestUser: '',
              stack: JSON.stringify(listStack),
            };
            errorRepository.db
              .create({
                data: data,
              })
              .then(() => {});
            delete data.stack;
            //log.errorGQL(JSON.stringify(data));
            log.log(JSON.stringify(data));
          }
        }
      },
    };
  }
  private createHeaders(rawHeaders: string[]) {
    const result: { [key: string]: string } = {};

    for (let i = 0; i < rawHeaders.length; i += 2) {
      const key = rawHeaders[i];
      const value = rawHeaders[i + 1];
      result[key] = value;
    }
    return result;
  }
}
