import { Controller, Get, Param, Query } from '@nestjs/common';

import { ProductsService } from './products.service';

@Controller('/panel/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query()
    {
      page = '0',
      pagesize = '10',
      orderby,
      search,

      isImage,
      isSale,
    },
  ) {
    return this.productsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderby,
      search,
      isImage,
      isSale,
    });
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.productsService.findOne(+codigo);
  }
}
