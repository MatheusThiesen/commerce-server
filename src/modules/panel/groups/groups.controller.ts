import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { Group } from './entities/group.entity';
import { PanelGroupsService } from './groups.service';

@Controller('/panel/groups')
export class PanelGroupsController {
  constructor(private readonly panelGroupsService: PanelGroupsService) {}

  @Put(':codigo')
  update(@Param('codigo') codigo: string, @Body() dto: Group) {
    return this.panelGroupsService.update(+codigo, dto);
  }

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', search = '', orderby },
  ) {
    return this.panelGroupsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      search: search,
      orderby: orderby,
    });
  }
}
