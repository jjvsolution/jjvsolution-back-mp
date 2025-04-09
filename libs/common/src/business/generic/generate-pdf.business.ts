import { Injectable } from '@nestjs/common';
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
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
}
th, td {
    border: 1px solid #ddd;
    padding: 8px;
}
th { background-color: #f4f4f4; }
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
  async getTemplate(key: string, replace: Record<string, replaceInterface>) {
    const template = await this.qTemplateRepository.db.findUnique({
      where: { key },
    });

    if (!template) return super.badRequest({});

    const pdf = await mdToPdf(
      { content: this.replace(template.template, replace) },
      { css: this.css },
    );

    const buffer = Buffer.from(pdf.content);
    const base64 = buffer.toString('base64');
    return base64;
  }
  private replace(template: string, replace: Record<string, replaceInterface>) {
    const finalReplace = '';

    return template;
  }
}

export interface replaceInterface {
  id: string | { key: string; value: string }[];
  type: 'string' | 'table';
}
