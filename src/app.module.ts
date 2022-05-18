import { Module } from "@nestjs/common";
import { SellerModule } from "./modules/seller/seller.module";

@Module({
  imports: [SellerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
