import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from 'src/common/decorators';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { CatalogService } from './catalog.service';
import { GenerateCatalog } from './useCases/GenerateCatalog';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly generateCatalog: GenerateCatalog,
  ) {}

  @Post()
  create(
    @Body()
    { referencesProduct, orderBy, groupProduct, stockLocation, filters },
    @GetCurrentUserId() userId: string,
  ) {
    return this.generateCatalog.execute({
      referencesProduct,
      orderBy,
      groupProduct,
      stockLocation,
      userId,
      filters,
    });
  }

  @Public()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query() { page = '0', pagesize = '10', search },
  ) {
    return this.catalogService.findOne({
      id,
      page: +page,
      pagesize: +pagesize,
      search,
    });
  }

  @Public()
  @Patch('/visit/:id')
  update(@Param('id') id: string) {
    return this.catalogService.updateVisit(id);
  }

  @Public()
  @Get('/totalCount/:id')
  findOneTotalCount(@Param('id') id: string, @Query() { search }) {
    return this.catalogService.findOneCount({
      id,
      search,
    });
  }
}
