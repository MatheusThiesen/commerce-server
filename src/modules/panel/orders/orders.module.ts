import { OrderModule } from '@/modules/app/order/order.module';
import { Module } from '@nestjs/common';
import { PanelOrdersController } from './orders.controller';
import { PanelOrdersService } from './orders.service';

@Module({
  imports: [OrderModule],
  controllers: [PanelOrdersController],
  providers: [PanelOrdersService],
})
export class PanelOrdersModule {}
