import { Module, Provider } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from '@services';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface } from '@interfaces';
import { PassportModule } from '@nestjs/passport';
import { QuotationPrismaModule } from '@prisma';
import { jwtFactory } from 'common/config';

const businessExport: Provider[] = [AuthService];

@Module({
  imports: [
    QuotationPrismaModule,
    PassportModule,
    /* JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtFactory,
    }), */
  ],
  providers: [...businessExport, JwtService],
  exports: businessExport,
})
export class QuotationBusinessModule {}
