//import { CONSTANTS } from '@config/constants/constants.enum';
//import { DateFunctions } from '@utils';

export class ExternalServiceError extends Error {
  /* data: string;
  constructor(
    public code: string,
    public type: string = CONSTANTS.EXTERNAL_API_ERROR,
    data: object = {},
    public creationTime: string = DateFunctions.getNowWithTimeZone(),
  ) {
    super(type);
    this.data = JSON.stringify(data);
  }
  toString(): string {
    return JSON.stringify(this);
  } */
}
