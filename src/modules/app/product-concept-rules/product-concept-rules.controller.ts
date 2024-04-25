import { Public } from '@/common/decorators';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductConceptRulesService } from './product-concept-rules.service';

@Controller('product-concept-rules')
export class ProductConceptRulesController {
  constructor(
    private readonly productConceptRulesService: ProductConceptRulesService,
  ) {}

  @Public()
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.productConceptRulesService.import(file);
  }
}
