import { Injectable } from '@nestjs/common';
import { GenetarePdfBusiness, replaceInterface } from '../generic/generate-pdf.business';
import { ResponseClass } from 'common/config';

@Injectable()
export class QTemplateBusiness extends ResponseClass {
  constructor(private readonly genetarePdfBusiness: GenetarePdfBusiness) {
    super();
  }
  public async getTemplate() {
    const replace: replaceInterface[] = [
      { id: 'TITLE', type: 'string', value: 'Este es el título' },
      { id: 'TABLE', type: 'table', value: { header: ['Feature', 'Description'], rows: [['Tables', 'Organized data display'], ['Lists', 'Bullet points and numbers'], ['Code', 'Syntax highlighted blocks']] } },
  ];
    return this.genetarePdfBusiness.getTemplate('TEST', replace);
  }
}
