import { Global, Module } from '@nestjs/common';
import { ParseCsv } from './ParseCsv';

@Global()
@Module({
  providers: [ParseCsv],
  exports: [ParseCsv],
})
export class UtilsModule {}
