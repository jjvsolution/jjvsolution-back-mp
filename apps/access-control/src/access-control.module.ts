import { Module } from '@nestjs/common';
import { AccessControlController } from './access-control.controller';
import { AccessControlService } from './access-control.service';

@Module({
  imports: [],
  controllers: [AccessControlController],
  providers: [AccessControlService],
})
export class AccessControlModule {}
