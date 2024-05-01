//files.controller.ts
import multerConfig from '@/services/multer-config';
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('file')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  create(@UploadedFile() file: Express.MulterS3.File) {
    return this.filesService.create(file);
  }

  @Post('many')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files' }], multerConfig))
  async createMany(
    @UploadedFiles()
    files: Express.MulterS3.File[],
  ) {
    return await this.filesService.createMany(files['files']);
  }
}
