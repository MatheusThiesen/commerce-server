import { Module } from '@nestjs/common';
import { PaymentConditionsRulesController } from './payment-conditions-rules.controller';
import { PaymentConditionsRulesService } from './payment-conditions-rules.service';

@Module({
  controllers: [PaymentConditionsRulesController],
  providers: [PaymentConditionsRulesService],
})
export class PaymentConditionsRulesModule {}
