import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GetCurrentUserSso } from 'src/common/decorators/get-current-user-id-sso.decorator';
import { RtGuard, SsoGuard } from 'src/common/guards';
import {
  GetCurrentUser,
  GetCurrentUserId,
  Public,
} from '../../common/decorators';
import { AuthService } from './auth.service';
import { AuthGetPinDto, AuthSessionDto } from './dto/auth-session.dto';
import { AuthDto } from './dto/auth.dto';
import { PasswordDto } from './dto/password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('get-pin')
  generatePin(@Body() dto: AuthGetPinDto) {
    return this.authService.generatePin(dto);
  }

  @Public()
  @Post('session')
  session(@Body() dto: AuthSessionDto) {
    return this.authService.session(dto);
  }

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

  @Public()
  @UseGuards(SsoGuard)
  @Post('sso')
  sso(@GetCurrentUserSso() user) {
    return this.authService.sso(user);
  }
}
