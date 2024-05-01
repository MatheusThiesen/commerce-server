import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { CreateBilletDto } from './dto/create-billet.dto';
import { UpdateBilletDto } from './dto/update-billet.dto';
import { Billet } from './entities/billet.entity';

@Injectable()
export class BilletsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createBilletDto: CreateBilletDto) {
    const billet = new Billet();
    Object.assign(billet, {
      ...createBilletDto,
    });

    const billetExists = await this.prisma.titulo.findUnique({
      where: {
        numeroDocumento_desdobramento_clienteCodigo: {
          numeroDocumento: billet.numeroDocumento,
          desdobramento: billet.desdobramento,
          clienteCodigo: billet.clienteCodigo,
        },
      },
    });

    if (billetExists) {
      throw new Error('Billet already exists');
    }

    const created = await this.prisma.titulo.create({
      data: billet,
    });

    return created;
  }

  async findOne(id: string) {
    const billet = await this.prisma.titulo.findUnique({
      select: {
        numeroDocumento: true,
        valor: true,
        desdobramento: true,
        parcela: true,
        nossoNumero: true,
        dataVencimento: true,
        dataPagamento: true,
      },
      where: { id },
    });
    if (!billet) {
      throw new Error('Billet does not exist');
    }
    return billet;
  }

  async update(id: string, updateBilletDto: UpdateBilletDto) {
    const billet = new Billet();
    Object.assign(billet, {
      ...updateBilletDto,
    });

    await this.findOne(id);

    const updated = await this.prisma.titulo.update({
      data: billet,
      where: { id },
    });

    return updated;
  }

  async import(file: Express.Multer.File) {
    const billets = await this.parseCsv.execute(file);

    for (const billetArr of billets) {
      const [
        numeroDocumento,
        valor,
        desdobramento,
        parcela,
        nossoNumero,
        dataVencimento,
        dataPagamento,
        vendedorCodigo,
        clienteCodigo,
      ] = billetArr;

      const sellerAlreadyExist = await this.prisma.cliente.findUnique({
        select: {
          codigo: true,
        },
        where: {
          codigo: Number(vendedorCodigo),
        },
      });

      const billet = new Billet();
      Object.assign(billet, {
        numeroDocumento: Number(numeroDocumento),
        valor: Number(valor),
        desdobramento: Number(desdobramento),
        parcela: Number(parcela),
        nossoNumero: String(nossoNumero),
        dataVencimento: dataVencimento ? new Date(dataVencimento) : undefined,
        dataPagamento: dataPagamento ? new Date(dataPagamento) : undefined,
        vendedorCodigo: sellerAlreadyExist?.codigo,
        clienteCodigo: Number(clienteCodigo),
      });

      const billetExists = await this.prisma.titulo.findUnique({
        select: {
          id: true,
        },
        where: {
          numeroDocumento_desdobramento_clienteCodigo: {
            numeroDocumento: billet.numeroDocumento,
            desdobramento: billet.desdobramento,
            clienteCodigo: billet.clienteCodigo,
          },
        },
      });

      const clientAlreadyExist = await this.prisma.cliente.findUnique({
        select: {
          codigo: true,
        },
        where: {
          codigo: billet.clienteCodigo,
        },
      });

      if (clientAlreadyExist) {
        if (billetExists) {
          await this.update(billetExists.id, billet);
        } else {
          await this.create(billet);
        }
      }
    }

    return;
  }
}
