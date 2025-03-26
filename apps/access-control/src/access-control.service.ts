import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessControlService {
  getHello(): string {
    return 'Hello World!';
  }
}
