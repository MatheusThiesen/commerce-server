import { GetCurrentUserId } from '@/common/decorators';
import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll(
    @GetCurrentUserId() userId: string,
    @Query()
    { filters },
  ) {
    return this.brandsService.findAll({
      filters: filters?.map((f) => JSON.parse(f as string)),
      userId: String(userId),
    });
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.brandsService.import(file);
  }
}
