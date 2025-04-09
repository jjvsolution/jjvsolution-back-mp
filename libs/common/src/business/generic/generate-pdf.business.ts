import { Injectable } from '@nestjs/common';
import { ResponseObjectType } from '@quotation/applications/graphql/models';
import { ResponseClass } from 'common/config';
import { QTemplateRepository } from 'common/database/prisma';
import { mdToPdf } from 'md-to-pdf';

@Injectable()
export class GenetarePdfBusiness extends ResponseClass {
  private css: string = `
/* Add your custom CSS here */
body {
    font-family: Barlow, sans-serif;
    line-height: 1.6;
    padding: 20px;
    margin: 0;
}
pre {
    background: #2d2d2d;
    border-radius: 4px;
    margin: 0.5em 0;
}
code {
    font-family: 'Fira Code', Consolas, Monaco, monospace;
}
:not(pre) > code {
    background: #f0f0f0;
    padding: 2px 4px;
    border-radius: 3px;
    color: #e83e8c;
}
img { max-width: 100%; }

table {
  width: 100% !important;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  color: #333;
}

tr:nth-child(even) {
  background-color: #fafafa;
}


blockquote {
    border-left: 4px solid #ddd;
    padding-left: 1em;
    margin-left: 0;
    color: #666;
}

h1 {
    font-size: 2.2em;
    color: #2c3e50;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
    margin: 1.5rem 0;
}

h2 {
    font-size: 1.8em;
    color: #34495e;
    margin: 1.5rem 0;
}

h3 {
    font-size: 1.4em;
    color: #455a64;
}
`;
  constructor(private readonly qTemplateRepository: QTemplateRepository) {
    super();
  }
  async getTemplate(
    key: string,
    replace: replaceInterface[],
  ): Promise<ResponseObjectType<string>> {
    const template = await this.qTemplateRepository.db.findUnique({
      where: { key },
    });

    if (!template) return super.badRequest({});
    const content = this.replace(template.template, replace);
    const pdf = await mdToPdf({ content }, { css: this.css, stylesheet_encoding: 'utf-8' });
    console.log(pdf)
    const buffer = Buffer.from(pdf.content);
    const base64: string = buffer.toString('base64');
    return super.successGQL<string>(base64);
  }
  private replace(template: string, replace: replaceInterface[]) {
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
