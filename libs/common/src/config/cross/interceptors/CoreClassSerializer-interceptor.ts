import { ResponseInterface } from '@interfaces';
import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';
import { CodeErrorRepository } from '@prisma';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { catchError, Observable } from 'rxjs';
import { /* ApiOrquestadoraError, */ ExceptionTemplateError } from '..';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CoreClassSerializerInterceptor extends ClassSerializerInterceptor {
  private countryLang = {
    CL: 'es',
    PE: 'es',
    MX: 'es',
    BR: 'pt',
    US: 'es',
  };
  constructor(
    protected readonly reflector: any,
    protected codeErrorRepository: CodeErrorRepository,
  ) {
    super(reflector);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if ((context.getType() as string) === 'graphql') {
      const op = context.getArgByIndex(3).operation.operation;
      const ctx = GqlExecutionContext.create(context);
      const { req } = ctx.getContext();
      const country: string =
        req?.query && req?.query['lang'] ? req?.query['lang'] + '' : '';
      const language = this.countryLang[country];
      if (op === 'subscription') {
        return next.handle();
      }
      return next.handle().pipe(
        catchError(async (error) => {
          console.log(error);
          const newError = await this.serealizeError(error, language);
          throw new Error(JSON.stringify(newError));
        }),
      );
    }
    return next.handle();
  }

  serialize(
    response: PlainLiteralObject | Array<PlainLiteralObject>,
    options: ClassTransformOptions & { returnClass: any },
  ): PlainLiteralObject | Array<PlainLiteralObject> {
    try {
      const result = super.serialize(
        options.returnClass
          ? plainToClass(options.returnClass, response)
          : response,
        options,
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
  async serealizeError(exception: Error, language: string = 'en') {
    let responseBody: ResponseInterface<any>;
    if (exception instanceof ExceptionTemplateError) {
      const error = await this.codeErrorRepository.getError(
        exception.getResponse()['message'] as string,
        language,
      );
      responseBody = {
        code: exception.getStatus(),
        message: error?.internalCode,
        payload: exception.getMessageError(error!.message),
      };
    } else if (exception instanceof HttpException) {
      const error = await this.codeErrorRepository.getError(
        exception.getResponse()['message'],
        language,
      );
      responseBody = {
        code: exception.getStatus(),
        message: error?.internalCode,
        payload: error?.message,
      };
    }/*  else if (exception instanceof ApiOrquestadoraError) {
      const error = await this.codeErrorRepository.getError(
        exception.code,
        language,
      );
      responseBody = {
        code: HttpStatus.BAD_REQUEST,
        message: error?.internalCode,
        payload: error?.message,
      };
    } */ else {
      responseBody = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
        payload: {},
      };
    }
    return responseBody;
  }
}
