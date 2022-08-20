import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubgroupDto } from './dto/create-subgroup.dto';
import { UpdateSubgroupDto } from './dto/update-subgroup.dto';
import { SubgroupsService } from './subgroups.service';

@Controller('subgroups')
export class SubgroupsController {
  constructor(private readonly subgroupsService: SubgroupsService) {}

  @Post()
  create(@Body() createSubgroupDto: CreateSubgroupDto) {
    return this.subgroupsService.create(createSubgroupDto);
  }

  @Get()
  findAll() {
    return this.subgroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subgroupsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubgroupDto: UpdateSubgroupDto,
  ) {
    return this.subgroupsService.update(+id, updateSubgroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subgroupsService.remove(+id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.subgroupsService.import(file);
  }
}
