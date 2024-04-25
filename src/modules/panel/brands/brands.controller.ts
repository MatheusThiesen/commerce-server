import { Public } from '@/common/decorators';
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

  @Public()
  @Put(':codigo')
  update(@Param('codigo') codigo: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.update(+codigo, dto);
  }

  @Public()
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

  @Public()
  @Get(':codigo')
  findOne(@Param('codigo') codigo: string) {
    return this.panelBrandsService.findOne(+codigo);
  }

  @Public()
  @Get('/blocks/:codigo')
  blocks(@Param('codigo') codigo: string) {
    return this.panelBrandsService.blocks(+codigo);
  }

  @Public()
  @Post('/blocks/:codigo')
  createBlock(@Param('codigo') codigo: string, @Body() { uf }) {
    return this.panelBrandsService.blockCreate(+codigo, uf);
  }

  @Public()
  @Delete('/blocks/:codigo')
  delete(@Param('codigo') codigo: string) {
    return this.panelBrandsService.blockRemove(codigo);
  }
}
