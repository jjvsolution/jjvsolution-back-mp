import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ResponseClass } from '..';

@Injectable()
export class ValidationPipe
  extends ResponseClass
  implements PipeTransform<any>
{
  constructor() {
    super();
  }
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const dataError = errors.map((e) => ({
        propiedad: e.property,
        error: Object.keys(e?.constraints || {})[0],
      }));
      return this.badRequest(dataError);
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: (() => any)[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
