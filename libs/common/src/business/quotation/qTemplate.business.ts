import { Injectable } from '@nestjs/common';
import {
  align,
  GenetarePdfBusiness,
  replaceInterface,
  tableInterface,
} from '../generic/generate-pdf.business';
import { ResponseClass } from 'common/config';
import {
  QQuotationRepository,
  QTemplateRepository,
} from 'common/database/prisma';
import { ResponseObjectType } from '@quotation/applications/graphql/models';

@Injectable()
export class QTemplateBusiness extends ResponseClass {
  constructor(
    private readonly genetarePdfBusiness: GenetarePdfBusiness,
    private readonly qQuotationRepository: QQuotationRepository,
    private readonly qTemplateRepository: QTemplateRepository,
  ) {
    super();
  }
  public async getTemplate(
    UID: number,
    quotationId: number,
  ): Promise<ResponseObjectType<string>> {
    const replace = await this.getTemplatePlantilla(UID, quotationId);
    //return this.success(JSON.stringify(replace));
    return this.genetarePdfBusiness.getTemplate('TEST2', replace.payload!);
  }
  public async getTemplatePlantilla(
    UID: number,
    quotationId: number,
  ): Promise<ResponseObjectType<replaceInterface[]>> {
    const tableFilter = {
      ID: { id: 'id', align: 'right', active: true },
      TYPE: { id: 'type', align: 'left', active: true },
      DETAIL: { id: 'detail', align: 'left', active: true },
      GLOSS: { id: 'gloss', align: 'left', active: false },
      CANT: { id: 'cant', align: 'right', active: true },
      PRICE: { id: 'price', align: 'right', active: true },
    };
    const tableFilterFinal = Object.entries(tableFilter).filter(
      ([_, v]) => v.active,
    );
    const replace: replaceInterface[] = [
      {
        id: 'TITLE_QUOTATION',
        type: 'string',
        value: 'Cotización',
      },
      {
        id: 'TABLE',
        type: 'table',
        value: {
          header: [],
          rows: [],
          align: [],
          iva: 0,
          subtotal: 0,
          total: 0,
        },
      },
    ];
    const quotation = await this.qQuotationRepository.db.findUnique({
      where: { id: quotationId },
      include: {
        ItemsQuotation: {
          include: {
            prodServ: true,
          },
        },
        clients: {
          include: {
            business: true,
          },
        },
      },
    });
    if (quotation !== null) {
      const ItemsQuotation = quotation.ItemsQuotation;
      quotation.ItemsQuotation = [];
      const createObjectRemplate = (pre: string, obj: object) => {
        for (let [key, o] of Object.entries(obj)) {
          o = o || '';
          if (typeof o === 'object') {
            createObjectRemplate(key, o);
          } else {
            replace.push({
              id: `${pre}_${key}`.toUpperCase(),
              type: typeof o,
              value: o,
            });
          }
        }
      };
      createObjectRemplate('QUOTATION', quotation);

      ////// TABLE INIT
      const it = ItemsQuotation.map((v) => ({
        ...v,
        ...v.prodServ,
        prodServ: undefined,
      })).map((item) =>
        Object.fromEntries(
          tableFilterFinal.map(([upperKey, config]) => [
            upperKey,
            item[config.id],
          ]),
        ),
      );
      const tableIndex = replace.findIndex((r) => r.id === 'TABLE');
      if (tableIndex >= 0) {
        const table = replace[tableIndex];
        const value = table.value as tableInterface;
        for (const inxObj in it) {
          let price = 0;
          let cant = 0;
          for (let [key, o] of Object.entries(it[inxObj])) {
            if (+inxObj === 0) {
              value.header.push(key);
              let align: align = 'center';
              const arrayValue = tableFilterFinal.find(([k]) => k === key);
              if (Array.isArray(arrayValue)) {
                align = arrayValue[1].align as align;
              } else {
                o = o || '';
                switch (typeof o) {
                  case 'number':
                  case 'bigint':
                    align = 'right';
                    break;
                  case 'string':
                  case 'undefined':
                  case 'object':
                  case 'function':
                    align = 'left';
                    break;
                }
              }
              value.align.push(align);
            }
            if (Array.isArray(value.rows[inxObj])) {
              value.rows[inxObj].push(`${o}`);
            } else {
              value.rows[inxObj] = [`${o}`];
            }
            key === 'PRICE' ? (price += +o) : null;
            key === 'CANT' ? (cant += +o) : null;
            //console.log(key)
          }
          if (+inxObj === it.length - 1) {
            value.header = [...value.header, 'TOTAL'];
          }
          const total = cant * price;
          value.subtotal += total;
          value.rows[inxObj] = [...value.rows[inxObj], `${total}`];
        }
        value.iva = value.subtotal * 0.19;
        value.total = value.subtotal * 1.19;
      }
      ////// TABLE END
    }
    return this.success<replaceInterface[]>(replace) as ResponseObjectType<replaceInterface[]>;
  }
  async getUserTemplate(usersId: number) {
    let templatehtml = '';
    const template = await this.qTemplateRepository.db.findFirst({
      select: { template: true },
      where: { usersId: 1, isPrincipal: true },
    });
    if (template) {
      templatehtml = template.template;
    } else {
      const lastTemplate = await this.qTemplateRepository.db.findFirst({
        select: { template: true },
        where: { usersId: 1 },
        orderBy: {
          id: 'desc',
        },
      });
      if (lastTemplate) {
        templatehtml = lastTemplate.template;
      }
    }
    return this.success(templatehtml);
  }
}
