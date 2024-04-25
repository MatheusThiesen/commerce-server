import { Module } from '@nestjs/common';
import { PanelStatesController } from './states.controller';
import { PanelStatesService } from './states.service';

@Module({
  controllers: [PanelStatesController],
  providers: [PanelStatesService],
})
export class PanelStatesModule {}
