import { Injectable } from '@nestjs/common';
import { ResponseObjectType } from '@quotation/applications/graphql/models';
import { ResponseClass } from 'common/config';
import { QTemplateRepository } from 'common/database/prisma';
import { mdToPdf } from 'md-to-pdf';
import { generatePdf } from 'html-pdf-node';
import { cssMD, stylePDF } from './constant';

@Injectable()
export class GenetarePdfBusiness extends ResponseClass {
  constructor(private readonly qTemplateRepository: QTemplateRepository) {
    super();
  }
  async getTemplate(
    key: string,
    replace: replaceInterface[],
    type: 'MD' | 'PDF' = 'PDF',
  ): Promise<ResponseObjectType<string>> {
    const template = await this.qTemplateRepository.db.findUnique({
      where: { key },
    });

    if (!template) return super.badRequest({});
    let bufferArray: Buffer<ArrayBufferLike>;
    if (type === 'MD') {
      let content = this.replaceMD(template.template, replace);
      const pdf = await mdToPdf(
        { content },
        { css: cssMD, stylesheet_encoding: 'utf-8' },
      );
      bufferArray = pdf.content;
    } else if (type === 'PDF') {
      let content = this.replacePDF(template.template, replace);
      const file = { content };
      const options = { format: 'A4' };
      bufferArray = await generatePdf(file, options);
      //bufferArray
    }

    const buffer = Buffer.from(bufferArray!);
    const base64: string = buffer.toString('base64');
    return super.successGQL<string>(base64);
  }
  private replacePDF(template: string, replace: replaceInterface[]) {
    for (const r of replace) {
      if (r.type === 'string') {
        template = template.replace(`{{${r.id}}}`, r.value.toString());
      } else if (r.type === 'table') {
        const values = r.value as tableInterface;
        let table = '<table class="table-minimalista">';
        table += values.header
          .map(
            (r, i) =>
              `${i === 0 ? '<tr>' : ''}<th>${r}</th>${i === values.header.length - 1 ? '</tr>' : ''}`,
          )
          .join('');
        for (const row of values.rows) {
          table += row
          .map(
            (r, i) =>
              `${i === 0 ? '<tr>' : ''}<td>${r}</td>${i === row.length - 1 ? '</tr>' : ''}`,
          )
          .join('');
        }
        table += '</table>';
        template = template.replace(`{{${r.id}}}`, table);
      }
    }
    return template + stylePDF;
  }
  private replaceMD(template: string, replace: replaceInterface[]) {
    const finalReplace = '';

    for (const r of replace) {
      if (r.type === 'string') {
        template = template.replace(`{{${r.id}}}`, r.value.toString());
      } else if (r.type === 'table') {
        const values = r.value as tableInterface;

        let table = `|${values.header.join('|')}|`;
        let separador = '';
        for (let i = 0; i < values.header.length; i++) {
          separador += `${i == 0 ? '|' : ''}${Array.from({ length: values.header[i].length }, (_) => '-').join('')}|`;
        }
        table += '\n' + separador + '\n';

        for (const row of values.rows) {
          table += `|${row.join('|')}|\n`;
        }
        template = template.replace(`{{${r.id}}}`, table);
      }
    }
    console.log('\n\n\n\n' + template + '\n\n\n\n');
    return template;
  }
}

export interface tableInterface {
  header: string[];
  rows: string[][];
}
export interface replaceInterface {
  id: string;
  type: 'string' | 'table';
  value: string | tableInterface;
}
