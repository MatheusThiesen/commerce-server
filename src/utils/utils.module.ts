import { Global, Module } from '@nestjs/common';
import { GroupByObj } from './GroupByObj.utils';
import { LayoutMail } from './LayoutMail.utils';
import { OrderBy } from './OrderBy.utils';
import { ParseCsv } from './ParseCsv.utils';
import { StringToNumberOrUndefined } from './StringToNumberOrUndefined.utils';

@Global()
@Module({
  providers: [
    ParseCsv,
    StringToNumberOrUndefined,
    OrderBy,
    GroupByObj,
    LayoutMail,
  ],
  exports: [
    ParseCsv,
    StringToNumberOrUndefined,
    OrderBy,
    GroupByObj,
    LayoutMail,
  ],
})
export class UtilsModule {}
