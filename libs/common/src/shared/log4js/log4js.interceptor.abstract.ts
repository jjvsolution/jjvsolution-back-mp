import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Log4jsService } from './log4js.service';
import {
  X_AMAZON_API_GATEWAY_API_ID,
  X_AMAZON_API_GATEWAY_STAGE,
  X_REQUEST_ID,
} from './log4js.constant';

export abstract class Log4jsInterceptorAbstract implements NestInterceptor {
  protected constructor(
    protected requestLogger: Log4jsService,
    protected responseLogger: Log4jsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpRequest = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap((httpResponse) => {
        if (!['/api-garantias/health/ping', '/'].includes(httpRequest.url)) {
          this.requestLogger.log(
            this.requestFormat(httpRequest),
            '[Interceptor]',
          );
          const requestUser = httpRequest?.user ? httpRequest.user : {};

          const headers = httpRequest.headers;
          const xRequestID = headers[X_REQUEST_ID];
          const gatewayApiID = headers[X_AMAZON_API_GATEWAY_API_ID];
          const gatewayApiStage = headers[X_AMAZON_API_GATEWAY_STAGE];

          const cHttpResponse = Object.assign(
            {
              requestUser,
              url: httpRequest.url,
              method: httpRequest.method,
              xRequestID,
              gatewayApiID,
              gatewayApiStage,
            },
            httpResponse,
          );
          this.responseLogger.log(
            this.responseFormat(cHttpResponse),
            '[Interceptor]',
          );
        }
      }),
      map((httpResponse) => {
        if (httpResponse) {
          delete httpResponse['code'];
          delete httpResponse['monitoringCode'];
        }
        return httpResponse;
      }),
    );
  }

  abstract requestFormat<T>(httpRequest: T): string;

  abstract responseFormat<T>(httpResponse: T): string;
}
