import { BrandsService } from '@/modules/app/brands/brands.service';
import { UpdateBrandDto } from '@/modules/app/brands/dto/update-brand.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PanelBrandsService } from './brands.service';

@Controller('/panel/brands')
export class PanelBrandsController {
  constructor(
    private readonly panelBrandsService: PanelBrandsService,
    private readonly brandsService: BrandsService,
  ) {}

  @Put(':codigo')
  update(@Param('codigo') codigo: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(+codigo, dto);
  }

  @Get()
  findAll(
    @Query()
    { page = '0', pagesize = '10', search = '', orderby },
  ) {
    return this.panelBrandsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      search: search,
      orderby: orderby,
    });
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.panelBrandsService.findOne(+codigo);
  }

  @Get('/blocks/:codigo')
  blocks(@Param('codigo') codigo: string) {
    return this.panelBrandsService.blocks(+codigo);
  }

  @Post('/blocks/:codigo')
  createBlock(@Param('codigo') codigo: string, @Body() { uf }) {
    return this.panelBrandsService.blockCreate(+codigo, uf);
  }

  @Delete('/blocks/:codigo')
  delete(@Param('codigo') codigo: string) {
    return this.panelBrandsService.blockRemove(codigo);
  }
}
