import { Module } from '@nestjs/common';
import { BillingLocationsController } from './billing-locations.controller';
import { BillingLocationsService } from './billing-locations.service';

@Module({
  controllers: [BillingLocationsController],
  providers: [BillingLocationsService],
})
export class BillingLocationsModule {}
