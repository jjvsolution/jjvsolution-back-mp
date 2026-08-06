import { Injectable } from '@nestjs/common';
import {
  PCProjectMembersRepository,
  PCSprintsRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCProjectStatus } from '@prisma/client';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCCostsBusiness } from './pcCosts.business';
import { PCCapacityBusiness } from './pcCapacity.business';

export type PCRagStatus = 'GREEN' | 'AMBER' | 'RED';

export type PCPortfolioProjectCard = {
  projectId: number;
  code: string;
  name: string;
  clientName: string | null;
  status: PCProjectStatus;
  currency: string;
  startDate: Date;
  targetEndDate: Date | null;
  membersCount: number;
  backlogCount: number;
  sprintsCount: number;
  budget: number | null;
  projectedFinalCost: number;
  realCost: number;
  percentDeviation: number | null;
  costRag: PCRagStatus;
  projectedEndDate: Date | null;
  scheduleSlipDays: number | null;
  scheduleRag: PCRagStatus;
  overloadedMembers: number;
  balancedMembers: number;
  availableMembers: number;
  maxUtilizationPercent: number;
  loadRag: PCRagStatus;
  overallRag: PCRagStatus;
  warnings: string[];
};

@Injectable()
export class PCPortfolioBusiness extends ResponseClass {
  constructor(
    private readonly pcProjectsBusiness: PCProjectsBusiness,
    private readonly pcCostsBusiness: PCCostsBusiness,
    private readonly pcCapacityBusiness: PCCapacityBusiness,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcSprintsRepository: PCSprintsRepository,
  ) {
    super();
  }

  private ragRank(status: PCRagStatus): number {
    if (status === 'RED') return 2;
    if (status === 'AMBER') return 1;
    return 0;
  }

  private worstRag(...statuses: PCRagStatus[]): PCRagStatus {
    return statuses.reduce((worst, current) =>
      this.ragRank(current) > this.ragRank(worst) ? current : worst,
    );
  }

  private costRag(percentDeviation: number | null, budget: number | null): PCRagStatus {
    if (budget == null || percentDeviation == null) return 'AMBER';
    if (percentDeviation <= 0) return 'GREEN';
    if (percentDeviation <= 10) return 'AMBER';
    return 'RED';
  }

  private scheduleSlipDays(
    projectedEnd: Date | null | undefined,
    targetEnd: Date | null | undefined,
  ): number | null {
    if (!projectedEnd || !targetEnd) return null;
    const ms = projectedEnd.getTime() - targetEnd.getTime();
    return Math.round((ms / (1000 * 60 * 60 * 24)) * 10) / 10;
  }

  private scheduleRag(slipDays: number | null): PCRagStatus {
    if (slipDays == null) return 'AMBER';
    if (slipDays <= 0) return 'GREEN';
    if (slipDays <= 5) return 'AMBER';
    return 'RED';
  }

  private loadRag(
    overloaded: number,
    maxUtilization: number,
  ): PCRagStatus {
    if (overloaded >= 2 || maxUtilization > 120) return 'RED';
    if (overloaded >= 1 || maxUtilization > 100) return 'AMBER';
    return 'GREEN';
  }

  private async buildCard(
    companyId: number,
    userId: string | undefined,
    project: {
      id: number;
      code: string;
      name: string;
      clientName: string | null;
      status: PCProjectStatus;
      currency: string;
      startDate: Date;
      targetEndDate: Date | null;
    },
  ): Promise<PCPortfolioProjectCard> {
    const [cost, capacity, membersCount, sprintsCount] = await Promise.all([
      this.pcCostsBusiness.summary(companyId, userId, project.id),
      this.pcCapacityBusiness.getCapacityInsights(companyId, userId, project.id),
      this.pcProjectMembersRepository.db.count({
        where: {
          projectId: project.id,
          companyId,
          active: true,
          isDeleted: false,
        },
      }),
      this.pcSprintsRepository.db.count({
        where: { projectId: project.id, companyId, isDeleted: false },
      }),
    ]);

    const loads = capacity.actorLoads ?? [];
    const overloadedMembers = loads.filter((l) => l.status === 'OVERLOADED').length;
    const balancedMembers = loads.filter((l) => l.status === 'BALANCED').length;
    const availableMembers = loads.filter((l) => l.status === 'AVAILABLE').length;
    const maxUtilizationPercent = loads.length
      ? Math.max(...loads.map((l) => l.utilizationPercent ?? 0))
      : 0;

    const projectedEndDate = capacity.baselineEndDate ?? null;
    const scheduleSlipDays = this.scheduleSlipDays(
      projectedEndDate,
      project.targetEndDate,
    );

    const costRag = this.costRag(cost.percentDeviation, cost.budget);
    const scheduleRag = this.scheduleRag(scheduleSlipDays);
    const loadRag = this.loadRag(overloadedMembers, maxUtilizationPercent);
    const overallRag = this.worstRag(costRag, scheduleRag, loadRag);

    const warnings = [
      ...(cost.warnings ?? []),
      ...(capacity.warnings ?? []),
    ].slice(0, 8);

    return {
      projectId: project.id,
      code: project.code,
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      currency: project.currency,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      membersCount,
      backlogCount: capacity.backlogItemCount ?? 0,
      sprintsCount,
      budget: cost.budget,
      projectedFinalCost: cost.projectedFinalCost,
      realCost: cost.realCost,
      percentDeviation: cost.percentDeviation,
      costRag,
      projectedEndDate,
      scheduleSlipDays,
      scheduleRag,
      overloadedMembers,
      balancedMembers,
      availableMembers,
      maxUtilizationPercent: Math.round(maxUtilizationPercent * 10) / 10,
      loadRag,
      overallRag,
      warnings,
    };
  }

  async dashboard(
    companyId: number,
    userId: string | undefined,
    statuses?: PCProjectStatus[] | null,
  ) {
    const statusFilter =
      statuses?.length ? statuses : [PCProjectStatus.ACTIVO, PCProjectStatus.PAUSADO];

    const projects = await this.pcProjectsBusiness.findAll(companyId, userId);
    const scoped = projects.filter((p) => statusFilter.includes(p.status));

    const cards = await Promise.all(
      scoped.map((p) => this.buildCard(companyId, userId, p)),
    );

    cards.sort((a, b) => this.ragRank(b.overallRag) - this.ragRank(a.overallRag));

    const totals = { green: 0, amber: 0, red: 0 };
    for (const card of cards) {
      if (card.overallRag === 'GREEN') totals.green += 1;
      else if (card.overallRag === 'AMBER') totals.amber += 1;
      else totals.red += 1;
    }

    const portfolioBudget = cards.every((c) => c.budget == null)
      ? null
      : cards.reduce((s, c) => s + (c.budget ?? 0), 0);

    return {
      companyId,
      generatedAt: new Date(),
      projects: cards,
      totals,
      portfolioBudget,
      portfolioProjectedCost: cards.reduce((s, c) => s + c.projectedFinalCost, 0),
      portfolioRealCost: cards.reduce((s, c) => s + c.realCost, 0),
      projectsAtRisk: totals.red,
    };
  }
}
