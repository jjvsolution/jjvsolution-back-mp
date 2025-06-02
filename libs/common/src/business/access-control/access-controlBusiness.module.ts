import { Module, Provider } from '@nestjs/common';
import { AuthBusiness } from './auth.business';
import { AccessControlPrismaModule } from 'common/database/prisma';
import { AuthService } from 'common/services';
import { JwtService } from '@nestjs/jwt';

const businessExport: Provider[] = [JwtService, AuthService, AuthBusiness];

@Module({
  imports: [AccessControlPrismaModule],
  providers: [...businessExport],
  exports: businessExport,
})
export class AccessControlBusinessModule {}
