import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface } from 'common/interfaces';

export const loggerFactory = async (
  configService: ConfigService<ConfigurationsInterface>,
) => {
  console.log(
    `log\nappName: ${configService.get('GLOBAL_PREFIX')}\nhost: ${configService.get('HOST_LOGSTASH')}`,
  );
  return {
    appenders: {
      custom: { type: '/shared/log4js/appendBD' },
      console: { type: 'stdout' },
      /* logstash: {
        type: '@log4js-node/logstashudp',
        host: configService.get('HOST_LOGSTASH'),
        port: 4560,
        extraDataProvider: () => ({
          appName: configService.get('GLOBAL_PREFIX'),
        }),
      }, */
    },
    categories: {
      default: { appenders: [/* 'logstash', */ 'console', 'custom'], level: 'info' },
    },
  };
};
