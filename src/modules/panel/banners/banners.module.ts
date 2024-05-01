import { Module } from '@nestjs/common';
import { PanelBannersController } from './banners.controller';
import { PanelBannersService } from './banners.service';
import { GenerateUrlFilters } from './useCases/GenerateUrlFilters';

@Module({
  controllers: [PanelBannersController],
  providers: [PanelBannersService, GenerateUrlFilters],
})
export class PanelBannersModule {}
