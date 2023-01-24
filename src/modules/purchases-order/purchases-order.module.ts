import { Module } from '@nestjs/common';
import { UpdateStockFuture } from '../stock/useCases/updateStockFuture';
import { PurchasesOrderController } from './purchases-order.controller';
import { PurchasesOrderService } from './purchases-order.service';

@Module({
  controllers: [PurchasesOrderController],
  providers: [PurchasesOrderService, UpdateStockFuture],
})
export class PurchasesOrderModule {}
