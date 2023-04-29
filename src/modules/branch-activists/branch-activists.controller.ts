import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BranchActivityService } from './branch-activists.service';

@Controller('branch-activists')
export class BranchActivityController {
  constructor(private readonly branchActivityService: BranchActivityService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.branchActivityService.import(file);
  }
}
