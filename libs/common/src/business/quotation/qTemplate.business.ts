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
      { id: 'TABLE', type: 'table', value: { header: ['CANTIDAD', 'DESCRIPCIÓN', 'VALOR UNITARIO', 'IVA', 'Total'], rows: [['1', 'Producto 1', '100', '19', '119'],['1', 'Producto 1', '100', '19', '119'],['1', 'Producto 1', '100', '19', '119']], align: ['right', 'left', 'right', 'right', 'right'] } },
      { id: 'TABLE_SUBTOTAL', type: 'string', value: '357' },
      { id: 'TABLE_IVA', type: 'string', value: '68' },
      { id: 'TABLE_TOTAL', type: 'string', value: '425' },
      { id: 'EXTRA_TITLE', type: 'string', value: 'Cotización' },
      { id: 'BUSINESS_NAME', type: 'string', value: 'Empresa Juan' },
      { id: 'BUSINESS_BUSINESSNAME', type: 'string', value: 'Empresa S.A' },
      { id: 'BUSINESS_RUT', type: 'string', value: '11.111.111-1' },
      { id: 'BUSINESS_ADDRESS', type: 'string', value: 'Alameda 3000, Santiago' },
      { id: 'BUSINESS_EMAILS', type: 'string', value: 'correo@mail.com' },
      { id: 'BUSINESS_EMAILADDITIONALS', type: 'array_string', value: ['correo1@mail.com', 'correo2@mail.com'] },
      { id: 'CLIENT_NAME', type: 'string', value: 'Cliente Carlos' },
      { id: 'CLIENT_BUSINESSNAME', type: 'string', value: 'Empresa Cliente S.A' },
      { id: 'CLIENT_RUT', type: 'string', value: '22.222.222-2' },
      { id: 'CLIENT_ADDRESS', type: 'string', value: 'Providencia 3000, Santiago' },
      { id: 'CLIENT_EMAILS', type: 'string', value: 'correo.cliente@mail.com' },
      { id: 'CLIENT_EMAILADDITIONALS', type: 'array_string', value: ['correo.cliente1@mail.com', 'correo.cliente2@mail.com'] },
  ];
    return this.genetarePdfBusiness.getTemplate('TEST1', replace);
  }
}
