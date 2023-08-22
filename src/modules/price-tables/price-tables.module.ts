import { Module } from '@nestjs/common';
import { PriceTablesService } from './price-tables.service';
import { PriceTablesController } from './price-tables.controller';

@Module({
  controllers: [PriceTablesController],
  providers: [PriceTablesService]
})
export class PriceTablesModule {}
