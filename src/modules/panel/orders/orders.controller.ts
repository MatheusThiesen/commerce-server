import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PanelOrdersService } from './orders.service';

@Controller('/panel/orders')
export class PanelOrdersController {
  constructor(private readonly ordersService: PanelOrdersService) {}

  @Get('analytic')
  analytic(
    @Query()
    { periodo },
  ) {
    return this.ordersService.analytic(periodo);
  }

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', orderby, search, isDifferentiated, status },
  ) {
    return this.ordersService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderby: orderby,
      search: search,
      isDifferentiated,
      status,
    });
  }

  @Post('resend/:codigo')
  resend(@Param('codigo') codigo: string) {
    return this.ordersService.resend(+codigo);
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.ordersService.findOne(+codigo);
  }
}
