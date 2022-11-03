import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ColorsModule } from './modules/colors/colors.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LinesModule } from './modules/lines/lines.module';
import { ProductsModule } from './modules/products/products.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { StockLocationsModule } from './modules/stock-locations/stock-locations.module';
import { SubgroupsModule } from './modules/subgroups/subgroups.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ColorsModule,
    PrismaModule,
    UtilsModule,
    BrandsModule,
    GroupsModule,
    SubgroupsModule,
    LinesModule,
    CollectionsModule,
    SellersModule,
    AuthModule,
    ProductsModule,
    StockLocationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
