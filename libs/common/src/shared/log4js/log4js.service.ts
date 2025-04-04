import { Injectable, Inject, ConsoleLogger } from '@nestjs/common';
import { LOG4JS_PROVIDER } from './log4js.constant';
import { Log4js } from 'log4js';

@Injectable()
export class Log4jsService extends ConsoleLogger {
  constructor(@Inject(LOG4JS_PROVIDER) private Log4js: Log4js) {
    super();
  }

  log(message: any, context?: string) {
    //super.log(message, context);
    const resLogger = this.Log4js.getLogger('system');
    resLogger.info(message, context);
  }

  error(message: any, context?: string) {
    //super.error(message, trace, context);
    const errLogger = this.Log4js.getLogger('error');
    errLogger.error(message, context);
  }

  warn(message: any, context?: string) {
    //super.warn(message, context);
    const errLogger = this.Log4js.getLogger('warn');
    errLogger.warn(message, context);
  }

  info(message: any, context?: string) {
    //super.warn(message, context);
    const errLogger = this.Log4js.getLogger('info');
    errLogger.info(message, context);
  }
}
