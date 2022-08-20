import { Global, Module } from '@nestjs/common';
import { ParseCsv } from './parseCsv.utils';

@Global()
@Module({
  providers: [ParseCsv],
  exports: [ParseCsv],
})
export class UtilsModule {}
