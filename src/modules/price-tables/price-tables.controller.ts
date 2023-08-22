import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PriceTablesService } from './price-tables.service';

@Controller('price-tables')
export class PriceTablesController {
  constructor(private readonly priceTablesService: PriceTablesService) {}

  @Get()
  findAll() {
    return this.priceTablesService.findAll();
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.priceTablesService.import(file);
  }
}
