import { PartialType } from '@nestjs/mapped-types';
import { CreateProductConceptRuleDto } from './create-product-concept-rule.dto';

export class UpdateProductConceptRuleDto extends PartialType(
  CreateProductConceptRuleDto,
) {}
