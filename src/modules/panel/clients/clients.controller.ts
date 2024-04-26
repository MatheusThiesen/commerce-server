import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PanelClientsService } from './clients.service';

@Controller('/panel/clients')
export class PanelClientsController {
  constructor(private readonly clientsService: PanelClientsService) {}

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', search = '', orderby },
  ) {
    return this.clientsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      search: search,
      orderby: orderby,
    });
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.clientsService.findOne(+codigo);
  }

  @Get('/blocks/:codigo')
  blocks(@Param('codigo') codigo: string) {
    return this.clientsService.blocks(+codigo);
  }

  @Post('/blocks/:codigo')
  blockSet(
    @Param('codigo') codigo: string,

    @Body()
    { stocksLocation = [], groups = [], brands = [] },
  ) {
    return this.clientsService.blockSet({
      clientCode: +codigo,
      blocks: {
        stocksLocation,
        groups,
        brands,
      },
    });
  }
}
