import { Module } from '@nestjs/common';
import { ClientsToSellersController } from './clients-to-sellers.controller';
import { ClientsToSellersService } from './clients-to-sellers.service';

@Module({
  controllers: [ClientsToSellersController],
  providers: [ClientsToSellersService],
})
export class ClientsToSellersModule {}
