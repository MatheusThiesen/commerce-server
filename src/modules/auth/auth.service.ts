import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async me(userCod: number) {
    const user = await this.prisma.vendedor.findUnique({
      select: {
        codigo: true,
        nome: true,
        nomeGuerra: true,
        email: true,
        codGerente: true,
        codSupervisor: true,
        eAtivo: true,
        eGerente: true,
        eSupervisor: true,
        senhaRefresh: true,
      },
      where: {
        codigo: userCod,
      },
    });

    if (!user || !user.senhaRefresh)
      throw new ForbiddenException('Access Denied');

    delete user.senhaRefresh;

    return user;
  }
  async refreshTokens(userCod: number, rt: string): Promise<Tokens> {
    const user = await this.prisma.vendedor.findUnique({
      where: {
        codigo: userCod,
      },
    });
    if (!user || !user.senhaRefresh)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await argon.verify(user.senhaRefresh, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.codigo, user.email);
    await this.updateRtPassword(user.codigo, tokens.refresh_token);

    return tokens;
  }
  async signin(dto: AuthDto) {
    const user = await this.prisma.vendedor.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await argon.verify(user.senha, dto.senha);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.codigo, user.email);
    await this.updateRtPassword(user.codigo, tokens.refresh_token);

    return tokens;
  }
  async logout(userCod: number) {
    await this.prisma.vendedor.updateMany({
      where: {
        codigo: userCod,
        senhaRefresh: {
          not: null,
        },
      },
      data: {
        senhaRefresh: null,
      },
    });
    return true;
  }

  async updateRtPassword(userCod: number, rt: string): Promise<void> {
    const senhaRefresh = await argon.hash(rt);
    await this.prisma.vendedor.update({
      where: {
        codigo: userCod,
      },
      data: {
        senhaRefresh: senhaRefresh,
      },
    });
  }

  async getTokens(userCod: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userCod,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15s',
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
}
