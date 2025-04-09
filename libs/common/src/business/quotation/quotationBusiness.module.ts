import { Module, Provider } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from '@services';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsInterface } from '@interfaces';
import { PassportModule } from '@nestjs/passport';
import { QuotationPrismaModule } from '@database/prisma';
import { jwtFactory } from 'common/config';
import { QQuotationBusiness } from './qQuotation.business';
import { GenetarePdfBusiness } from '../generic/generate-pdf.business';
import { QTemplateBusiness } from './qTemplate.business';

const businessExport: Provider[] = [
  AuthService,
  QQuotationBusiness,
  QTemplateBusiness,
];

@Module({
  imports: [
    QuotationPrismaModule,
    PassportModule,
    /* JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: jwtFactory,
    }), */
  ],
  providers: [GenetarePdfBusiness, ...businessExport, JwtService],
  exports: businessExport,
})
export class QuotationBusinessModule {}
