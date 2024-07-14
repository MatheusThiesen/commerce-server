import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TimeoutInterceptor } from 'src/interceptors/timeout.interceptors';
import { ClientsToSellersService } from './clients-to-sellers.service';

@Controller('clients-to-sellers')
export class ClientsToSellersController {
  constructor(
    private readonly clientsToSellersService: ClientsToSellersService,
  ) {}

  @Post('import/:vendedorCod')
  @UseInterceptors(TimeoutInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  import(
    @Param('vendedorCod') vendedorCod: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.clientsToSellersService.import(file, Number(vendedorCod));
  }
}
