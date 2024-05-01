import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string) {
    const findUser = await this.prisma.usuario.findUniqueOrThrow({
      select: {
        eVendedor: true,
        vendedor: {
          select: {
            marcas: {
              select: {
                codigo: true,
              },
            },
          },
        },
      },
      where: {
        id: userId,
      },
    });

    const banners = await this.prisma.banner.findMany({
      select: {
        id: true,
        titulo: true,
        eAtivo: true,
        urlSearch: true,

        imagemDesktop: {
          select: {
            id: true,
            nome: true,
            url: true,
            tamanho: true,
            tipoArquivo: true,
          },
        },
        imagemMobile: {
          select: {
            id: true,
            nome: true,
            url: true,
            tamanho: true,
            tipoArquivo: true,
          },
        },
      },
      where: {
        eAtivo: true,
        marcas: findUser.eVendedor
          ? {
              some: {
                codigo: {
                  in: findUser.vendedor.marcas.map((item) => item.codigo),
                },
              },
            }
          : undefined,
      },
    });

    return banners;
  }
}
