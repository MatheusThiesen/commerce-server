import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { sendMailProducerService } from '../../jobs/SendMail/sendMail-producer-service';
import { StockLocationsController } from './stock-locations.controller';
import { StockLocationsService } from './stock-locations.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sendMail-queue',
    }),
  ],
  controllers: [StockLocationsController],
  providers: [StockLocationsService, sendMailProducerService],
})
export class StockLocationsModule {}
