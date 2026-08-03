import {
  PCBacklogStatus,
  PCBacklogType,
  PCPriority,
} from '@prisma/client';
import { JiraIssue } from './jiraCloud.client';

export type PCJiraMappedRow = {
  rowNumber: number;
  jiraIssueId: string;
  codigo: string;
  tipo: PCBacklogType;
  titulo: string;
  descripcion?: string;
  prioridad: PCPriority;
  estado: PCBacklogStatus;
  storyPoints?: number;
  horasEstimadas: number;
  remainingHours?: number;
  responsableEmail?: string;
  sprint?: string;
  codigoPadre?: string;
  warnings: string[];
  willUpdate: boolean;
};

function extractAdfText(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node !== 'object') return String(node);
  const obj = node as { type?: string; text?: string; content?: unknown[] };
  if (obj.text) return obj.text;
  if (Array.isArray(obj.content)) {
    return obj.content.map(extractAdfText).filter(Boolean).join(' ').trim();
  }
  return '';
}

function mapType(issue: JiraIssue): PCBacklogType {
  const name = (issue.fields.issuetype?.name ?? '').toLowerCase();
  if (issue.fields.issuetype?.subtask || name.includes('sub')) {
    return PCBacklogType.SUBTAREA;
  }
  if (name.includes('epic')) return PCBacklogType.EPICA;
  if (name.includes('story') || name.includes('historia')) {
    return PCBacklogType.HISTORIA;
  }
  if (name.includes('bug') || name.includes('defect')) return PCBacklogType.BUG;
  return PCBacklogType.TAREA;
}

function mapStatus(nameRaw?: string): PCBacklogStatus {
  const name = (nameRaw ?? '').toLowerCase();
  if (
    name.includes('done') ||
    name.includes('closed') ||
    name.includes('resolved') ||
    name.includes('terminad')
  ) {
    return PCBacklogStatus.TERMINADA;
  }
  if (name.includes('block') || name.includes('bloque')) {
    return PCBacklogStatus.BLOQUEADA;
  }
  if (name.includes('qa') || name.includes('test') || name.includes('verif')) {
    return PCBacklogStatus.QA;
  }
  if (name.includes('review') || name.includes('revis')) {
    return PCBacklogStatus.EN_REVISION;
  }
  if (
    name.includes('progress') ||
    name.includes('desarrollo') ||
    name.includes('doing') ||
    name.includes('progreso')
  ) {
    return PCBacklogStatus.EN_PROGRESO;
  }
  return PCBacklogStatus.PENDIENTE;
}

function mapPriority(nameRaw?: string): PCPriority {
  const name = (nameRaw ?? '').toLowerCase();
  if (name.includes('highest') || name.includes('critical') || name.includes('crítica') || name.includes('critica')) {
    return PCPriority.CRITICA;
  }
  if (name.includes('high') || name.includes('alta')) return PCPriority.ALTA;
  if (name.includes('low') || name.includes('baja') || name.includes('lowest')) {
    return PCPriority.BAJA;
  }
  return PCPriority.MEDIA;
}

function extractSprintName(fields: JiraIssue['fields']): string | undefined {
  const candidates = [
    fields.customfield_10020,
    fields.customfield_10021,
    fields.sprint,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      const last = candidate[candidate.length - 1] as
        | { name?: string }
        | string
        | undefined;
      if (typeof last === 'string') {
        const match = /name=([^,\]]+)/.exec(last);
        if (match?.[1]) return match[1];
        continue;
      }
      if (last && typeof last === 'object' && last.name) return last.name;
    } else if (typeof candidate === 'object' && candidate && 'name' in candidate) {
      return String((candidate as { name?: string }).name ?? '');
    }
  }
  return undefined;
}

function extractStoryPoints(fields: JiraIssue['fields']): number | undefined {
  const raw = fields.customfield_10016 ?? fields.storyPoints;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

export function mapJiraIssueToRow(
  issue: JiraIssue,
  rowNumber: number,
  existingCodes: Set<string>,
  existingJiraIds: Set<string>,
): PCJiraMappedRow {
  const warnings: string[] = [];
  const tipo = mapType(issue);
  const codigoPadre = issue.fields.parent?.key;
  if (tipo === PCBacklogType.SUBTAREA && !codigoPadre) {
    warnings.push('SUBTAREA sin padre en Jira');
  }

  const originalSeconds = issue.fields.timetracking?.originalEstimateSeconds;
  const remainingSeconds = issue.fields.timetracking?.remainingEstimateSeconds;
  const horasEstimadas =
    originalSeconds != null ? Math.round((originalSeconds / 3600) * 100) / 100 : 0;
  const remainingHours =
    remainingSeconds != null
      ? Math.round((remainingSeconds / 3600) * 100) / 100
      : undefined;

  const responsableEmail = issue.fields.assignee?.emailAddress?.trim();
  if (issue.fields.assignee && !responsableEmail) {
    warnings.push(
      `Assignee sin email (${issue.fields.assignee.displayName ?? 'sin nombre'})`,
    );
  }

  const willUpdate =
    existingJiraIds.has(issue.id) || existingCodes.has(issue.key);

  return {
    rowNumber,
    jiraIssueId: issue.id,
    codigo: issue.key,
    tipo,
    titulo: issue.fields.summary?.trim() || issue.key,
    descripcion: extractAdfText(issue.fields.description) || undefined,
    prioridad: mapPriority(issue.fields.priority?.name),
    estado: mapStatus(issue.fields.status?.name),
    storyPoints: extractStoryPoints(issue.fields),
    horasEstimadas,
    remainingHours,
    responsableEmail: responsableEmail || undefined,
    sprint: extractSprintName(issue.fields),
    codigoPadre: codigoPadre || undefined,
    warnings,
    willUpdate,
  };
}

export const JIRA_TYPE_ORDER: Record<PCBacklogType, number> = {
  [PCBacklogType.EPICA]: 0,
  [PCBacklogType.HISTORIA]: 1,
  [PCBacklogType.TAREA]: 2,
  [PCBacklogType.BUG]: 2,
  [PCBacklogType.SUBTAREA]: 3,
};
