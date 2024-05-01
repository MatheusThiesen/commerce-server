import { GetRoleBySeller } from '@/modules/app/differentiated/useCases/GetRoleBySeller';
import { OrderModule } from '@/modules/app/order/order.module';
import { Module } from '@nestjs/common';
import { PanelOrdersController } from './orders.controller';
import { PanelOrdersService } from './orders.service';

@Module({
  imports: [OrderModule],
  controllers: [PanelOrdersController],
  providers: [PanelOrdersService, GetRoleBySeller],
})
export class PanelOrdersModule {}
