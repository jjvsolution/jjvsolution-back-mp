import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/prisma';

@Injectable()
export class CodeErrorRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.codeError;
  }
  async getError(code: string, language: string = 'en') {
    const error = await this.db.findFirst({
      where: {
        code,
        language,
      },
    });
    if (error) {
      return error;
    } else {
      return await this.db.findFirst({
        where: {
          code: 'GENERIC_ERROR',
          language,
        },
      });
    }
  }
}
