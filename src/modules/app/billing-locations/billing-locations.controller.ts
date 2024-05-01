import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BillingLocationsService } from './billing-locations.service';

@Controller('billing-locations')
export class BillingLocationsController {
  constructor(
    private readonly billingLocationsService: BillingLocationsService,
  ) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.billingLocationsService.import(file);
  }
}
