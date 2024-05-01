import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentConditionsRuleDto } from './create-payment-conditions-rule.dto';

export class UpdatePaymentConditionsRuleDto extends PartialType(
  CreatePaymentConditionsRuleDto,
) {}
