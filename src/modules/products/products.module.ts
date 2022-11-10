import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TestImageProductConsumer } from '../../jobs/TestImageProduct/testImageProduct-consumer';
import { TestImageProductProducerService } from '../../jobs/TestImageProduct/testImageProduct-producer-service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AgroupGridProduct } from './useCases/AgroupGridProduct';
import { GenerateCatalog } from './useCases/GenerateCatalog';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { VariationsProduct } from './useCases/VariationsProduct';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'testImageProduct-queue',
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ListProductsFilters,
    ListProductsFilters,
    VariationsProduct,
    GenerateCatalog,
    TestImageProductProducerService,
    TestImageProductConsumer,
    AgroupGridProduct,
  ],
})
export class ProductsModule {}
