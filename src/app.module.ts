import { RedisModule } from '@nestjs-modules/ioredis';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AtGuard } from './common/guards';
import { PrismaModule } from './database/prisma.module';
import { BilletsModule } from './modules/app/billets/billets.module';
import { BillingLocationsModule } from './modules/app/billing-locations/billing-locations.module';
import { BranchActivityModule } from './modules/app/branch-activists/branch-activists.module';
import { BrandsModule } from './modules/app/brands/brands.module';
import { CatalogModule } from './modules/app/catalog/catalog.module';
import { ClientsToSellersModule } from './modules/app/clients-to-sellers/clients-to-sellers.module';
import { ClientsModule } from './modules/app/clients/clients.module';
import { CollectionsModule } from './modules/app/collections/collections.module';
import { ColorsModule } from './modules/app/colors/colors.module';
import { ConceptModule } from './modules/app/concept/concept.module';
import { DifferentiatedModule } from './modules/app/differentiated/differentiated.module';
import { GridsModule } from './modules/app/grids/grids.module';
import { GroupsModule } from './modules/app/groups/groups.module';
import { HomeModule } from './modules/app/home/home.module';
import { LinesModule } from './modules/app/lines/lines.module';
import { OrderModule } from './modules/app/order/order.module';
import { PaymentConditionsRulesModule } from './modules/app/payment-conditions-rules/payment-conditions-rules.module';
import { PaymentConditionsModule } from './modules/app/payment-conditions/payment-conditions.module';
import { PriceListsModule } from './modules/app/price-lists/price-lists.module';
import { PriceTablesModule } from './modules/app/price-tables/price-tables.module';
import { ProductConceptRulesModule } from './modules/app/product-concept-rules/product-concept-rules.module';
import { ProductImagensModule } from './modules/app/product-imagens/product-imagens.module';
import { ProductsModule } from './modules/app/products/products.module';
import { SellersModule } from './modules/app/sellers/sellers.module';
import { StockLocationsModule } from './modules/app/stock-locations/stock-locations.module';
import { SubgroupsModule } from './modules/app/subgroups/subgroups.module';
import { AuthModule } from './modules/auth/auth.module';
import { PanelProductsModule } from './modules/panel/products/products.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ScheduleModule.forRoot(),

    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: `redis://${process.env.REDIS_HOST}:${+process.env.REDIS_PORT}`,
      }),
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
    PaymentConditionsModule,
    PaymentConditionsRulesModule,
    PriceTablesModule,
    BillingLocationsModule,
    BilletsModule,
    DifferentiatedModule,
    PanelProductsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
