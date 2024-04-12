import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SendOrderErpApiConsumer } from 'src/jobs/SendOrderErpApi/sendOrderErpApi-consumer';
import { SendOrderErpApiProducerService } from 'src/jobs/SendOrderErpApi/sendOrderErpApi-producer-service';
import { GetPendencyBySellerCod } from '../differentiated/useCases/GetPendencyBySellerCod';
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
  ],
})
export class OrderModule {}
