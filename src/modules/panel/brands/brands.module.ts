import { BrandsModule } from '@/modules/app/brands/brands.module';
import { BrandsService } from '@/modules/app/brands/brands.service';
import { Module } from '@nestjs/common';
import { PanelBrandsController } from './brands.controller';
import { PanelBrandsService } from './brands.service';

@Module({
  imports: [BrandsModule],
  controllers: [PanelBrandsController],
  providers: [PanelBrandsService, BrandsService],
})
export class PanelBrandsModule {}
