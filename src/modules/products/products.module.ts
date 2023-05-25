import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CreateManyProductsConsumer } from '../../jobs/CreateManyProducts/createManyProducts-consumer';
import { CreateManyProductsProducerService } from '../../jobs/CreateManyProducts/createManyProducts-producer-service';
import { TestImageProductConsumer } from '../../jobs/TestImageProduct/testImageProduct-consumer';
import { TestImageProductProducerService } from '../../jobs/TestImageProduct/testImageProduct-producer-service';
import { UpdateCacheProductsFiltersConsumer } from '../../jobs/UpdateCacheProductsFilters/updateCacheProductsFilters-consumer';
import { UpdateCacheProductsFiltersProducerService } from '../../jobs/UpdateCacheProductsFilters/updateCacheProductsFilters-producer-service';
import { SearchFilter } from '../../utils/SearchFilter.utils';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AgroupGridProduct } from './useCases/AgroupGridProduct';
import { CacheListProductsFilters } from './useCases/CacheListProductsFilters';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { ListingRule } from './useCases/ListingRule';
import { TurnStock } from './useCases/TurnStock';
import { VariationsProduct } from './useCases/VariationsProduct';
import { FilterOrderNormalized } from './useCases/filterOrderNormalized';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'testImageProduct-queue',
    }),
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
    ListProductsFilters,
    SearchFilter,
    VariationsProduct,
    TestImageProductProducerService,
    TestImageProductConsumer,
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
