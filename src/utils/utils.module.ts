import { Global, Module } from '@nestjs/common';
import { OrderBy } from './OrderBy.utils';
import { ParseCsv } from './ParseCsv.utils';
import { StringToNumberOrUndefined } from './StringToNumberOrUndefined.utils';

@Global()
@Module({
  providers: [ParseCsv, StringToNumberOrUndefined, OrderBy],
  exports: [ParseCsv, StringToNumberOrUndefined, OrderBy],
})
export class UtilsModule {}
