import { Module } from '@nestjs/common';
import { AgroupGridProduct } from '../products/useCases/AgroupGridProduct';
import { ListProductsFilters } from '../products/useCases/ListProductsFilters';
import { ListingRule } from '../products/useCases/ListingRule';
import { VariationsProduct } from '../products/useCases/VariationsProduct';
import { FilterOrderNormalized } from '../products/useCases/filterOrderNormalized';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { GenerateCatalog } from './useCases/GenerateCatalog';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    ListProductsFilters,
    VariationsProduct,
    GenerateCatalog,
    AgroupGridProduct,
    ListingRule,
    FilterOrderNormalized,
  ],
})
export class CatalogModule {}
