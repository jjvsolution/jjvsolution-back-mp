import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentPortalService {
  getHello(): string {
    return 'Hello World!';
  }
}
