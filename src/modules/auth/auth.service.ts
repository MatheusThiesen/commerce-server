import { sendMailProducerService } from '@/jobs/SendMail/sendMail-producer-service';
import { LayoutMail } from '@/utils/LayoutMail.utils';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AcessoSiteSessao, TipoRegistroSessao } from '@prisma/client';
import * as argon from 'argon2';
import { hash } from 'argon2';
import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { AuthGetPinDto, AuthSessionDto } from './dto/auth-session.dto';
import { AuthDto } from './dto/auth.dto';
import { PasswordDto } from './dto/password.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './types/jwtPayload.type';
import { JwtSsoPayload } from './types/jwtPayloadSso.type';
import { Tokens } from './types/tokens.type';

type GetAccessAnalyticProps = {
  tipoUsuario: string;
  quantidade: number;
  periodo: Date;
};

type AccessAnalyticNormalized = {
  periodo: Date;
  itens: AccessAnalyticItemNormalized[];
};

type AccessAnalyticItemNormalized = {
  quantidade: number;
  tipoUsuario: string;
};

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

        eCliente: true,
        eVendedor: true,
        eAdmin: true,

        clienteCodigo: true,
        cliente: {
          select: {
            codigo: true,
            cnpj: true,
            nomeFantasia: true,
            razaoSocial: true,
            logradouro: true,
            cep: true,
            numero: true,
            bairro: true,
            cidade: true,
            uf: true,
            conceito: {
              select: {
                codigo: true,
                descricao: true,
              },
            },
          },
        },

        vendedorCodigo: true,
        vendedor: {
          select: {
            codigo: true,
            nome: true,
            nomeGuerra: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Access Denied');
    }

    const [firstMail] = user.email.split('@');

    const name = user.eVendedor
      ? user.vendedor.nomeGuerra
      : user.eCliente
      ? user.cliente.nomeFantasia
      : firstMail.split('.').join(' ');

    return {
      ...user,
      nome: name,
    };
  }
  async refreshTokens(rt: string, ip?: string): Promise<Tokens> {
    const findRefreshToken = await this.prisma.sessao.findFirst({
      select: {
        id: true,
        expirar: true,
        usuario: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      where: {
        sessaoToken: rt,
      },
    });

    if (!findRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(
      findRefreshToken.usuario.id,
      findRefreshToken.usuario.email,
    );

    if (!findRefreshToken.expirar) {
      throw new UnauthorizedException('Access Denied');
    }

    if (new Date() > findRefreshToken.expirar) {
      throw new UnauthorizedException('Access Denied');
    }

    await this.updateRtPassword(
      findRefreshToken.usuario.id,
      tokens.refresh_token,
      findRefreshToken.id,
      ip,
      'refresh',
    );

    return tokens;
  }
  async signup(dto: AuthDto, ip: string) {
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
    await this.updateRtPassword(
      createdUser.id,
      tokens.refresh_token,
      undefined,
      ip,
      'singup',
    );

    return tokens;
  }
  async signin(dto: AuthDto, ip: string) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        id: true,
        email: true,
        senha: true,
        eAtivo: true,
        eCliente: true,
      },
      where: {
        email: dto.email,
      },
    });

    if (!user || !user.eAtivo) throw new UnauthorizedException('Access Denied');

    const passwordMatches = await argon.verify(user.senha, dto.senha);
    if (!passwordMatches) throw new UnauthorizedException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtPassword(
      user.id,
      tokens.refresh_token,
      undefined,
      ip,
      'signin',
    );

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
  async sso(
    { entity, sellerCod, email, timestamp, token }: JwtSsoPayload,
    ip: string,
  ) {
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

    if (entity !== 'seller' && entity !== 'user' && entity !== 'client') {
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

      if (entity === 'client' && !user) {
        throw new BadRequestException('User malformed exists');
      }

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
    await this.updateRtPassword(
      user.id,
      tokens.refresh_token,
      undefined,
      ip,
      'sso',
    );

    return tokens;
  }
  async ssoPortal(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: {
        id: userId,
      },
    });

    if (!(user.eCliente || user.eVendedor)) {
      throw new Error('Only client or seller');
    }

    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    const timestamp = now.getTime();

    const payload = {
      entidade: Number(user.eCliente) === 1 ? 'cliente' : 'representante',
      codigoentidade:
        Number(user.eCliente) === 1 ? user.clienteCodigo : user.vendedorCodigo,
      timestamp: Math.floor(timestamp / 1000),
    };

    const token = jwt.sign(payload, process.env.SSO_PORTAL_SECRET);
    console.log(token);
    return `https://portal.alpardobrasil.com.br/sso/${token}`;
  }

  async generatePin(dto: AuthGetPinDto) {
    const user = await this.prisma.usuario.findUnique({
      select: {
        senha: true,
        id: true,
        email: true,
        eAtivo: true,
        eAdmin: true,
      },
      where: {
        email: dto.email,
      },
    });

    if (!user || !user.eAtivo || !user.eAdmin) {
      throw new BadRequestException('Access Denied');
    }

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
            acessoSite: 'painel',
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
  async session(dto: AuthSessionDto, ip: string) {
    const session = await this.prisma.sessao.findFirst({
      select: {
        id: true,
        expirar: true,
        usuario: {
          select: {
            id: true,
            email: true,
            eAtivo: true,
            eAdmin: true,
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

    if (!session || !session.usuario.eAtivo || !session.usuario.eAdmin)
      throw new BadRequestException('Access Denied');

    if (new Date(session.expirar) <= new Date())
      throw new BadRequestException('Expired');

    const tokens = await this.getTokens(
      session.usuario.id,
      session.usuario.email,
    );

    await this.updateRtPassword(
      session.usuario.id,
      tokens.refresh_token,
      session.id,
      ip,
      'signin',
      'painel',
    );

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
  async reset(
    { token, password }: { token: string; password: string },
    ip: string,
  ) {
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
    await this.updateRtPassword(
      findUser.id,
      tokens.refresh_token,
      undefined,
      ip,
      'resetPassword',
    );

    return tokens;
  }

  async updateRtPassword(
    userId: string,
    rt: string,
    sessionId?: string,
    ip?: string,
    type?: TipoRegistroSessao,
    access?: AcessoSiteSessao,
  ): Promise<void> {
    let session = sessionId;

    if (sessionId) {
      await this.prisma.sessao.update({
        data: {
          sessaoToken: rt,
          expirar: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          pin: null,
        },
        where: {
          id: sessionId,
        },
      });
    } else {
      const created = await this.prisma.sessao.create({
        data: {
          usuarioId: userId,
          expirar: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          sessaoToken: rt,
          acessoSite: access,
        },
      });

      session = created.id;
    }

    await this.prisma.registroSessao.create({
      data: {
        sessaoId: session,
        createdAt: new Date(),
        ip: ip,
        tipo: type,
      },
    });
  }
  async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const token = await this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get<string>('AT_SECRET'),
      expiresIn: '1d',
    });

    const refresh_token = uuidv4();

    return {
      access_token: token,
      refresh_token: refresh_token,
    };
  }

  async analytic(
    period: '7-days' | '14-days' | '1-month' | '3-month' | '1-year' = '7-days',
  ) {
    const normalized: AccessAnalyticNormalized[] = [];

    function normalizedAnalytic(contents: GetAccessAnalyticProps[]) {
      for (const data of contents) {
        const find = normalized.find((f) =>
          dayjs(data.periodo).add(3, 'h').isSame(f.periodo),
        );

        if (find) {
          find.itens.push({
            quantidade: Number(data.quantidade),
            tipoUsuario: data.tipoUsuario,
          });
        } else {
          normalized.push({
            periodo: dayjs(data.periodo).add(3, 'h').toDate(),

            itens: [
              {
                tipoUsuario: data.tipoUsuario,
                quantidade: Number(data.quantidade),
              },
            ],
          });
        }
      }
    }

    switch (period) {
      case '7-days':
        const orders7Days = await this.prisma.$queryRaw<
          GetAccessAnalyticProps[]
        >`
         select 
            DATE_TRUNC('day', s."createdAt") AS "periodo",
            CASE
                WHEN u."eVendedor" THEN 'Representante'
                WHEN u."eAdmin" THEN 'Operador'
                WHEN u."eCliente" THEN 'Cliente'
                ELSE 'Operador'
            END AS "tipoUsuario",
            COUNT(*) AS "quantidade"
          from (
            SELECT 
              s."usuarioId",
              DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours') AS "createdAt",
              r.tipo,
              COUNT(*) AS "quantidade"
            FROM "registrosSessao" r
            INNER JOIN sessoes s ON s.id = r."sessaoId"
            where s."acessoSite" = 'app'
            GROUP BY DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours'), s."usuarioId", r.tipo 
            ) as s
          INNER JOIN usuarios u ON u.id = s."usuarioId"
          where u.email != 'importacao@alpardobrasil.com.br' and s."createdAt" >= (CURRENT_DATE - INTERVAL '7 days')
          GROUP BY DATE_TRUNC('day', s."createdAt"), "tipoUsuario"
          order by "periodo" asc;
        `;

        normalizedAnalytic(orders7Days);

        break;
      case '14-days':
        const orders14Days = await this.prisma.$queryRaw<
          GetAccessAnalyticProps[]
        >`
          select 
            DATE_TRUNC('day', s."createdAt") AS "periodo",
            CASE
                WHEN u."eVendedor" THEN 'Representante'
                WHEN u."eAdmin" THEN 'Operador'
                WHEN u."eCliente" THEN 'Cliente'
                ELSE 'Operador'
            END AS "tipoUsuario",
            COUNT(*) AS "quantidade"
          from (
            SELECT 
              s."usuarioId",
              DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours') AS "createdAt",
              r.tipo,
              COUNT(*) AS "quantidade"
            FROM "registrosSessao" r
            INNER JOIN sessoes s ON s.id = r."sessaoId"
            where s."acessoSite" = 'app'
            GROUP BY DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours'), s."usuarioId", r.tipo 
            ) as s
          INNER JOIN usuarios u ON u.id = s."usuarioId"
          where u.email != 'importacao@alpardobrasil.com.br' and s."createdAt" >= (CURRENT_DATE - INTERVAL '14 days')
          GROUP BY DATE_TRUNC('day', s."createdAt"), "tipoUsuario"
          order by "periodo" asc;
        `;
        normalizedAnalytic(orders14Days);
        break;
      case '1-month':
        const orders1Month = await this.prisma.$queryRaw<
          GetAccessAnalyticProps[]
        >`
        select 
            DATE_TRUNC('day', s."createdAt") AS "periodo",
            CASE
                WHEN u."eVendedor" THEN 'Representante'
                WHEN u."eAdmin" THEN 'Operador'
                WHEN u."eCliente" THEN 'Cliente'
                ELSE 'Operador'
            END AS "tipoUsuario",
            COUNT(*) AS "quantidade"
          from (
            SELECT 
              s."usuarioId",
              DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours') AS "createdAt",
              r.tipo,
              COUNT(*) AS "quantidade"
            FROM "registrosSessao" r
            INNER JOIN sessoes s ON s.id = r."sessaoId"
            where s."acessoSite" = 'app'
            GROUP BY DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours'), s."usuarioId", r.tipo 
            ) as s
          INNER JOIN usuarios u ON u.id = s."usuarioId"
          where u.email != 'importacao@alpardobrasil.com.br' and DATE_TRUNC('month', s."createdAt") = DATE_TRUNC('month', CURRENT_DATE) 
          GROUP BY DATE_TRUNC('day', s."createdAt"), "tipoUsuario"
          order by "periodo" asc;
        `;
        normalizedAnalytic(orders1Month);
        break;
      case '3-month':
        const orders3Months = await this.prisma.$queryRaw<
          GetAccessAnalyticProps[]
        >`
          select 
            DATE_TRUNC('month', s."createdAt") AS "periodo",
            CASE
                WHEN u."eVendedor" THEN 'Representante'
                WHEN u."eAdmin" THEN 'Operador'
                WHEN u."eCliente" THEN 'Cliente'
                ELSE 'Operador'
            END AS "tipoUsuario",
            COUNT(*) AS "quantidade"
          from (
            SELECT 
              s."usuarioId",
              DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours') AS "createdAt",
              r.tipo,
              COUNT(*) AS "quantidade"
            FROM "registrosSessao" r
            INNER JOIN sessoes s ON s.id = r."sessaoId"
            where s."acessoSite" = 'app'
            GROUP BY DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours'), s."usuarioId", r.tipo 
            ) as s
          INNER JOIN usuarios u ON u.id = s."usuarioId"
          where u.email != 'importacao@alpardobrasil.com.br' and s."createdAt" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months' 
          GROUP BY DATE_TRUNC('month', s."createdAt"), "tipoUsuario"
          order by "periodo" asc;
        `;
        normalizedAnalytic(orders3Months);
        break;
      case '1-year':
        const orders1Year = await this.prisma.$queryRaw<
          GetAccessAnalyticProps[]
        >`
          select 
              DATE_TRUNC('month', s."createdAt") AS "periodo",
              CASE
                  WHEN u."eVendedor" THEN 'Representante'
                  WHEN u."eAdmin" THEN 'Operador'
                  WHEN u."eCliente" THEN 'Cliente'
                  ELSE 'Operador'
              END AS "tipoUsuario",
              COUNT(*) AS "quantidade"
            from (
              SELECT 
                s."usuarioId",
                DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours') AS "createdAt",
                r.tipo,
                COUNT(*) AS "quantidade"
              FROM "registrosSessao" r
              INNER JOIN sessoes s ON s.id = r."sessaoId"
              where s."acessoSite" = 'app'
              GROUP BY DATE_TRUNC('day', r."createdAt" - INTERVAL '3 hours'), s."usuarioId", r.tipo 
              ) as s
            INNER JOIN usuarios u ON u.id = s."usuarioId"
            where u.email != 'importacao@alpardobrasil.com.br' and DATE_TRUNC('year', s."createdAt") = DATE_TRUNC('year', CURRENT_DATE)
            GROUP BY DATE_TRUNC('month', s."createdAt"), "tipoUsuario"
            order by "periodo" asc;
        `;

        normalizedAnalytic(orders1Year);
        break;
    }

    return normalized;
  }
}
