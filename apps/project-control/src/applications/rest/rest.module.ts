import { Module } from '@nestjs/common';
import { AccessControlPrismaModule } from '@database/prisma';
import { AccessControlBusinessModule, ProjectControlBusinessModule } from '@business';
import { TokenService } from 'common/services';

@Module({
  imports: [
    ProjectControlBusinessModule,
    AccessControlPrismaModule,
    AccessControlBusinessModule,
  ],
  controllers: [],
  providers: [TokenService],
})
export class RestModule {}
