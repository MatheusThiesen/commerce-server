import { GetCurrentUserId } from '@/common/decorators/get-current-user-id.decorator';
import { Controller, Get } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('/banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findOne(@GetCurrentUserId() userId: string) {
    return this.bannersService.findOne(userId);
  }
}
