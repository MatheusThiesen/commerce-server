import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators';

@Controller('/')
export class HomeController {
  @Public()
  @Get()
  home() {
    const date = new Date().toLocaleString('pt-br', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return { run: date };
  }
}
