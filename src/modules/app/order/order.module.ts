import { SendOrderErpApiConsumer } from '@/jobs/SendOrderErpApi/sendOrderErpApi-consumer';
import { SendOrderErpApiProducerService } from '@/jobs/SendOrderErpApi/sendOrderErpApi-producer-service';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { GetPendencyBySellerCod } from '../differentiated/useCases/GetPendencyBySellerCod';
import { GetRoleBySeller } from '../differentiated/useCases/GetRoleBySeller';
import { ProductsService } from '../products/products.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AddTagDifferentiatedRequestOrderApiErp } from './useCases/AddTagDifferentiatedRequestOrderApiErp';
import { RequestOrderApiErp } from './useCases/RequestOrderApiErp';
import { RoutineSendAllOrdersApiErp } from './useCases/RoutineSendAllOrdersApiErp';
import { SketchOrderValid } from './useCases/SketchOrderValid';
import { TransformOrderToSendApiErp } from './useCases/TransformOrderToSendApiErp';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'sendOrderErpApi-queue',
    }),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    SendOrderErpApiConsumer,
    SendOrderErpApiProducerService,
    RequestOrderApiErp,
    TransformOrderToSendApiErp,
    RoutineSendAllOrdersApiErp,
    AddTagDifferentiatedRequestOrderApiErp,
    SketchOrderValid,
    ProductsService,
    GetPendencyBySellerCod,
    GetRoleBySeller,
  ],
  exports: [
    OrderService,
    SendOrderErpApiConsumer,
    SendOrderErpApiProducerService,
    RequestOrderApiErp,
    TransformOrderToSendApiErp,
    RoutineSendAllOrdersApiErp,
    AddTagDifferentiatedRequestOrderApiErp,
    SketchOrderValid,
    ProductsService,
    GetPendencyBySellerCod,
    GetRoleBySeller,
  ],
})
export class OrderModule {}
