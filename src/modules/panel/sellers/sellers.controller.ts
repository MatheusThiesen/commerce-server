import { Controller, Get, Param, Query } from '@nestjs/common';
import { PanelSellersService } from './sellers.service';

@Controller('/panel/sellers')
export class PanelSellersController {
  constructor(private readonly sellerService: PanelSellersService) {}

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', orderby, search },
  ) {
    return this.sellerService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderby,
      search,
    });
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.sellerService.findOne(+codigo);
  }
}
