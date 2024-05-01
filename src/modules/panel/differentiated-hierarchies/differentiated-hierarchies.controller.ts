import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { PanelDifferentiatedHierarchiesService } from './differentiated-hierarchies.service';
import { DifferentiatedHierarchy } from './entities/differentiated-hierarchies.entity';

@Controller('/panel/differentiated-hierarchies')
export class PanelDifferentiatedHierarchiesController {
  constructor(
    private readonly panelDifferentiatedHierarchiesService: PanelDifferentiatedHierarchiesService,
  ) {}

  @Put(':codigo')
  update(
    @Param('codigo') codigo: string,
    @Body() dto: DifferentiatedHierarchy,
  ) {
    return this.panelDifferentiatedHierarchiesService.update(codigo, dto);
  }

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', search = '', orderby },
  ) {
    return this.panelDifferentiatedHierarchiesService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      search: search,
      orderby: orderby,
    });
  }
}
