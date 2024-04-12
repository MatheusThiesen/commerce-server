import { Module } from '@nestjs/common';
import { BranchActivityController } from './branch-activists.controller';
import { BranchActivityService } from './branch-activists.service';

@Module({
  controllers: [BranchActivityController],
  providers: [BranchActivityService],
})
export class BranchActivityModule {}
