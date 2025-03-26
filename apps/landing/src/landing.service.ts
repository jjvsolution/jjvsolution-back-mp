import { Injectable } from '@nestjs/common';

@Injectable()
export class LandingService {
  getHello(): string {
    return 'Hello World!';
  }
}
