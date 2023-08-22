import { Module } from '@nestjs/common';
import { PaymentConditionsController } from './payment-conditions.controller';
import { PaymentConditionsService } from './payment-conditions.service';
import { ShowPaymentConditionToOrder } from './useCases/ShowPaymentConditionToOrder';

@Module({
  controllers: [PaymentConditionsController],
  providers: [PaymentConditionsService, ShowPaymentConditionToOrder],
})
export class PaymentConditionsModule {}
