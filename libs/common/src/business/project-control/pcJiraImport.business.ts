import { Injectable } from '@nestjs/common';
import {
  PCActorsRepository,
  PCBacklogItemsRepository,
  PCProjectMembersRepository,
  PCProjectsRepository,
  PCSprintsRepository,
  PCTimeEntriesRepository,
} from '@database/prisma';
import { ResponseClass } from 'common/config';
import { PCBacklogType } from '@prisma/client';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCBacklogBusiness } from './pcBacklog.business';
import { PCSprintsBusiness } from './pcSprints.business';
import { JiraCloudClient } from './jira/jiraCloud.client';
import {
  JIRA_TYPE_ORDER,
  mapJiraIssueToRow,
  PCJiraMappedRow,
} from './jira/jiraMapper';
import axios from 'axios';

export type PCJiraConnectionInput = {
  jiraBaseUrl: string;
  jiraEmail: string;
  jiraApiToken?: string | null;
  jiraProjectKey: string;
};

export type PCJiraConnectionView = {
  jiraBaseUrl: string | null;
  jiraEmail: string | null;
  jiraProjectKey: string | null;
  jiraLastPullAt: Date | null;
  hasApiToken: boolean;
};

@Injectable()
export class PCJiraImportBusiness extends ResponseClass {
  constructor(
    private readonly pcProjectsBusiness: PCProjectsBusiness,
    private readonly pcProjectsRepository: PCProjectsRepository,
    private readonly pcBacklogBusiness: PCBacklogBusiness,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcSprintsBusiness: PCSprintsBusiness,
    private readonly pcSprintsRepository: PCSprintsRepository,
    private readonly pcActorsRepository: PCActorsRepository,
    private readonly pcProjectMembersRepository: PCProjectMembersRepository,
    private readonly pcTimeEntriesRepository: PCTimeEntriesRepository,
  ) {
    super();
  }

  private normalizeBaseUrl(url: string): string {
    return url.trim().replace(/\/+$/, '');
  }

  private normalizeProjectKey(key: string): string {
    return key.trim().toUpperCase();
  }

