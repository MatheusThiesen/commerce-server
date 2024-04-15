import { ClientsService } from '@/modules/app/clients/clients.service';
import { Module } from '@nestjs/common';
import { PanelClientsController } from './clients.controller';
import { PanelClientsService } from './clients.service';

@Module({
  controllers: [PanelClientsController],
  providers: [PanelClientsService, ClientsService],
})
export class PanelClientsModule {}
