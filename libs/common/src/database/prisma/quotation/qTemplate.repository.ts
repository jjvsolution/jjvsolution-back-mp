import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class QTemplateRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.qTemplate;
  }
  async getUserTemplate(UID: string) {
    let template = await this.db.findFirst({
      select: { template: true, key: true },
      where: { users: { UID }, isPrincipal: true },
    });
    if (!template) {
      const lastTemplate = await this.db.findFirst({
        select: { template: true, key: true },
        where: { users: { UID } },
        orderBy: {
          id: 'desc',
        },
      });
      if (lastTemplate) {
        template = lastTemplate;
      }
    }
    return template;
  }
}
