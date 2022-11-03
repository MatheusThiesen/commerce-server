import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { GenerateCatalog } from './useCases/GenerateCatalog';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { VariationsProduct } from './useCases/VariationsProduct';

@Module({
  imports: [HttpModule],
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
