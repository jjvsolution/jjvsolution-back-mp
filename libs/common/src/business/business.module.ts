import { Module, Provider } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from '@database/prisma';
import { AuthService } from '@services';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { jwtFactory } from 'common/config';

const businessExport: Provider[] = [AuthService];

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    /* JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtFactory,
    }), */
  ],
  providers: [...businessExport, JwtService],
  exports: businessExport,
})
export class BusinessModule {}
