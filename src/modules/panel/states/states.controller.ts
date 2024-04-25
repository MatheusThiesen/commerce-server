import { Public } from '@/common/decorators';
import { Controller, Get } from '@nestjs/common';
import { PanelStatesService } from './states.service';

@Controller('/panel/states')
export class PanelStatesController {
  constructor(private readonly panelStatesService: PanelStatesService) {}

  @Public()
  @Get()
  findAll() {
    return this.panelStatesService.findAll();
  }
}
