import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { GenerateCatalog } from './useCases/GenerateCatalog';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { VariationsProduct } from './useCases/VariationsProduct';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ListProductsFilters,
    ListProductsFilters,
    VariationsProduct,
    GenerateCatalog,
  ],
})
export class ProductsModule {}
