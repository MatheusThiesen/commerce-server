import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from '../../common/decorators';
import { TimeoutInterceptor } from '../../interceptors/timeout.interceptors';
import { QueryProducts } from './dto/query-products.type';
import { ProductsService } from './products.service';
import { GenerateCatalog } from './useCases/GenerateCatalog';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly generateCatalog: GenerateCatalog,
  ) {}

  @Get()
  findAll(
    @GetCurrentUserId() userId: string,
    @Query()
    {
      page = '0',
      pagesize = '10',
      orderby,
      filters,
      distinct,
      isReport,
    }: QueryProducts,
  ) {
    return this.productsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderBy: orderby,
      filters: filters?.map((f) => JSON.parse(f as string)),
      distinct: distinct,
      userId: userId,
      isReport,
    });
  }

  @Get('filters')
  getFilters(@GetCurrentUserId() userId: string) {
    return this.productsService.getFiltersForFindAll(userId);
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.productsService.findOne(+codigo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Post('import')
  @UseInterceptors(TimeoutInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.import(file);
  }

  @Post('catalog')
  catalog(@Body() { referencesProduct, orderBy, groupProduct, stockLocation }) {
    return this.generateCatalog.execute({
      referencesProduct,
      orderBy,
      groupProduct,
      stockLocation,
    });
  }

  @Post('testAllImages')
  testAllImages() {
    return this.productsService.testImageJob();
  }
}
