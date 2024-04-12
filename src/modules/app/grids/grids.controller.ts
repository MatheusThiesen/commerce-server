import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { GridsService } from './grids.service';

@Controller('grids')
export class GridsController {
  constructor(private readonly gridsService: GridsService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.gridsService.import(file);
  }
}
