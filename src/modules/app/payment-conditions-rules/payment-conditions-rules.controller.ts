import { Public } from '@/common/decorators';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentConditionsRulesService } from './payment-conditions-rules.service';

@Controller('payment-conditions-rules')
export class PaymentConditionsRulesController {
  constructor(
    private readonly paymentConditionsRulesService: PaymentConditionsRulesService,
  ) {}

  @Public()
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.paymentConditionsRulesService.import(file);
  }
}
