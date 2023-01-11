import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PurchasesOrderService } from './purchases-order.service';

@Controller('purchases-order')
export class PurchasesOrderController {
  constructor(private readonly purchasesOrderService: PurchasesOrderService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.purchasesOrderService.import(file);
  }
}
