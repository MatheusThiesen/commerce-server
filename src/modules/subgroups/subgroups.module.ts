import { Module } from '@nestjs/common';
import { SubgroupsService } from './subgroups.service';
import { SubgroupsController } from './subgroups.controller';

@Module({
  controllers: [SubgroupsController],
  providers: [SubgroupsService]
})
export class SubgroupsModule {}
