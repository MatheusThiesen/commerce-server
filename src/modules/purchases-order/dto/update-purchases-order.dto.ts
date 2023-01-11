import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchasesOrderDto } from './create-purchases-order.dto';

export class UpdatePurchasesOrderDto extends PartialType(CreatePurchasesOrderDto) {}
