import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators';
import { PaymentConditionsService } from './payment-conditions.service';
import { ShowPaymentConditionToOrder } from './useCases/ShowPaymentConditionToOrder';

@Controller('payment-conditions')
export class PaymentConditionsController {
  constructor(
    private readonly paymentConditionsService: PaymentConditionsService,
    private readonly showPaymentConditionToOrder: ShowPaymentConditionToOrder,
  ) {}

  @Public()
  @Post('list-to-order')
  show(
    @Body()
    {
      clientCod,
      stockLocationPeriod,
      brandCod,
      priceListCod,
      totalAmount,
      isDifferentiated,
    },
  ) {
    return this.showPaymentConditionToOrder.execute({
      clientCod,
      stockLocationPeriod,
      brandCod,
      priceListCod,
      totalAmount,
      isDifferentiated,
    });
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.paymentConditionsService.import(file);
  }
}
