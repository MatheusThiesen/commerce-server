import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { DifferentiatedController } from './differentiated.controller';
import { ApprovalDifferentiated } from './useCases/ApprovalDifferentiated';
import { GetDiscountScopeByUserId } from './useCases/GetDiscountScopeByUserId';
import { GetPendencyBySellerCod } from './useCases/GetPendencyBySellerCod';
import { ReprovalDifferentiated } from './useCases/ReprovalDifferentiated';

@Module({
  imports: [OrderModule],
  controllers: [DifferentiatedController],
  providers: [
    OrderService,
    ApprovalDifferentiated,
    ReprovalDifferentiated,
    GetPendencyBySellerCod,
    GetDiscountScopeByUserId,
  ],
})
export class DifferentiatedModule {}
