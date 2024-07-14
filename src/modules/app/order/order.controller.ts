import { GetCurrentUserId } from '@/common/decorators';
import {
  Body,
  Controller,
  Get,
  Param,
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
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
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
      filters: filters?.map((f) => JSON.parse(f as string)),
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
}
