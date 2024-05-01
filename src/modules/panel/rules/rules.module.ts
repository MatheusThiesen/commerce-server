import { Module } from '@nestjs/common';
import { PanelRulesController } from './rules.controller';
import { PanelRulesService } from './rules.service';

@Module({
  controllers: [PanelRulesController],
  providers: [PanelRulesService],
})
export class PanelRulesModule {}
