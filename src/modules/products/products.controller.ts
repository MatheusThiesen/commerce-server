import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from '../../common/decorators';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProducts } from './dto/query-products.type';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { GenerateCatalog } from './useCases/GenerateCatalog';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly generateCatalog: GenerateCatalog,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @GetCurrentUserId() userId: string,
    @Query() { page = '0', pagesize = '10', orderby, filters }: QueryProducts,
  ) {
    return this.productsService.findAll(
      Number(page),
      Number(pagesize),
      orderby,
      filters?.map((f) => JSON.parse(f as string)),
      userId,
    );
  }

  @Get('filters')
  getFilters(@GetCurrentUserId() userId: string) {
    return this.productsService.getFiltersForFindAll(userId);
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.productsService.findOne(+codigo);
  }

  @Put(':codigo')
  update(
    @Param('codigo') codigo: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(+codigo, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.productsService.import(file);
  }

  @Post('catalog')
  catalog(@Body() { codProducts, orderBy }) {
    return this.generateCatalog.execute({
      codProducts,
      orderBy,
    });
  }
}
