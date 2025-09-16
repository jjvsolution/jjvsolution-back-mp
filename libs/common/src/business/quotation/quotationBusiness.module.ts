import { Module, Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@services';
import { PassportModule } from '@nestjs/passport';
import {
  AccessControlPrismaModule,
  QuotationPrismaModule,
} from '@database/prisma';
import { QQuotationBusiness } from './qQuotation.business';
import { GenetarePdfBusiness } from '../generic/generate-pdf.business';
import { QTemplateBusiness } from './qTemplate.business';
import { QReportBusiness } from './qReport.business';

const businessExport: Provider[] = [
  AuthService,
  QQuotationBusiness,
  QReportBusiness,
  QTemplateBusiness,
];

@Module({
  imports: [QuotationPrismaModule, AccessControlPrismaModule, PassportModule],
  providers: [GenetarePdfBusiness, ...businessExport, JwtService],
  exports: businessExport,
})
export class QuotationBusinessModule {}
