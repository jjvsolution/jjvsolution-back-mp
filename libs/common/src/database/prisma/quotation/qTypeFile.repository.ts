import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class QTypeFileRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.qTypeFile;
  }
}
