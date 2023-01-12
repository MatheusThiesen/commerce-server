import { Module } from '@nestjs/common';
import { UpdateStockFuture } from '../stock/useCases/updateStockFuture';
import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService, UpdateStockFuture],
})
export class OrderItemsModule {}
