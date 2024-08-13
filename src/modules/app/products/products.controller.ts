import {
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
import { GetCurrentUserId } from '../../../common/decorators';
import { TimeoutInterceptor } from '../../../interceptors/timeout.interceptors';
import { QueryProducts } from './dto/query-products.type';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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
      isReport = 0,
      search,
    }: QueryProducts,
  ) {
    return this.productsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderBy: orderby,
      filters: filters,
      distinct: distinct as 'codigoAlternativo' | 'referencia',
      userId: userId,
      isReport: isReport,
      search,
    });
  }

  @Get('filters')
  getFilters(@GetCurrentUserId() userId: string, @Query() { filters = [] }) {
    return this.productsService.getFiltersForFindAll(userId, filters);
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string, @Query() { clientCod }) {
    return this.productsService.findOne(+codigo, clientCod);
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
}
