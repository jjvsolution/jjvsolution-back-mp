import { Injectable } from '@nestjs/common';
import { ResponseObjectType } from '@quotation/applications/graphql/models';
import { ResponseClass } from 'common/config';
import { QTemplateRepository } from 'common/database/prisma';
import { mdToPdf } from 'md-to-pdf';
import { generatePdf } from './pdf';
import { cssMD } from './constant';

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
      const content = this.replaceMD(template.template, replace);
      const pdf = await mdToPdf(
        { content },
        { css: cssMD, stylesheet_encoding: 'utf-8' },
      );
      bufferArray = pdf.content;
    } else if (type === 'PDF') {
      const content = this.replacePDF(template.template, replace);
      const file = { content };
      const options = {
        format: 'A4',
        printBackground: true,
        /* args: {
          executablePath:
            process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }, */
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      bufferArray = await generatePdf(file, options);
      //bufferArray
    }
    const buffer = Buffer.from(bufferArray!);
    const base64: string = buffer.toString('base64');
    return super.success<string>(base64);
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
        let table = '<table class="product-table">';
        table +=
          '<thead>' +
          values.header
            .map(
              (r, i) =>
                `${i === 0 ? '<tr>' : ''}<th>${r}</th>${i === values.header.length - 1 ? '</tr>' : ''}`,
            )
            .join('') +
          '</thead>';
        table += '<tbody>';
        for (const row of values.rows) {
          console.log(row);
          table += row
            .map(
              (r, i) =>
                `${i === 0 ? '<tr>' : ''}<td class="${values.align[i]}">${typeof r === 'number' ? Number(r).toLocaleString('es-CL') : r}</td>${i === row.length - 1 ? '</tr>' : ''}`,
            )
            .join('');
        }
        if (values.rows.length > 0) {
          table += `<!-- Sección de totales -->
        <tr>
          <td colspan="${values.rows[0].length - 1}" class="left totales">SUBTOTAL</td>
          <td class="totales-value">${values.subtotal.toLocaleString('es-CL')}</td>
        </tr>
        <tr>
          <td colspan="${values.rows[0].length - 1}" class="left totales">IVA</td>
          <td class="totales-value">${values.iva.toLocaleString('es-CL')}</td>
        </tr>
        <tr>
          <td colspan="${values.rows[0].length}" class="total">$ ${values.total.toLocaleString('es-CL')}</td>
        </tr>`;
        }
        table += '</tbody></table>';
        template = template.replace(regex, table);
      }
    }
    template = template.replace(/{{(.*?)}}/g, '');
    //template = template.replace(/\n/g, '<br>');
    template = template.replace(new RegExp('<p></p>', 'g'), '<br>');
    //return stylePDF + `<div class="">${template}</div>`;
    return template;
  }
  private replaceMD(template: string, replace: replaceInterface[]) {
    //const finalReplace = '';

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
  rows: (string | number)[][];
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