  private jiraErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg =
        (error.response?.data as { errorMessages?: string[]; message?: string })
          ?.errorMessages?.[0] ||
        (error.response?.data as { message?: string })?.message ||
        error.message;
      return status ? `Jira HTTP ${status}: ${msg}` : msg;
    }
    return error instanceof Error ? error.message : 'Jira request failed';
  }

  private buildClient(project: {
    jiraBaseUrl: string | null;
    jiraEmail: string | null;
    jiraApiToken: string | null;
  }): JiraCloudClient {
    if (!project.jiraBaseUrl || !project.jiraEmail || !project.jiraApiToken) {
      this.badRequest('PC_JIRA_CONNECTION_INCOMPLETE');
    }
    return new JiraCloudClient({
      baseUrl: project.jiraBaseUrl,
      email: project.jiraEmail,
      apiToken: project.jiraApiToken,
    });
  }

  async getConnection(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ): Promise<PCJiraConnectionView> {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    return {
      jiraBaseUrl: project.jiraBaseUrl,
      jiraEmail: project.jiraEmail,
      jiraProjectKey: project.jiraProjectKey,
      jiraLastPullAt: project.jiraLastPullAt,
      hasApiToken: Boolean(project.jiraApiToken),
    };
  }

  async saveConnection(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    input: PCJiraConnectionInput,
  ): Promise<PCJiraConnectionView> {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );

    const jiraBaseUrl = this.normalizeBaseUrl(input.jiraBaseUrl);
    const jiraEmail = input.jiraEmail.trim();
    const jiraProjectKey = this.normalizeProjectKey(input.jiraProjectKey);
    if (!jiraBaseUrl || !jiraEmail || !jiraProjectKey) {
      this.badRequest('PC_JIRA_CONNECTION_INVALID');
    }

    const tokenFromInput = input.jiraApiToken?.trim() || '';
    const jiraApiToken = tokenFromInput || project.jiraApiToken;
    if (!jiraApiToken) {
      this.badRequest('PC_JIRA_TOKEN_REQUIRED');
    }

    await this.pcProjectsRepository.db.update({
      where: { id: projectId },
      data: {
        jiraBaseUrl,
        jiraEmail,
        jiraApiToken,
        jiraProjectKey,
      },
    });

    return this.getConnection(companyId, userId, projectId);
  }

  async testConnection(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    if (!project.jiraProjectKey) {
      this.badRequest('PC_JIRA_CONNECTION_INCOMPLETE');
    }
    try {
      const client = this.buildClient(project);
      const me = await client.testConnection();
      await client.searchProjectIssues(project.jiraProjectKey, ['summary']);
      return {
        ok: true,
        displayName: me.displayName,
        accountId: me.accountId,
        jiraProjectKey: project.jiraProjectKey,
      };
    } catch (error) {
      this.badRequest(this.jiraErrorMessage(error));
    }
  }

  async preview(
    companyId: number,
    userId: string | undefined,
    projectId: number,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );
    if (!project.jiraProjectKey) {
      this.badRequest('PC_JIRA_CONNECTION_INCOMPLETE');
    }

    let issues;
    try {
      const client = this.buildClient(project);
      issues = await client.searchProjectIssues(project.jiraProjectKey);
    } catch (error) {
      this.badRequest(this.jiraErrorMessage(error));
    }

    const existingItems = await this.pcBacklogItemsRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
      select: { code: true, jiraIssueId: true },
    });
    const existingCodes = new Set(existingItems.map((i) => i.code));
    const existingJiraIds = new Set(
      existingItems.map((i) => i.jiraIssueId).filter(Boolean) as string[],
    );

    const actors = await this.pcActorsRepository.db.findMany({
      where: { companyId, isDeleted: false, active: true },
      select: { id: true, email: true },
    });
    const actorByEmail = new Map(
      actors
        .filter((a) => a.email)
        .map((a) => [a.email!.toLowerCase(), a.id]),
    );

    const members = await this.pcProjectMembersRepository.db.findMany({
      where: {
        projectId,
        companyId,
        active: true,
        isDeleted: false,
      },
      select: { actorId: true },
    });
    const memberActorIds = new Set(members.map((m) => m.actorId));

    const validRows: Array<PCJiraMappedRow & { responsibleId?: number | null }> =
      [];
    const invalidRows: Array<
      PCJiraMappedRow & { errors: string[]; responsibleId?: number | null }
    > = [];

    issues.forEach((issue, index) => {
      const row = mapJiraIssueToRow(
        issue,
        index + 1,
        existingCodes,
        existingJiraIds,
      );
      const errors: string[] = [...row.warnings.filter((w) => w.includes('sin padre'))];

      let responsibleId: number | null = null;
      if (row.responsableEmail) {
        const actorId = actorByEmail.get(row.responsableEmail.toLowerCase());
        if (!actorId) {
          row.warnings.push(
            `No hay actor con email ${row.responsableEmail}`,
          );
        } else if (!memberActorIds.has(actorId)) {
          row.warnings.push(
            `Actor ${row.responsableEmail} no es miembro activo del proyecto`,
          );
        } else {
          responsibleId = actorId;
        }
      }

      if (!row.titulo) errors.push('titulo required');
      if (row.tipo === PCBacklogType.SUBTAREA && !row.codigoPadre) {
        errors.push('SUBTAREA requires parent');
      }

      if (errors.length) {
        invalidRows.push({ ...row, responsibleId, errors });
      } else {
        validRows.push({ ...row, responsibleId });
      }
    });

    return {
      validRows,
      invalidRows,
      existingCodes: [...existingCodes],
      willCreateCount: validRows.filter((r) => !r.willUpdate).length,
      willUpdateCount: validRows.filter((r) => r.willUpdate).length,
      warnings: validRows.flatMap((r) =>
        r.warnings.map((w) => `${r.codigo}: ${w}`),
      ),
    };
  }

  async confirm(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    projectId: number,
    issueKeys?: string[] | null,
  ) {
    const project = await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      projectId,
    );
    if (!project.jiraProjectKey) {
      this.badRequest('PC_JIRA_CONNECTION_INCOMPLETE');
    }

    const preview = await this.preview(companyId, scopeUserId, projectId);
    const keyFilter =
      issueKeys && issueKeys.length
        ? new Set(issueKeys.map((k) => k.toUpperCase()))
        : null;
    const rows = preview.validRows.filter((r) =>
      keyFilter ? keyFilter.has(r.codigo.toUpperCase()) : true,
    );
    if (!rows.length) {
      this.badRequest('PC_JIRA_NO_VALID_ROWS');
    }

    rows.sort(
      (a, b) =>
        JIRA_TYPE_ORDER[a.tipo] - JIRA_TYPE_ORDER[b.tipo] ||
        a.codigo.localeCompare(b.codigo),
    );

    const sprints = await this.pcSprintsRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
    });
    const sprintByName = new Map(
      sprints.map((s) => [s.name.toLowerCase(), s.id]),
    );

    const ensureSprint = async (name: string): Promise<number> => {
      const key = name.toLowerCase();
      const existing = sprintByName.get(key);
      if (existing) return existing;
      const start = project.startDate ?? new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + 14);
      const created = await this.pcSprintsBusiness.createSprint(
        companyId,
        ownerUserId,
        scopeUserId,
        {
          projectId,
          name,
          startDate: start,
          endDate: end,
        },
      );
      sprintByName.set(key, created.id);
      return created.id;
    };

    const codeToId = new Map<string, number>();
    const existingItems = await this.pcBacklogItemsRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
      select: { id: true, code: true, jiraIssueId: true },
    });
    for (const item of existingItems) {
      codeToId.set(item.code, item.id);
      if (item.jiraIssueId) codeToId.set(`jira:${item.jiraIssueId}`, item.id);
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      let parentId: number | null = null;
      if (row.codigoPadre) {
        parentId =
          codeToId.get(row.codigoPadre) ??
          (
            await this.pcBacklogItemsRepository.db.findFirst({
              where: {
                projectId,
                companyId,
                code: row.codigoPadre,
                isDeleted: false,
              },
            })
          )?.id ??
          null;
        if (row.tipo === PCBacklogType.SUBTAREA && parentId == null) {
          continue;
        }
      }

      const sprintId = row.sprint ? await ensureSprint(row.sprint) : null;

      const existing =
        (await this.pcBacklogItemsRepository.db.findFirst({
          where: {
            projectId,
            companyId,
            isDeleted: false,
            OR: [{ jiraIssueId: row.jiraIssueId }, { code: row.codigo }],
          },
        })) ?? null;

      if (existing) {
        await this.pcBacklogBusiness.update(
          companyId,
          scopeUserId,
          projectId,
          existing.id,
          {
            title: row.titulo,
            description: row.descripcion ?? null,
            priority: row.prioridad,
            status: row.estado,
            storyPoints: row.storyPoints ?? null,
            estimatedHours: row.horasEstimadas,
            remainingHours: row.remainingHours ?? null,
            responsibleId: row.responsibleId ?? null,
            parentId,
            sprintId,
            type: row.tipo,
            jiraIssueId: row.jiraIssueId,
          },
        );
        codeToId.set(row.codigo, existing.id);
        codeToId.set(`jira:${row.jiraIssueId}`, existing.id);
        updatedCount += 1;
      } else {
        const created = await this.pcBacklogBusiness.createItem(
          companyId,
          ownerUserId,
          scopeUserId,
          {
            projectId,
            code: row.codigo,
            type: row.tipo,
            title: row.titulo,
            description: row.descripcion ?? null,
            priority: row.prioridad,
            status: row.estado,
            storyPoints: row.storyPoints ?? null,
            estimatedHours: row.horasEstimadas,
            remainingHours: row.remainingHours ?? null,
            responsibleId: row.responsibleId ?? null,
            parentId,
            sprintId,
            jiraIssueId: row.jiraIssueId,
          },
        );
        codeToId.set(created.code, created.id);
        codeToId.set(`jira:${row.jiraIssueId}`, created.id);
        createdCount += 1;
      }
    }

    let worklogsCreated = 0;
    let worklogsSkipped = 0;
    const client = this.buildClient(project);

    for (const row of rows) {
      const backlogItemId = codeToId.get(row.codigo);
      if (!backlogItemId) continue;

      let worklogs;
      try {
        worklogs = await client.getIssueWorklogs(row.codigo);
      } catch {
        continue;
      }

      for (const wl of worklogs) {
        const existingWl = await this.pcTimeEntriesRepository.db.findFirst({
          where: {
            projectId,
            jiraWorklogId: wl.id,
            isDeleted: false,
          },
        });
        if (existingWl) {
          worklogsSkipped += 1;
          continue;
        }

        const email = wl.author?.emailAddress?.toLowerCase();
        if (!email) {
          worklogsSkipped += 1;
          continue;
        }
        const actor = await this.pcActorsRepository.db.findFirst({
          where: {
            companyId,
            isDeleted: false,
            active: true,
            email: { equals: email, mode: 'insensitive' },
          },
        });
        if (!actor) {
          worklogsSkipped += 1;
          continue;
        }
        const member = await this.pcProjectMembersRepository.db.findFirst({
          where: {
            projectId,
            companyId,
            actorId: actor.id,
            active: true,
            isDeleted: false,
          },
        });
        if (!member) {
          worklogsSkipped += 1;
          continue;
        }

        const hours = Math.round((wl.timeSpentSeconds / 3600) * 100) / 100;
        if (hours <= 0) {
          worklogsSkipped += 1;
          continue;
        }

        const appliedHourlyCost = member.projectHourlyCost;
        await this.pcTimeEntriesRepository.db.create({
          data: {
            companyId,
            userId: ownerUserId,
            projectId,
            backlogItemId,
            actorId: actor.id,
            date: new Date(wl.started),
            hours,
            description:
              typeof wl.comment === 'string'
                ? wl.comment
                : `Jira worklog ${wl.id}`,
            billable: true,
            appliedHourlyCost,
            calculatedCost: hours * appliedHourlyCost,
            jiraWorklogId: wl.id,
          },
        });
        worklogsCreated += 1;
      }
    }

    await this.pcProjectsRepository.db.update({
      where: { id: projectId },
      data: { jiraLastPullAt: new Date() },
    });

    return {
      createdCount,
      updatedCount,
      worklogsCreated,
      worklogsSkipped,
      codes: rows.map((r) => r.codigo),
      warnings: preview.warnings,
    };
  }
}
