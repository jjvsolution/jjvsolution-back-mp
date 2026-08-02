import { Controller, Get } from '@nestjs/common';
import { ProjectControlService } from './project-control.service';

@Controller()
export class ProjectControlController {
  constructor(private readonly projectControlService: ProjectControlService) {}

  @Get()
  getHello(): string {
    return this.projectControlService.getHello();
  }
}
