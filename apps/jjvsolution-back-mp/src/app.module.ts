import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessControlModule } from '@access-control/access-control.module';
import { AdminModule } from '@admin/admin.module';
import { LandingModule } from '@landing/landing.module';
import { QuotationModule } from '@quotation/quotation.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    AccessControlModule,
    AdminModule,
    LandingModule,
    QuotationModule,
    RouterModule.register([
      { path: 'access-control', module: AccessControlModule },
      { path: 'admin', module: AdminModule },
      { path: 'landing', module: LandingModule },
      { path: 'quotation', module: QuotationModule },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
