import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { hash } from 'argon2';
import { sendMailProducerService } from 'src/jobs/SendMail/sendMail-producer-service';
import { LayoutMail } from 'src/utils/LayoutMail.utils';
import { PrismaService } from '../../database/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { PasswordDto } from './dto/password.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './types/jwtPayload.type';
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
      select: { senha: true, id: true, email: true },
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
}
