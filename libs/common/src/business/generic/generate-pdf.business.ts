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
      const options = { format: 'A4', printBackground: true };
      bufferArray = await generatePdf(file, options);
      //bufferArray
    }

    const buffer = Buffer.from(bufferArray!);
    const base64: string = buffer.toString('base64');
    return super.successGQL<string>(base64);
  }
  private replacePDF(template: string, replace: replaceInterface[]) {
    for (const r of replace) {
      const regex = new RegExp(`{{${r.id}}}`, 'g');
      if (r.type === 'string') {
        template = template.replace(regex, r.value.toString());
      }
      if (r.type === 'array_string') {
        const values = r.value as string[];
        template = template.replace(regex, values.join(', '));
      } else if (r.type === 'table') {
        const values = r.value as tableInterface;
        let table = '<table class="productTable">';
        table +=
          '<thead>' +
          values.header
            .map(
              (r, i) =>
                `${i === 0 ? '<tr>' : ''}<th>${r}</th>${i === values.header.length - 1 ? '</tr>' : ''}`,
            )
            .join('') +
          '</thead>';
        for (const row of values.rows) {
          table +=
            '<tbody>' +
            row
              .map(
                (r, i) =>
                  `${i === 0 ? '<tr>' : ''}<td class="${values.align[i]}">${r}</td>${i === row.length - 1 ? '</tr>' : ''}`,
              )
              .join('') +
            '</tbody>';
        }
        if (values.rows.length > 0) {
          table += `<!-- Sección de totales -->
        <tr>
          <td colspan="${values.rows[0].length - 1}" class="totales">SUBTOTAL</td>
          <td>${values.subtotal}</td>
        </tr>
        <tr>
          <td colspan="${values.rows[0].length - 1}" class="totales">IVA</td>
          <td>${values.iva}</td>
        </tr>
        <tr>
          <td colspan="${values.rows[0].length - 1}" class="totales">TOTAL</td>
          <td>${values.total}</td>
        </tr>`;
        }
        table += '</table>';
        template = template.replace(regex, table);
      }
    }
    template = template.replace(/{{(.*?)}}/g, '');
    //template = template.replace(/\n/g, '<br>');
    template = template.replace(new RegExp('<p></p>', 'g'), '<br>');
    return stylePDF + `<div class="">${template}</div>`;
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

export type align = 'center' | 'right' | 'left' | 'justify';
export interface tableInterface {
  header: string[];
  rows: string[][];
  align: align[];
  subtotal: number;
  iva: number;
  total: number;
}
export interface replaceInterface {
  id: string;
  type:
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'
    | 'array_string'
    | 'table';
  value: string | string[] | number | tableInterface;
}
