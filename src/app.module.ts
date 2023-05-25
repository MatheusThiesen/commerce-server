import { RedisModule } from '@nestjs-modules/ioredis';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AtGuard } from './common/guards';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchActivityModule } from './modules/branch-activists/branch-activists.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ClientsToSellersModule } from './modules/clients-to-sellers/clients-to-sellers.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ColorsModule } from './modules/colors/colors.module';
import { ConceptModule } from './modules/concept/concept.module';
import { GridsModule } from './modules/grids/grids.module';
import { GroupsModule } from './modules/groups/groups.module';
import { HomeModule } from './modules/home/home.module';
import { LinesModule } from './modules/lines/lines.module';
import { OrderModule } from './modules/order/order.module';
import { PriceListsModule } from './modules/price-lists/price-lists.module';
import { ProductConceptRulesModule } from './modules/product-concept-rules/product-concept-rules.module';
import { ProductImagensModule } from './modules/product-imagens/product-imagens.module';
import { ProductsModule } from './modules/products/products.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { StockLocationsModule } from './modules/stock-locations/stock-locations.module';
import { SubgroupsModule } from './modules/subgroups/subgroups.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ScheduleModule.forRoot(),

    RedisModule.forRoot({
      config: {
        url: `redis://${process.env.REDIS_HOST}:${+process.env.REDIS_PORT}`,
      },
    }),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),

    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        port: +process.env.MAILER_PORT,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      },
    }),

    PrismaModule,
    UtilsModule,
    ColorsModule,
    BrandsModule,
    GroupsModule,
    SubgroupsModule,
    LinesModule,
    CollectionsModule,
    SellersModule,
    AuthModule,
    ProductsModule,
    StockLocationsModule,
    GridsModule,
    ConceptModule,
    ProductConceptRulesModule,
    PriceListsModule,
    HomeModule,
    BranchActivityModule,
    ClientsModule,
    ClientsToSellersModule,
    CatalogModule,
    OrderModule,
    ProductImagensModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
