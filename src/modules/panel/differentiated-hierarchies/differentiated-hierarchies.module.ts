import { Module } from '@nestjs/common';
import { PanelDifferentiatedHierarchiesController } from './differentiated-hierarchies.controller';
import { PanelDifferentiatedHierarchiesService } from './differentiated-hierarchies.service';

@Module({
  controllers: [PanelDifferentiatedHierarchiesController],
  providers: [PanelDifferentiatedHierarchiesService],
})
export class PanelDifferentiatedHierarchiesModule {}
