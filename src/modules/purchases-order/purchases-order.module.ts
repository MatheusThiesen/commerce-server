import { Module } from '@nestjs/common';
import { PurchasesOrderService } from './purchases-order.service';
import { PurchasesOrderController } from './purchases-order.controller';

@Module({
  controllers: [PurchasesOrderController],
  providers: [PurchasesOrderService]
})
export class PurchasesOrderModule {}
