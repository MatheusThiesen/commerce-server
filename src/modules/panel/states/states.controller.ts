import { Controller, Get } from '@nestjs/common';
import { PanelStatesService } from './states.service';

@Controller('/panel/states')
export class PanelStatesController {
  constructor(private readonly panelStatesService: PanelStatesService) {}

  @Get()
  findAll() {
    return this.panelStatesService.findAll();
  }
}
