import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductImagensService } from './product-imagens.service';

@Controller('product-imagens')
export class ProductImagensController {
  constructor(private readonly productImagensService: ProductImagensService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.productImagensService.import(file);
  }
}
