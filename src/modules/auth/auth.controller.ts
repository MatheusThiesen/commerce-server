import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RtGuard } from 'src/common/guards';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from '../../common/decorators';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { PasswordDto } from './dto/password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Public()
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('logout')
  logout(@GetCurrentUserId() userId: string) {
    return this.authService.logout(userId);
  }

  @Post('password')
  changePassword(@Body() dto: PasswordDto, @GetCurrentUserId() userId: string) {
    return this.authService.changePassword(userId, dto);
  }

  @Public()
  @Post('forgot')
  forgot(@Body() dto: { email: string }) {
    return this.authService.forgot(dto.email);
  }

  @Public()
  @Post('reset')
  reset(@Body() dto: { token: string; senha: string }) {
    return this.authService.reset({ password: dto.senha, token: dto.token });
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('me')
  me(@GetCurrentUserId() userId: string) {
    return this.authService.me(userId);
  }
}
