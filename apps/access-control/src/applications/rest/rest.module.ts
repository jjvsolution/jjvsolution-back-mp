import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AccessControlPrismaModule } from 'common/database/prisma';
import { TokenService } from 'common/services';
import { AccessControlBusinessModule } from 'common/business/access-control';

@Module({
  imports: [AccessControlPrismaModule, AccessControlBusinessModule],
  controllers: [AuthController],
  providers: [TokenService],
})
export class RestModule {}
