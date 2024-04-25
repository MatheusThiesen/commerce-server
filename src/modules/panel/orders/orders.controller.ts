import { Public } from '@/common/decorators';
import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PanelOrdersService } from './orders.service';

@Controller('/panel/orders')
export class PanelOrdersController {
  constructor(private readonly ordersService: PanelOrdersService) {}

  @Public()
  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', orderby, search },
  ) {
    return this.ordersService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderby: orderby,
      search: search,
    });
  }

  @Public()
  @Post('resend/:codigo')
  resend(@Param('codigo') codigo: string) {
    return this.ordersService.resend(+codigo);
  }

  @Public()
  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.ordersService.findOne(+codigo);
  }
}
