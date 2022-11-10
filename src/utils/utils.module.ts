import { Global, Module } from '@nestjs/common';
import { GroupByObj } from './GroupByObj.utils';
import { OrderBy } from './OrderBy.utils';
import { ParseCsv } from './ParseCsv.utils';
import { StringToNumberOrUndefined } from './StringToNumberOrUndefined.utils';

@Global()
@Module({
  providers: [ParseCsv, StringToNumberOrUndefined, OrderBy, GroupByObj],
  exports: [ParseCsv, StringToNumberOrUndefined, OrderBy, GroupByObj],
})
export class UtilsModule {}
