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
    UID: string,
    quotationId: number,
  ): Promise<ResponseObjectType<string>> {
    const templatehtml = await this.qTemplateRepository.getUserTemplate(UID);
    const replace = await this.getTemplatePlantilla(UID, quotationId);
    console.log('\n\n replace \n', JSON.stringify(replace), '\n\n\n\n');
    //return this.success(JSON.stringify(replace));
    return this.genetarePdfBusiness.getTemplate(
      templatehtml!.key,
      replace.payload!,
    );
  }
  public async getTemplatePlantilla(
    UID: string,
    quotationId: number,
  ): Promise<ResponseObjectType<replaceInterface[]>> {
    const tableFilter = {
      ID: { id: 'id', align: 'right', active: true, title: 'N° artículo' },
      TYPE: { id: 'type', align: 'left', active: true, title: 'type' },
      ITEM_DETAIL: {
        id: 'item_detail',
        align: 'left',
        active: true,
        title: 'Descripción',
      },
      DETAIL: {
        id: 'detail',
        align: 'left',
        active: false,
        title: 'Descripción',
      },
      GLOSS: { id: 'gloss', align: 'left', active: false, title: 'Glosa' },
      CANT: { id: 'cant', align: 'right', active: true, title: 'cant' },
      PRICE: {
        id: 'price',
        align: 'right',
        active: true,
        title: 'Precio unitario',
      },
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
        item_detail: v.detail,
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
              let align: align = 'center';
              const arrayValue = tableFilterFinal.find(([k]) => k === key);
              value.header.push(
                arrayValue && arrayValue.length > 1 ? arrayValue[1].title : key,
              );
              console.log(arrayValue);
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
              value.rows[inxObj].push(o);
            } else {
              value.rows[inxObj] = [o];
            }
            key === 'PRICE' ? (price += +o) : null;
            key === 'CANT' ? (cant += +o) : null;
            //console.log(key)
          }
          if (+inxObj === it.length - 1) {
            value.header = [...value.header, 'Precio total'];
            value.align = [...value.align, 'right'];
          }
          const total = cant * price;
          value.subtotal += total;
          value.rows[inxObj] = [...value.rows[inxObj], total];
        }
        value.iva = value.subtotal * 0.19;
        value.total = value.subtotal * 1.19;
      }
      ////// TABLE END
    }
    return this.success<replaceInterface[]>(replace) as ResponseObjectType<
      replaceInterface[]
    >;
  }
  async getUserTemplate(UID: string): Promise<ResponseObjectType<string>> {
    const templatehtml = await this.qTemplateRepository.getUserTemplate(UID);
    return this.success(templatehtml?.template || '');
  }
}
