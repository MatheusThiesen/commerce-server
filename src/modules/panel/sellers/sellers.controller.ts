import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PanelSellersService } from './sellers.service';

@Controller('/panel/sellers')
export class PanelSellersController {
  constructor(private readonly sellerService: PanelSellersService) {}

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', orderby, search, filters },
  ) {
    return this.sellerService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderby,
      search,
      filters,
    });
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.sellerService.findOne(+codigo);
  }

  @Get('/blocks/:codigo')
  blocks(@Param('codigo') codigo: string) {
    return this.sellerService.blocks(+codigo);
  }

  @Post('/blocks/:codigo')
  blockSet(
    @Param('codigo') codigo: string,

    @Body()
    { stocksLocation = [], groups = [] },
  ) {
    return this.sellerService.blockSet({
      sellerCode: +codigo,
      blocks: {
        stocksLocation,
        groups,
      },
    });
  }
}
