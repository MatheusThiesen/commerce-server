import { GetRoleBySeller } from '@/modules/app/differentiated/useCases/GetRoleBySeller';
import { Module } from '@nestjs/common';
import { PanelSellersController } from './sellers.controller';
import { PanelSellersService } from './sellers.service';

@Module({
  controllers: [PanelSellersController],
  providers: [PanelSellersService, GetRoleBySeller],
})
export class PanelSellersModule {}
