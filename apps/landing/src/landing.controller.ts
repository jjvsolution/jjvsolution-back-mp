import { Controller, Get } from '@nestjs/common';
import { LandingService } from './landing.service';

@Controller()
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get()
  getHello(): string {
    return this.landingService.getHello();
  }
}
