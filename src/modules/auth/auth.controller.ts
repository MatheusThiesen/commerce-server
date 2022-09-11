import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RtGuard } from 'src/common/guards';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from '../../common/decorators';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Post('logout')
  logout(@GetCurrentUserId() userCod: number) {
    return this.authService.logout(userCod);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  refreshTokens(
    @GetCurrentUserId() userCod: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userCod, refreshToken);
  }

  @Get('me')
  me(@GetCurrentUserId() userCod: number) {
    return this.authService.me(userCod);
  }
}
