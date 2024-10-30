import { GetCurrentUserId } from '@/common/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    @GetCurrentUserId() userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.create(createOrderDto, userId);
  }

  @Put(':codigo')
  update(
    @GetCurrentUserId() userId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Param('codigo') codigo: string,
  ) {
    return this.orderService.update(+codigo, updateOrderDto, userId);
  }

  @Get()
  findAll(
    @GetCurrentUserId() userId: string,
    @Query()
    { page = '0', pagesize = '10', orderby, filters, search },
  ) {
    return this.orderService.findAll({
      page: Number(page),
      pagesize: Number(pagesize),
      orderBy: orderby,
      filters: filters,
      userId: String(userId),
      search: search,
    });
  }

  @Get('filters')
  getFilters(@GetCurrentUserId() userId: string) {
    return this.orderService.getFiltersForFindAll(String(userId));
  }

  @Get(':codigo')
  findOne(@Param('codigo') codigo: string, @GetCurrentUserId() userId: string) {
    return this.orderService.findOne(+codigo, userId);
  }

  @Post('sketch/:codigo')
  sketch(@Param('codigo') codigo: string, @GetCurrentUserId() userId: string) {
    return this.orderService.sketch(+codigo, userId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File) {
    return this.orderService.import(file);
  }

  @Delete(':codigo')
  delete(@Param('codigo') codigo: string, @GetCurrentUserId() userId: string) {
    return this.orderService.delete(+codigo, userId);
  }

  @Patch('cancel/:codigo')
  cancel(@Param('codigo') codigo: string, @GetCurrentUserId() userId: string) {
    return this.orderService.cancel(+codigo, userId);
  }
  @Patch('send/:codigo')
  send(
    @Param('codigo') codigo: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: { itens: [] },
  ) {
    return this.orderService.send(+codigo, userId, dto.itens ?? []);
  }
}
