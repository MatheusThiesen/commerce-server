import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConceptService } from './concept.service';
import { CreateConceptDto } from './dto/create-concept.dto';

@Controller('concepts')
export class ConceptController {
  constructor(private readonly conceptService: ConceptService) {}

  @Post()
  create(@Body() createConceptDto: CreateConceptDto) {
    return this.conceptService.create(createConceptDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptService.findOne(+id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.conceptService.import(file);
  }
}
