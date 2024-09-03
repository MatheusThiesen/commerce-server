import { Module } from '@nestjs/common';
import { PanelGroupsController } from './groups.controller';
import { PanelGroupsService } from './groups.service';

@Module({
  controllers: [PanelGroupsController],
  providers: [PanelGroupsService],
})
export class PanelGroupsModule {}
