import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from './../../../common/decorators/public.decorator';

import { ProductsService } from './products.service';

@Controller('/panel/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10' },
  ) {
    return this.productsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
    });
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.productsService.findOne(+codigo);
  }
}
