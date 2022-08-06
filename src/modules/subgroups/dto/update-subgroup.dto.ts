import { PartialType } from '@nestjs/mapped-types';
import { CreateSubgroupDto } from './create-subgroup.dto';

export class UpdateSubgroupDto extends PartialType(CreateSubgroupDto) {}
