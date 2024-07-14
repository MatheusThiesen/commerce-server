import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ParseCsv } from 'src/utils/ParseCsv.utils';

@Injectable()
export class ClientsToSellersService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async import(file: Express.Multer.File, sellerCod: number) {
    const sellersToClients = await this.parseCsv.execute(file);

    const alreadyExistSeller = await this.prisma.vendedor.findUnique({
      select: { codigo: true },
      where: { codigo: Number(sellerCod) },
    });

    if (alreadyExistSeller) {
      const clients: { codigo: number }[] = (
        await Promise.all(
          sellersToClients.map(async ([clienteCod]) => {
            const alreadyExistClient = await this.prisma.cliente.findUnique({
              select: { codigo: true },
              where: { codigo: Number(clienteCod) },
            });

            if (alreadyExistClient) return { codigo: +clienteCod };
          }),
        )
      ).filter((filter) => filter);

      if (clients.length > 10000) {
        await this.prisma.vendedor.update({
          data: {
            clientes: {
              set: [],
            },
          },
          where: {
            codigo: alreadyExistSeller.codigo,
          },
        });

        for (const client of clients) {
          await this.prisma.vendedor.update({
            data: {
              clientes: {
                connect: {
                  codigo: client.codigo,
                },
              },
            },
            where: {
              codigo: alreadyExistSeller.codigo,
            },
          });
        }
      } else {
        await this.prisma.vendedor.update({
          data: {
            clientes: {
              set: clients,
            },
          },
          where: {
            codigo: alreadyExistSeller.codigo,
          },
        });
      }
    }

    return;
  }
}
