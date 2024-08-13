import { GetCurrentUserSso } from '@/common/decorators/get-current-user-id-sso.decorator';
import { SsoGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { AuthGetPinDto, AuthSessionDto } from './dto/auth-session.dto';
import { AuthDto } from './dto/auth.dto';
import { PasswordDto } from './dto/password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('analytic')
  analytic(
    @Query()
    { periodo },
  ) {
    return this.authService.analytic(periodo);
  }

  @Public()
  @Post('get-pin')
  generatePin(@Body() dto: AuthGetPinDto) {
    return this.authService.generatePin(dto);
  }

  @Public()
  @Post('session')
  session(@Body() dto: AuthSessionDto, @Ip() ip) {
    return this.authService.session(dto, ip);
  }

  @Public()
  @Post('signin')
  signin(@Body() dto: AuthDto, @Ip() ip) {
    return this.authService.signin(dto, ip);
  }

  @Public()
  @Post('signup')
  signup(@Body() dto: AuthDto, @Ip() ip) {
    return this.authService.signup(dto, ip);
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
  reset(@Body() dto: { token: string; senha: string }, @Ip() ip) {
    return this.authService.reset(
      { password: dto.senha, token: dto.token },
      ip,
    );
  }

  @Public()
  @Post('refresh')
  refreshTokens(@Body() dto: { token: string }, @Ip() ip) {
    return this.authService.refreshTokens(dto.token, ip);
  }

  @Get('me')
  me(@GetCurrentUserId() userId: string) {
    return this.authService.me(userId);
  }

  @Public()
  @UseGuards(SsoGuard)
  @Post('sso')
  sso(@GetCurrentUserSso() user, @Ip() ip) {
    return this.authService.sso(user, ip);
  }
}
