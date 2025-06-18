import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class Prisma extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    /* this.$on('query', async (e) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log(`\n\n\n${e.query} ${e.params}\n\n\n`);
    }); */
  }
}
