import { HttpException } from '@nestjs/common';

export class ExceptionTemplateError extends HttpException {
  private _arg: { key: string; value: string }[];
  constructor(
    private _data: any,
    private arg: { key: string; value: string }[],
    public code: number,
    private description: string = '',
  ) {
    super(HttpException.createBody(_data, description, code), code);
    this._arg = arg;
  }
  getMessageError(template: string) {
    if (Array.isArray(this._arg)) {
      for (const a of this._arg) {
        template = template.replace('${' + a.key + '}', a.value);
      }
    }
    return template;
  }
  toString(): string {
    return JSON.stringify(this);
  }
}
