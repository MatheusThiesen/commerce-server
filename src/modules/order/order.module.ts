import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SendOrderErpApiConsumer } from 'src/jobs/SendOrderErpApi/sendOrderErpApi-consumer';
import { SendOrderErpApiProducerService } from 'src/jobs/SendOrderErpApi/sendOrderErpApi-producer-service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { RequestOrderApiErp } from './useCases/RequestOrderApiErp';
import { RoutineSendAllOrdersApiErp } from './useCases/RoutineSendAllOrdersApiErp';
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
  ],
})
export class OrderModule {}
