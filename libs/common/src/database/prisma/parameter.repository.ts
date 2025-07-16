import { Injectable } from '@nestjs/common';
import { Prisma } from '@database/prisma';
import { $Enums } from '@prisma/client';

@Injectable()
export class ParameterRepository {
  constructor(private prisma: Prisma) {}

  get db() {
    return this.prisma.parameter;
  }
  get TypeParameter() {
    return $Enums.TypeParameter;
  }
  parseTo<T>(description: string, type: $Enums.TypeParameter): T {
    const parseToFunctions = {
      [this.TypeParameter.STRING]: (value: string) => value,
      [this.TypeParameter.NUMBER]: (value: string) => Number(value).valueOf(),
      [this.TypeParameter.DATE]: (value: string) => new Date(value),
      [this.TypeParameter.BOOLEAN]: (value: string) => value === 'true',
      [this.TypeParameter.OBJECT]: (value: string) => JSON.parse(value),
      [this.TypeParameter.ARRAY]: (value: string) => value,
    };

    return parseToFunctions[type](description);
  }
  async getByGroup(group: string) {
    const parameters = await this.db.findMany({ where: { group } });
    return parameters.reduce((object, parameter) => {
      object[parameter.name] = this.parseTo(parameter.value, parameter.type);
      return object;
    }, {});
  }
  async getByIdParameter<T>(idParameter: string): Promise<T> {
    const parameter = await this.db.findUnique({ where: { idParameter } });
    return parameter ? this.parseTo<T>(parameter?.value, parameter.type) : '' as T;
  }
  async getParameters(
    parameters: {
      idParameters: string;
      replace?: { [key: string]: string };
    }[],
  ): Promise<any[]> {
    const idPIn = parameters.map((p) => p.idParameters);
    const parametersDB = await this.db.findMany({
      where: {
        idParameter: { in: idPIn },
      },
    });
    const listReturn: any[] = [];
    for (const p of parameters) {
      const pInd = parametersDB.findIndex(
        (pb) => pb.idParameter === p.idParameters,
      );
      let desc = parametersDB[pInd].value;
      if (p?.replace) {
        for (const r in p.replace) {
          desc = desc.replace('${' + r + '}', p.replace[r]);
        }
      }
      listReturn.push(this.parseTo(desc, parametersDB[pInd].type));
    }
    return listReturn;
  }
}
