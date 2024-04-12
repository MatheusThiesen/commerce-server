import { Module } from '@nestjs/common';
import { ProductImagensService } from './product-imagens.service';
import { ProductImagensController } from './product-imagens.controller';

@Module({
  controllers: [ProductImagensController],
  providers: [ProductImagensService]
})
export class ProductImagensModule {}
