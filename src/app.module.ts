import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { ColorsModule } from './modules/colors/colors.module';
import { UtilsModule } from './utils/utils.module';
import { BrandsModule } from './modules/brands/brands.module';
import { GroupsModule } from './modules/groups/groups.module';
import { SubgroupsModule } from './modules/subgroups/subgroups.module';
import { LinesModule } from './modules/lines/lines.module';
import { CollectionsModule } from './modules/collections/collections.module';

@Module({
  imports: [ColorsModule, PrismaModule, UtilsModule, BrandsModule, GroupsModule, SubgroupsModule, LinesModule, CollectionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
