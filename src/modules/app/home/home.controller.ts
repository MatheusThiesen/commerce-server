import { Public } from '@/common/decorators';
import { Controller, Get } from '@nestjs/common';

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
