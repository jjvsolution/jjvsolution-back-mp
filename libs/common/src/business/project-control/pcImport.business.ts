import { Injectable } from '@nestjs/common';
import { PCBacklogItemsRepository, PCSprintsRepository } from '@database/prisma';
import { ResponseClass } from 'common/config';
import {
  PCBacklogStatus,
  PCBacklogType,
  PCDependencyType,
  PCPriority,
} from '@prisma/client';
import { PCProjectsBusiness } from './pcProjects.business';
import { PCBacklogBusiness } from './pcBacklog.business';
import { PCDependenciesBusiness } from './pcDependencies.business';
import { Workbook } from 'exceljs';

export type PCImportRow = {
  rowNumber: number;
  codigo: string;
  tipo: string;
  titulo: string;
  descripcion?: string;
  prioridad?: string;
  estado?: string;
  storyPoints?: number;
  horasEstimadas?: number;
  responsable?: string;
  sprint?: string;
  codigoPadre?: string;
  dependeDe?: string;
};

export type PCImportPreviewResult = {
  validRows: PCImportRow[];
  invalidRows: Array<PCImportRow & { errors: string[] }>;
  duplicateCodesInFile: string[];
  existingCodes: string[];
};

const TEMPLATE_COLUMNS = [
  'codigo',
  'tipo',
  'titulo',
  'descripcion',
  'prioridad',
  'estado',
  'storyPoints',
  'horasEstimadas',
  'responsable',
  'sprint',
  'codigoPadre',
  'dependeDe',
];

@Injectable()
export class PCImportBusiness extends ResponseClass {
  constructor(
    private readonly pcProjectsBusiness: PCProjectsBusiness,
    private readonly pcBacklogBusiness: PCBacklogBusiness,
    private readonly pcBacklogItemsRepository: PCBacklogItemsRepository,
    private readonly pcSprintsRepository: PCSprintsRepository,
    private readonly pcDependenciesBusiness: PCDependenciesBusiness,
  ) {
    super();
  }

  getTemplateDefinition() {
    return {
      columns: TEMPLATE_COLUMNS,
      sample: {
        codigo: 'T-001',
        tipo: 'TAREA',
        titulo: 'Ejemplo',
        descripcion: '',
        prioridad: 'MEDIA',
        estado: 'PENDIENTE',
        storyPoints: 3,
        horasEstimadas: 8,
        responsable: '',
        sprint: '',
        codigoPadre: '',
        dependeDe: '',
      },
    };
  }

  async buildTemplateBuffer(): Promise<Buffer> {
    const wb = new Workbook();
    const ws = wb.addWorksheet('Backlog');
    ws.addRow(TEMPLATE_COLUMNS);
    ws.addRow([
      'T-001',
      'TAREA',
      'Ejemplo',
      '',
      'MEDIA',
      'PENDIENTE',
      3,
      8,
      '',
      '',
      '',
      '',
    ]);
    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  private normalizeHeader(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  async previewFromBuffer(
    companyId: number,
    userId: string | undefined,
    projectId: number,
    buffer: Buffer,
  ): Promise<PCImportPreviewResult> {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      userId,
      projectId,
    );

    const wb = new Workbook();
    await wb.xlsx.load(Uint8Array.from(buffer) as never);
    const ws = wb.worksheets[0];
    if (!ws) this.badRequest('PC_IMPORT_EMPTY_FILE');

    const headerRow = ws.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell((cell, col) => {
      headers[col - 1] = this.normalizeHeader(cell.value);
    });

    const required = ['codigo', 'tipo', 'titulo'];
    for (const r of required) {
      if (!headers.includes(r)) this.badRequest(`PC_IMPORT_MISSING_COLUMN:${r}`);
    }

    const rows: PCImportRow[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const get = (name: string) => {
        const idx = headers.indexOf(name);
        if (idx < 0) return undefined;
        const val = row.getCell(idx + 1).value;
        if (val == null) return undefined;
        if (typeof val === 'object' && 'text' in val) {
          return String((val as { text: string }).text);
        }
        return String(val);
      };
      const codigo = get('codigo')?.trim() ?? '';
      if (!codigo) return;
      rows.push({
        rowNumber,
        codigo,
        tipo: (get('tipo') ?? '').toUpperCase(),
        titulo: get('titulo') ?? '',
        descripcion: get('descripcion'),
        prioridad: get('prioridad')?.toUpperCase(),
        estado: get('estado')?.toUpperCase(),
        storyPoints: get('storypoints')
          ? Number(get('storypoints'))
          : undefined,
        horasEstimadas: get('horasestimadas')
          ? Number(get('horasestimadas'))
          : undefined,
        responsable: get('responsable'),
        sprint: get('sprint'),
        codigoPadre: get('codigopadre'),
        dependeDe: get('dependede'),
      });
    });

    const codeCount = new Map<string, number>();
    for (const r of rows) {
      codeCount.set(r.codigo, (codeCount.get(r.codigo) ?? 0) + 1);
    }
    const duplicateCodesInFile = [...codeCount.entries()]
      .filter(([, c]) => c > 1)
      .map(([c]) => c);

    const existing = await this.pcBacklogItemsRepository.db.findMany({
      where: {
        projectId,
        companyId,
        isDeleted: false,
        code: { in: rows.map((r) => r.codigo) },
      },
      select: { code: true },
    });
    const existingCodes = existing.map((e) => e.code);

    const validTypes = new Set(Object.values(PCBacklogType));
    const validPriorities = new Set(Object.values(PCPriority));
    const validStatuses = new Set(Object.values(PCBacklogStatus));

    const validRows: PCImportRow[] = [];
    const invalidRows: Array<PCImportRow & { errors: string[] }> = [];

    for (const row of rows) {
      const errors: string[] = [];
      if (!row.titulo) errors.push('titulo required');
      if (!validTypes.has(row.tipo as PCBacklogType)) {
        errors.push('tipo invalid');
      }
      if (row.prioridad && !validPriorities.has(row.prioridad as PCPriority)) {
        errors.push('prioridad invalid');
      }
      if (row.estado && !validStatuses.has(row.estado as PCBacklogStatus)) {
        errors.push('estado invalid');
      }
      if (row.horasEstimadas != null && row.horasEstimadas < 0) {
        errors.push('horasEstimadas invalid');
      }
      if (duplicateCodesInFile.includes(row.codigo)) {
        errors.push('duplicate code in file');
      }
      if (existingCodes.includes(row.codigo)) {
        errors.push('code already exists');
      }
      if (errors.length) invalidRows.push({ ...row, errors });
      else validRows.push(row);
    }

    return {
      validRows,
      invalidRows,
      duplicateCodesInFile,
      existingCodes,
    };
  }

