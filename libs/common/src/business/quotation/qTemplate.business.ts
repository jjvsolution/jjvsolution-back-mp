import { Injectable } from '@nestjs/common';
import { GenetarePdfBusiness } from '../generic/generate-pdf.business';
import { ResponseClass } from 'common/config';

@Injectable()
export class QTemplateBusiness extends ResponseClass {
  constructor(private readonly genetarePdfBusiness: GenetarePdfBusiness) {
    super();
  }
  public async getTemplate() {
    return this.genetarePdfBusiness.getTemplate('test', {});
  }
}
