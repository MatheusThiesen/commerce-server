import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchActivityDto } from './create-branch-activity.dto';

export class UpdateBranchActivityDto extends PartialType(
  CreateBranchActivityDto,
) {}
