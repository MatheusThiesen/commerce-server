import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ColorsModule } from './modules/colors/colors.module';
import { ConceptModule } from './modules/concept/concept.module';
import { GridsModule } from './modules/grids/grids.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LinesModule } from './modules/lines/lines.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { ProductConceptRulesModule } from './modules/product-concept-rules/product-concept-rules.module';
import { ProductsModule } from './modules/products/products.module';
import { PurchasesOrderModule } from './modules/purchases-order/purchases-order.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { StockLocationsModule } from './modules/stock-locations/stock-locations.module';
import { SubgroupsModule } from './modules/subgroups/subgroups.module';
import { UtilsModule } from './utils/utils.module';
import { PriceListsModule } from './modules/price-lists/price-lists.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    PurchasesOrderModule,
    OrderItemsModule,
    PriceListsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
