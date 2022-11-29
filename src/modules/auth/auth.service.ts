import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { hash } from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async me(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        id: true,
        email: true,
        eVendedor: true,
        tokenRefresh: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user || !user.tokenRefresh) {
      throw new UnauthorizedException('Access Denied');
    }

    delete user.tokenRefresh;

    return user;
  }
  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.prisma.usuario.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.tokenRefresh)
      throw new UnauthorizedException('Access Denied');

    const rtMatches = await argon.verify(user.tokenRefresh, rt);
    if (!rtMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtPassword(user.id, tokens.refresh_token);

    return tokens;
  }
  async signin(dto: AuthDto) {
    const user = await this.prisma.usuario.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new UnauthorizedException('Access Denied');

    const passwordMatches = await argon.verify(user.senha, dto.senha);
    if (!passwordMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtPassword(user.id, tokens.refresh_token);

    return tokens;
  }
  async logout(userId: string) {
    await this.prisma.usuario.updateMany({
      where: {
        id: userId,
        tokenRefresh: {
          not: null,
        },
      },
      data: {
        tokenRefresh: null,
      },
    });
    return true;
  }

  async updateRtPassword(userId: string, rt: string): Promise<void> {
    const tokenRefresh = await argon.hash(rt);
    await this.prisma.usuario.update({
      where: {
        id: userId,
      },
      data: {
        tokenRefresh: tokenRefresh,
      },
    });
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '5m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async signup(dto: AuthDto) {
    const findUser = await this.prisma.usuario.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (findUser) throw new BadRequestException('User already exists');

    const user = new User();
    Object.assign(user, {
      ...dto,
      senha: await hash(dto.senha),
    });

    const createdUser = await this.prisma.usuario.create({
      data: user,
    });

    const tokens = await this.getTokens(createdUser.id, createdUser.email);
    await this.updateRtPassword(createdUser.id, tokens.refresh_token);

    return tokens;
  }
}
