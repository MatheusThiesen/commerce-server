import { AgroupGridProduct } from '@/modules/app/products/useCases/AgroupGridProduct';
import { CacheListProductsFilters } from '@/modules/app/products/useCases/CacheListProductsFilters';
import { ListingRule } from '@/modules/app/products/useCases/ListingRule';
import { TurnStock } from '@/modules/app/products/useCases/TurnStock';
import { FilterOrderNormalized } from '@/modules/app/products/useCases/filterOrderNormalized';
import { Global, Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Global()
@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    AgroupGridProduct,
    ListingRule,
    FilterOrderNormalized,
    CacheListProductsFilters,
    TurnStock,
  ],
})
export class PanelProductsModule {}