  async confirm(
    companyId: number,
    ownerUserId: string,
    scopeUserId: string | undefined,
    projectId: number,
    rows: PCImportRow[],
    actorCodeToId?: Record<string, number>,
  ) {
    await this.pcProjectsBusiness.assertProjectAccess(
      companyId,
      scopeUserId,
      projectId,
    );

    const sprints = await this.pcSprintsRepository.db.findMany({
      where: { projectId, companyId, isDeleted: false },
    });
    const sprintByName = new Map(
      sprints.map((s) => [s.name.toLowerCase(), s.id]),
    );

    const createdByCode = new Map<string, number>();
    const pendingDeps: Array<{ code: string; depends: string[] }> = [];

    for (const row of rows) {
      const parentId = row.codigoPadre
        ? createdByCode.get(row.codigoPadre)
        : undefined;
      if (row.codigoPadre && parentId == null) {
        const parent = await this.pcBacklogItemsRepository.db.findFirst({
          where: {
            projectId,
            companyId,
            code: row.codigoPadre,
            isDeleted: false,
          },
        });
        if (parent) createdByCode.set(parent.code, parent.id);
      }

      const responsibleId =
        row.responsable && actorCodeToId
          ? actorCodeToId[row.responsable]
          : undefined;

      const created = await this.pcBacklogBusiness.createItem(
        companyId,
        ownerUserId,
        scopeUserId,
        {
          projectId,
          code: row.codigo,
          type: row.tipo as PCBacklogType,
          title: row.titulo,
          description: row.descripcion,
          priority: (row.prioridad as PCPriority) ?? PCPriority.MEDIA,
          status: (row.estado as PCBacklogStatus) ?? PCBacklogStatus.PENDIENTE,
          storyPoints: row.storyPoints,
          estimatedHours: row.horasEstimadas ?? 0,
          responsibleId: responsibleId ?? null,
          parentId:
            row.codigoPadre != null
              ? (createdByCode.get(row.codigoPadre) ?? null)
              : null,
          sprintId: row.sprint
            ? (sprintByName.get(row.sprint.toLowerCase()) ?? null)
            : null,
        },
      );
      createdByCode.set(created.code, created.id);
      if (row.dependeDe) {
        pendingDeps.push({
          code: row.codigo,
          depends: row.dependeDe.split(',').map((s) => s.trim()).filter(Boolean),
        });
      }
    }

    for (const dep of pendingDeps) {
      const successorId = createdByCode.get(dep.code);
      if (!successorId) continue;
      for (const predCode of dep.depends) {
        let predecessorId = createdByCode.get(predCode);
        if (!predecessorId) {
          const pred = await this.pcBacklogItemsRepository.db.findFirst({
            where: {
              projectId,
              companyId,
              code: predCode,
              isDeleted: false,
            },
          });
          predecessorId = pred?.id;
        }
        if (!predecessorId) continue;
        await this.pcDependenciesBusiness.createDependency(
          companyId,
          ownerUserId,
          scopeUserId,
          {
            projectId,
            predecessorId,
            successorId,
            dependencyType: PCDependencyType.FIN_A_INICIO,
          },
        );
      }
    }

    return {
      createdCount: createdByCode.size,
      codes: [...createdByCode.keys()],
    };
  }
}
