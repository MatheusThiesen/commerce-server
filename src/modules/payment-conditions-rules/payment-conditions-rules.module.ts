import { Module } from '@nestjs/common';
import { PaymentConditionsRulesService } from './payment-conditions-rules.service';
import { PaymentConditionsRulesController } from './payment-conditions-rules.controller';

@Module({
  controllers: [PaymentConditionsRulesController],
  providers: [PaymentConditionsRulesService]
})
export class PaymentConditionsRulesModule {}
