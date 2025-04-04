import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma';

@Injectable()
export class QFileRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.qFile;
  }
}
