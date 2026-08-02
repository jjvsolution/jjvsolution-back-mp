import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';

@Injectable()
export class PCQaRulesRepository {
  constructor(private readonly prisma: Prisma) {}
  get db() {
    return this.prisma.pCQaRules;
  }
  get actorsDb() {
    return this.prisma.pCQaRuleActors;
  }
}
