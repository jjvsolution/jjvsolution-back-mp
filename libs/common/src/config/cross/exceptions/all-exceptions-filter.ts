import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ResponseInterface } from '@interfaces/services/response.interface';
import { Response } from 'express';
import { Log4jsService, LOG4JS_ERROR_LOGGER } from '@shared/log4js';
//import { CodeErrorRepository, ErrorInterface, ErrorRepository } from '@shared';
import { ExceptionTemplateError } from './exceptionTemplate.error';
import { ErrorInterface } from '@interfaces';
import { RequestInterface } from '@interfaces/config/request.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(LOG4JS_ERROR_LOGGER)
    protected log: Log4jsService,
    // protected errorRepository: ErrorRepository,
    // protected codeErrorRepository: CodeErrorRepository,
  ) {}
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestInterface<any>>();
    let responseBody: ResponseInterface<any>;
    if (
      exception instanceof ExceptionTemplateError &&
      exception.getResponse()['message']
    ) {
      //const error = await this.codeErrorRepository.getError(
      //  exception.getResponse()['message'] as string,
      //);
      responseBody = {
        code: exception.getStatus(),
        message: '', //error.internalCode,
        payload: exception.getMessageError(/* error.message */ ''),
      };
    } else if (
      exception instanceof HttpException &&
      exception.getResponse()['message']
    ) {
      //const error = await this.codeErrorRepository.getError(
      //  exception.getResponse()['message'],
      //);
      responseBody = {
        code: exception.getStatus(),
        message: '', //error.internalCode,
        payload: '', //error.message,
      };
    } else {
      responseBody = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
        payload: {},
      };
    }
    console.log(exception);
    const error: ErrorInterface = {
      responseBody: JSON.stringify(responseBody),
      error: `${exception?.['name']}: ${exception?.['message']}`,
      url: request.url,
      body: request.body,
      params: request.params,
      headers: request.headers,
      type: host.getType(),
      requestUser: request.user ? request.user : {},
    };
    //await this.errorRepository.save(error);
    this.log.error(JSON.stringify(error), 'ERROR');
    response.status(responseBody?.code || 500).json(responseBody);
  }
}
