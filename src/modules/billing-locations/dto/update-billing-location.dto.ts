import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingLocationDto } from './create-billing-location.dto';

export class UpdateBillingLocationDto extends PartialType(
  CreateBillingLocationDto,
) {}
