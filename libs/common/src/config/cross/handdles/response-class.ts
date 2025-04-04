import {
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  NotAcceptableException,
  RequestTimeoutException,
  ConflictException,
  GoneException,
  HttpVersionNotSupportedException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
  UnprocessableEntityException,
  InternalServerErrorException,
  NotImplementedException,
  ImATeapotException,
  MethodNotAllowedException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { DataInterface, ResponseInterface } from '@interfaces';
import { ExceptionTemplateError } from '@exceptions';

export abstract class ResponseClass {
  protected success<T>(
    payload: T,
    data: DataInterface[] = [],
  ): ResponseInterface<T> {
    /* data.message = data.message || MESSAGE_DEFAULT[HttpStatus.OK]; */
    return { code: HttpStatus.OK, payload, data };
  }
  protected create<T>(
    payload: T,
    data: DataInterface[] = [],
  ): ResponseInterface<T> {
    /* data.message = data.message || MESSAGE_DEFAULT[HttpStatus.CREATED]; */
    return { code: HttpStatus.CREATED, payload, data };
  }

  protected accepted<T>(
    payload: T,
    data: DataInterface[] = [],
  ): ResponseInterface<T> {
    /* data.message = data.message || MESSAGE_DEFAULT[HttpStatus.ACCEPTED]; */
    return { code: HttpStatus.ACCEPTED, payload, data };
  }

  protected noContent<T>(data: DataInterface[] = []): ResponseInterface<T> {
    return {
      code: HttpStatus.NO_CONTENT,
      message: '',
      payload: undefined,
      data,
    };
  }

  protected badRequest<T>(
    payload: T,
    arg?: { key: string; value: string }[],
    description = MESSAGE_DEFAULT[HttpStatus.BAD_REQUEST],
  ): never {
    if (arg === undefined) {
      throw new BadRequestException(payload, description);
    } else {
      throw new ExceptionTemplateError(
        payload,
        arg,
        HttpStatus.BAD_REQUEST,
        description,
      );
    }
  }

  protected unauthorized<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.UNAUTHORIZED],
  ): never {
    throw new UnauthorizedException(payload, description);
  }

  protected notFound<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.NOT_FOUND],
  ): never {
    throw new NotFoundException(payload, description);
  }

  protected forbidden<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.FORBIDDEN],
  ): never {
    throw new ForbiddenException(payload, description);
  }

  protected notAcceptable<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.NOT_ACCEPTABLE],
  ): never {
    throw new NotAcceptableException(payload, description);
  }

  protected requestTimeout<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.REQUEST_TIMEOUT],
  ): never {
    throw new RequestTimeoutException(payload, description);
  }

  protected conflict<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.CONFLICT],
  ): never {
    throw new ConflictException(payload, description);
  }

  protected gone<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.GONE],
  ): never {
    throw new GoneException(payload, description);
  }

  protected httpVersionNotSupported<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.HTTP_VERSION_NOT_SUPPORTED],
  ): never {
    throw new HttpVersionNotSupportedException(payload, description);
  }

  protected payloadTooLarge<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.PAYLOAD_TOO_LARGE],
  ): never {
    throw new PayloadTooLargeException(payload, description);
  }

  protected unsupportedMediaType<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.UNSUPPORTED_MEDIA_TYPE],
  ): never {
    throw new UnsupportedMediaTypeException(payload, description);
  }

  protected unprocessableEntity<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.UNPROCESSABLE_ENTITY],
  ): never {
    throw new UnprocessableEntityException(payload, description);
  }

  protected internalServerError<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.INTERNAL_SERVER_ERROR],
  ): never {
    throw new InternalServerErrorException(payload, description);
  }

  protected notImplemented<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.NOT_IMPLEMENTED],
  ): never {
    throw new NotImplementedException(payload, description);
  }

  protected imATeapot<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.I_AM_A_TEAPOT],
  ): never {
    throw new ImATeapotException(payload, description);
  }

  protected methodNotAllowed<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.METHOD_NOT_ALLOWED],
  ): never {
    throw new MethodNotAllowedException(payload, description);
  }

  protected badGateway<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.BAD_GATEWAY],
  ): never {
    throw new BadGatewayException(payload, description);
  }

  protected serviceUnavailable<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.SERVICE_UNAVAILABLE],
  ): never {
    throw new ServiceUnavailableException(payload, description);
  }

  protected gatewayTimeout<T>(
    payload: T,
    description = MESSAGE_DEFAULT[HttpStatus.GATEWAY_TIMEOUT],
  ): never {
    throw new GatewayTimeoutException(payload, description);
  }
}
export const MESSAGE_DEFAULT = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Earlyhints',
  200: 'Success',
  201: 'Create',
  202: 'Accepted',
  203: 'Non Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Ambiguous',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbiden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I Am a Teapot',
  421: 'Misdirected',
  422: 'Unprocessable Enntity',
  424: 'Failed Dependency',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  500: 'Internnal Server Error',
  501: 'Not Implemented',
  502: 'Bad Geteway',
  503: 'Service Unavailable',
  504: 'Geteway Timeout',
  505: 'HTTP Version Not Supprted',
};
