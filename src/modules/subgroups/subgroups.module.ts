import { Module } from '@nestjs/common';
import { SubgroupsController } from './subgroups.controller';
import { SubgroupsService } from './subgroups.service';

@Module({
  controllers: [SubgroupsController],
  providers: [SubgroupsService],
})
export class SubgroupsModule {}
