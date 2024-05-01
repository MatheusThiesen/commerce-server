import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { CreateManyProductsConsumer } from '../../../jobs/CreateManyProducts/createManyProducts-consumer';
import { CreateManyProductsProducerService } from '../../../jobs/CreateManyProducts/createManyProducts-producer-service';
import { UpdateCacheProductsFiltersConsumer } from '../../../jobs/UpdateCacheProductsFilters/updateCacheProductsFilters-consumer';
import { UpdateCacheProductsFiltersProducerService } from '../../../jobs/UpdateCacheProductsFilters/updateCacheProductsFilters-producer-service';
import { SearchFilter } from '../../../utils/SearchFilter.utils';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AgroupGridProduct } from './useCases/AgroupGridProduct';
import { CacheListProductsFilters } from './useCases/CacheListProductsFilters';
import { FetchProducts } from './useCases/FetchProducts';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { ListingRule } from './useCases/ListingRule';
import { TurnStock } from './useCases/TurnStock';
import { VariationsProduct } from './useCases/VariationsProduct';
import { FilterOrderNormalized } from './useCases/filterOrderNormalized';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'createManyProducts-queue',
    }),
    BullModule.registerQueue({
      name: 'updateCacheProductsFilters-queue',
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    FetchProducts,
    ListProductsFilters,
    SearchFilter,
    VariationsProduct,
    CreateManyProductsConsumer,
    CreateManyProductsProducerService,
    UpdateCacheProductsFiltersConsumer,
    UpdateCacheProductsFiltersProducerService,
    AgroupGridProduct,
    ListingRule,
    FilterOrderNormalized,
    CacheListProductsFilters,
    TurnStock,
  ],
  exports: [
    ProductsService,
    FetchProducts,
    ListProductsFilters,
    SearchFilter,
    VariationsProduct,
    CreateManyProductsConsumer,
    CreateManyProductsProducerService,
    UpdateCacheProductsFiltersConsumer,
    UpdateCacheProductsFiltersProducerService,
    AgroupGridProduct,
    ListingRule,
    FilterOrderNormalized,
    CacheListProductsFilters,
    TurnStock,
  ],
})
export class ProductsModule {}
