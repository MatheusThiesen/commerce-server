import { GetCurrentUserId } from '@/common/decorators';
import { TimeoutInterceptor } from '@/interceptors/timeout.interceptors';
import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientsService } from './clients.service';
import { QueryClients } from './dto/query-client.type';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(
    @GetCurrentUserId() userId: string,
    @Query()
    { page = '0', pagesize = '10', orderby, filters, search }: QueryClients,
  ) {
    return this.clientsService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderBy: orderby,
      filters: filters?.map((f) => JSON.parse(f as string)),
      userId: userId,
      search: search,
    });
  }

  @Get('filters')
  getFilters(@GetCurrentUserId() userId: string) {
    return this.clientsService.getFiltersForFindAll(userId);
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string, @GetCurrentUserId() userId: string) {
    return this.clientsService.findFirst(+codigo, userId);
  }

  @Post('import')
  @UseInterceptors(TimeoutInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.clientsService.import(file);
  }
}
