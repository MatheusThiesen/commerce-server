import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ParseCsv } from 'src/utils/ParseCsv.utils';

@Injectable()
export class ClientsToSellersService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async import(file: Express.Multer.File) {
    const sellersToClients = await this.parseCsv.execute(file);

    for (const sellerToClientArr of sellersToClients) {
      const [clienteCod, sellerCod, tipo] = sellerToClientArr;

      try {
        const walletExist =
          await this.prisma.carteiraClienteRepresentante.findUnique({
            select: { id: true },
            where: {
              vendedorCodigo_clienteCodigo: {
                clienteCodigo: +clienteCod,
                vendedorCodigo: +sellerCod,
              },
            },
          });

        const alreadyExistClient = await this.prisma.cliente.findUnique({
          select: { codigo: true },
          where: { codigo: Number(clienteCod) },
        });
        const alreadyExistSeller = await this.prisma.vendedor.findUnique({
          select: { codigo: true },
          where: { codigo: Number(sellerCod) },
        });

        if (alreadyExistClient && alreadyExistSeller) {
          if (walletExist) {
            await this.prisma.carteiraClienteRepresentante.update({
              data: {
                tipo: Number(tipo),
              },
              where: {
                id: walletExist.id,
              },
            });
          } else {
            await this.prisma.carteiraClienteRepresentante.create({
              data: {
                clienteCodigo: +clienteCod,
                vendedorCodigo: +sellerCod,
                tipo: +tipo,
              },
            });
          }
        } else {
          if (!alreadyExistClient)
            console.log(`Client not exist ${clienteCod}`);
          if (!alreadyExistSeller) console.log(`Seller not exist ${sellerCod}`);
        }
      } catch (error) {
        console.log(error);
        console.log(sellerToClientArr);
      }
    }

    return;
  }
}
