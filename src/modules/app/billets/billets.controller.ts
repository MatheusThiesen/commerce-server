import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BilletsService } from './billets.service';

@Controller('billets')
export class BilletsController {
  constructor(private readonly billetsService: BilletsService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.billetsService.import(file);
  }
}
