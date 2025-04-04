import {
  Injectable,
  ExecutionContext,
  Inject,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  LOG4JS_REQUEST_LOGGER,
  LOG4JS_RESPONSE_LOGGER,
} from './log4js.constant';
import { Log4jsInterceptorAbstract } from './log4js.interceptor.abstract';
import { stringify } from 'circular-json-es6';
import { Log4jsService } from './log4js.service';

@Injectable()
export class Log4jsInterceptor extends Log4jsInterceptorAbstract {
  constructor(
    @Inject(LOG4JS_REQUEST_LOGGER) protected requestLogger: Log4jsService,
    @Inject(LOG4JS_RESPONSE_LOGGER) protected responseLogger: Log4jsService,
  ) {
    super(requestLogger, responseLogger);
  }

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return super.intercept(context, next);
  }

  public requestFormat(httpRequest: any): string {
    return stringify({
      url: httpRequest.url,
      method: httpRequest.method,
      params: httpRequest.params,
      query: httpRequest.query,
      body: httpRequest.body,
      httpVersion: httpRequest.httpVersion,
      headers: httpRequest.headers,
      route: httpRequest.route,
      requestUser: httpRequest?.user ? httpRequest.user : {},
    });
  }

  responseFormat(httpResponse: any): string {
    return stringify(httpResponse);
  }
}
