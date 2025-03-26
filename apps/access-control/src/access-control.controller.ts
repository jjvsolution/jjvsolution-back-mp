import { Controller, Get } from '@nestjs/common';
import { AccessControlService } from './access-control.service';

@Controller()
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Get()
  getHello(): string {
    return this.accessControlService.getHello();
  }
}
