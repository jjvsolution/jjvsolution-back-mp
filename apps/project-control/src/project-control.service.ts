import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectControlService {
  getHello(): string {
    return 'Proyexa API ready';
  }
}
