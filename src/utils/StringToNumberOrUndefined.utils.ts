import { Injectable } from '@nestjs/common';

@Injectable()
export class StringToNumberOrUndefined {
  execute(data: any) {
    return !isNaN(Number(data)) ? Number(data) : undefined;
  }
}
