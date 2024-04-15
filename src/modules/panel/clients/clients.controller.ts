import { Public } from '@/common/decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { PanelClientsService } from './clients.service';

@Controller('/panel/clients')
export class PanelClientsController {
  constructor(private readonly clientsService: PanelClientsService) {}

  @Public()
  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10' },
  ) {
    return this.clientsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
    });
  }

  @Public()
  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.clientsService.findOne(+codigo);
  }
}
