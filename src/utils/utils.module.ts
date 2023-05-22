import { Global, Module } from '@nestjs/common';
import { GroupByObj } from './GroupByObj.utils';
import { LayoutMail } from './LayoutMail.utils';
import { OrderBy } from './OrderBy.utils';
import { ParseCsv } from './ParseCsv.utils';
import { SearchFilter } from './SearchFilter.utils';
import { StringToNumberOrUndefined } from './StringToNumberOrUndefined.utils';

@Global()
@Module({
  providers: [
    ParseCsv,
    StringToNumberOrUndefined,
    OrderBy,
    GroupByObj,
    LayoutMail,
    SearchFilter,
  ],
  exports: [
    ParseCsv,
    StringToNumberOrUndefined,
    OrderBy,
    GroupByObj,
    LayoutMail,
    SearchFilter,
  ],
})
export class UtilsModule {}
