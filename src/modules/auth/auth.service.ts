import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { hash } from 'argon2';
import * as crypto from 'crypto';
import { sendMailProducerService } from 'src/jobs/SendMail/sendMail-producer-service';
import { LayoutMail } from 'src/utils/LayoutMail.utils';
import { PrismaService } from '../../database/prisma.service';
import { AuthGetPinDto, AuthSessionDto } from './dto/auth-session.dto';
import { AuthDto } from './dto/auth.dto';
import { PasswordDto } from './dto/password.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './types/jwtPayload.type';
import { JwtSsoPayload } from './types/jwtPayloadSso.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private readonly sendMail: sendMailProducerService,
    private layoutMail: LayoutMail,
  ) {}

  async me(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        id: true,
        email: true,
        eVendedor: true,
        vendedorCodigo: true,
        tokenRefresh: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user || !user?.tokenRefresh) {
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

    if (!user) {
      throw new UnauthorizedException('Access Denied');
    }

    const findRefreshToken = await this.prisma.sessao.findFirst({
      where: {
        sessaoToken: rt,
        usuarioId: user.id,
      },
    });

    if (!user.tokenRefresh && !findRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const currentRefreshToken = findRefreshToken
      ? findRefreshToken.sessaoToken
      : user.tokenRefresh;

    console.log(currentRefreshToken);
    console.log(rt);

    const rtMatches = await argon.verify(currentRefreshToken, rt);
    if (!rtMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtPassword(user.id, tokens.refresh_token);

    return tokens;
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
  async signin(dto: AuthDto) {
    const user = await this.prisma.usuario.findUnique({
      select: { senha: true, id: true, email: true, eAtivo: true },
      where: {
        email: dto.email,
      },
    });

    if (!user || !user.eAtivo) throw new UnauthorizedException('Access Denied');

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
  async sso({ entity, sellerCod, email, timestamp, token }: JwtSsoPayload) {
    if (!timestamp) {
      throw new UnauthorizedException('Token malformed');
    }

    const now = Date.now();
    const normalizedTimestamp =
      String(timestamp).length === 10
        ? new Date(Number(timestamp) * 1000).getTime()
        : new Date(Number(timestamp)).getTime();

    if (now > normalizedTimestamp) {
      throw new UnauthorizedException('expired token');
    }

    const existToken = await this.prisma.tokenSso.findUnique({
      where: {
        token: token,
      },
    });

    // if (existToken) throw new UnauthorizedException('expired token');

    if (entity !== 'seller' && entity !== 'user') {
      throw new BadRequestException('User malformed exists');
    }

    let userId: string | undefined;

    if (entity === 'seller') {
      if (!sellerCod || isNaN(Number(sellerCod))) {
        throw new BadRequestException('User malformed exists');
      }

      const user = await this.prisma.usuario.findFirst({
        where: { vendedorCodigo: Number(sellerCod) },
        select: { id: true },
      });

      if (user) userId = user.id;
    } else {
      if (!email) {
        throw new BadRequestException('User malformed exists');
      }

      const user = await this.prisma.usuario.findUnique({
        where: { email },
        select: { id: true },
      });

      if (user) {
        userId = user.id;
      } else {
        const user = new User();
        Object.assign(user, {
          email: email,
          senha: '-',
        });

        const createdUser = await this.prisma.usuario.create({
          data: user,
        });

        userId = createdUser.id;
      }
    }

    if (!userId) {
      throw new BadRequestException('User not already exists');
    }

    const user = await this.prisma.usuario.findUnique({
      select: { id: true, email: true, eAtivo: true },
      where: {
        id: userId,
      },
    });

    const tokens = await this.getTokens(user.id, user.email);

    if (!existToken)
      await this.prisma.tokenSso.create({
        data: {
          token: token,
        },
      });
    await this.updateRtPassword(user.id, tokens.refresh_token);

    return tokens;
  }

  async generatePin(dto: AuthGetPinDto) {
    const user = await this.prisma.usuario.findUnique({
      select: { senha: true, id: true, email: true, eAtivo: true },
      where: {
        email: dto.email,
      },
    });

    if (!user || !user.eAtivo) throw new UnauthorizedException('Access Denied');

    const code = Math.floor(10000000 + Math.random() * 90000000)
      .toString()
      .substring(0, 8);

    await this.prisma.usuario.update({
      where: {
        id: user.id,
      },
      data: {
        sessoes: {
          create: {
            pin: code,
            expirar: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    const htmlMail = await this.layoutMail.codeSession(code);

    await this.sendMail.execute({
      to: [
        {
          email: user.email,
          name: '',
        },
      ],
      message: {
        subject: 'Código de acesso painel - App Alpar do Brasil',
        html: htmlMail,
      },
    });

    return;
  }
  async session(dto: AuthSessionDto) {
    const session = await this.prisma.sessao.findFirst({
      select: {
        id: true,
        expirar: true,
        usuario: {
          select: {
            id: true,
            email: true,
            eAtivo: true,
          },
        },
      },
      where: {
        usuario: {
          email: dto.email,
        },
        pin: dto.pin,
      },
    });

    if (!session || !session.usuario.eAtivo)
      throw new UnauthorizedException('Access Denied');

    if (new Date(session.expirar) <= new Date())
      throw new UnauthorizedException('Expired');

    const tokens = await this.getTokens(
      session.usuario.id,
      session.usuario.email,
    );

    await this.prisma.sessao.update({
      where: {
        id: session.id,
      },
      data: {
        expirar: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        sessaoToken: tokens.refresh_token,
        pin: null,
      },
    });

    return tokens;
  }

  async changePassword(userId: string, dto: PasswordDto) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        id: true,
        senha: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) throw new BadRequestException('Access Denied');

    const passwordMatches = await argon.verify(user.senha, dto.antigaSenha);
    if (!passwordMatches)
      throw new BadRequestException('Senha atual não corresponde');

    await this.prisma.usuario.update({
      data: {
        senha: await hash(dto.senha),
      },
      where: { id: userId },
    });
  }
  async forgot(email: string) {
    const user = await this.prisma.usuario.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) throw new BadRequestException('Usuário não encontrado');

    const token = crypto.randomUUID();
    const now = new Date();
    now.setDate(now.getDate() + 1);

    await this.prisma.usuario.update({
      data: {
        senhaResetToken: token,
        senhaResetExpira: now,
      },
      where: {
        id: user.id,
      },
    });

    const htmlMail = await this.layoutMail.forgot({
      link: `${process.env.FRONTEND_URL}/resetar?token=${token}`,
    });

    //send mail que
    await this.sendMail.execute({
      to: [
        {
          email: email,
          name: '',
        },
      ],
      message: {
        subject: 'Recuperação de Senha - App Alpar do Brasil',
        html: htmlMail,
      },
    });

    return;
  }
  async reset({ token, password }: { token: string; password: string }) {
    const now = new Date();
    const findUser = await this.prisma.usuario.findFirst({
      select: {
        id: true,
        email: true,
        senhaResetExpira: true,
      },
      where: {
        senhaResetToken: token,
      },
    });

    if (!findUser) throw new BadRequestException('Token inválido');

    if (now >= findUser.senhaResetExpira) {
      throw new BadRequestException('Token inválido');
    }

    await this.prisma.usuario.update({
      data: {
        senha: await hash(password),
        senhaResetToken: '',
      },
      where: {
        id: findUser.id,
      },
    });

    const tokens = await this.getTokens(findUser.id, findUser.email);
    await this.updateRtPassword(findUser.id, tokens.refresh_token);

    return tokens;
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
        expiresIn: '1m',
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
