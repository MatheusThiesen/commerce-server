import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PanelBannersService } from './banners.service';
import { Banner } from './entities/banners.entity';

@Controller('/panel/banners')
export class PanelBannersController {
  constructor(private readonly panelBannersService: PanelBannersService) {}

  @Post()
  create(@Body() dto: Banner) {
    return this.panelBannersService.create(dto);
  }

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', search = '', orderby },
  ) {
    return this.panelBannersService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      search: search,
      orderby: orderby,
    });
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.panelBannersService.findOne(codigo);
  }

  @Put(':codigo')
  update(@Param('codigo') codigo: string, @Body() dto: Banner) {
    return this.panelBannersService.update(codigo, dto);
  }

  @Patch('/click/:codigo')
  click(@Param('codigo') codigo: string) {
    return this.panelBannersService.click(codigo);
  }
}
