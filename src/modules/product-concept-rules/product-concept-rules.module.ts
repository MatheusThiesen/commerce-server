import { Module } from '@nestjs/common';
import { ProductConceptRulesController } from './product-concept-rules.controller';
import { ProductConceptRulesService } from './product-concept-rules.service';

@Module({
  controllers: [ProductConceptRulesController],
  providers: [ProductConceptRulesService],
})
export class ProductConceptRulesModule {}
