import { Module } from '@nestjs/common';
import { AccessControlController } from './access-control.controller';
import { AccessControlService } from './access-control.service';
import { RestModule } from './applications/rest/rest.module';
import { TokenService } from 'common/services';

@Module({
  imports: [RestModule],
  controllers: [AccessControlController],
  providers: [AccessControlService],
})
export class AccessControlModule {}
