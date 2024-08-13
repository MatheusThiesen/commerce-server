import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ParseCsv } from '../../../utils/ParseCsv.utils';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Seller } from './entities/seller.entity';

@Injectable()
export class SellersService {
  private readonly selectSeller = {
    codigo: true,
    nome: true,
    nomeGuerra: true,
    email: true,
    codGerente: true,
    codSupervisor: true,
    eAtivo: true,
    eGerente: true,
    eSupervisor: true,
    createdAt: true,
    updatedAt: true,
  };

  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createSellerDto: CreateSellerDto) {
    const seller = new Seller();
    Object.assign(seller, {
      ...createSellerDto,
    });

    const sellerExists = await this.prisma.vendedor.findUnique({
      where: { codigo: seller.codigo },
    });

    if (sellerExists) {
      throw new Error('Seller already exists');
    }

    let conectBrands: undefined | object = undefined;

    if (seller.marcasCod) {
      conectBrands = {
        connect: seller.marcasCod.map((cod) => ({
          codigo: cod,
        })),
      };
    }

    delete seller.marcasCod;
    const createdSeller = await this.prisma.vendedor.create({
      select: this.selectSeller,
      data: { ...seller, marcas: conectBrands },
    });

    const findUser = await this.prisma.usuario.findUnique({
      select: {
        id: true,
        eVendedor: true,
        vendedorCodigo: true,
        vendedor: {
          select: {
            eAtivo: true,
          },
        },
      },
      where: {
        email: seller.email,
      },
    });

    if (!findUser && seller.email) {
      await this.prisma.usuario.create({
        data: {
          email: seller.email,
          senha: `-`,
          vendedorCodigo: seller.codigo,
          eVendedor: true,
        },
      });
    }

    if (
      findUser.eVendedor &&
      findUser.vendedor.eAtivo === false &&
      seller.eAtivo &&
      findUser.vendedorCodigo !== seller.codigo
    ) {
      await this.prisma.usuario.update({
        data: {
          vendedorCodigo: seller.codigo,
        },
        where: {
          id: findUser.id,
        },
      });
    }

    return createdSeller;
  }

  async findOne(codigo: number) {
    const seller = await this.prisma.vendedor.findUnique({
      select: this.selectSeller,
      where: { codigo },
    });
    if (!seller) {
      throw new Error('Seller does not exist');
    }
    return seller;
  }

  async update(codigo: number, updateSellerDto: UpdateSellerDto) {
    const seller = new Seller();
    Object.assign(seller, {
      ...updateSellerDto,
    });

    await this.findOne(codigo);

    let conectBrands: undefined | object = undefined;

    if (seller.marcasCod) {
      conectBrands = {
        set: seller.marcasCod.map((cod) => ({
          codigo: cod,
        })),
      };
    }

    delete seller.marcasCod;

    const updatedSeller = await this.prisma.vendedor.update({
      select: this.selectSeller,
      data: { ...seller, marcas: conectBrands },
      where: { codigo },
    });

    const findUser = await this.prisma.usuario.findUnique({
      select: {
        id: true,
        vendedorCodigo: true,
        vendedor: {
          select: {
            eAtivo: true,
          },
        },
      },
      where: {
        email: seller.email,
      },
    });

    if (!findUser && seller.email) {
      await this.prisma.usuario.create({
        data: {
          email: seller.email,
          senha: `-`,
          vendedorCodigo: seller.codigo,
          eVendedor: true,
        },
      });
    }

    if (
      findUser.vendedor.eAtivo === false &&
      seller.eAtivo &&
      findUser.vendedorCodigo !== seller.codigo
    ) {
      await this.prisma.usuario.update({
        data: {
          vendedorCodigo: seller.codigo,
        },
        where: {
          id: findUser.id,
        },
      });
    }

    return updatedSeller;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.vendedor.delete({ where: { codigo } });

    return;
  }

  async import(file: Express.Multer.File) {
    const sellers = await this.parseCsv.execute(file);

    for (const sellerArr of sellers) {
      const [
        codigo,
        marcasCod,
        codGerente,
        codSupervisor,
        nome,
        nomeGuerra,
        email,
        situation,
        eGerente,
        eSupervisor,
      ] = sellerArr;

      const seller = new Seller();
      Object.assign(seller, {
        codigo: Number(codigo),
        marcasCod: marcasCod
          ? marcasCod.split(',').map((a) => Number(a))
          : undefined,
        codGerente: codGerente ? Number(codGerente) : undefined,
        codSupervisor: codSupervisor ? Number(codSupervisor) : undefined,
        nome: nome,
        nomeGuerra: nomeGuerra,
        email: email,
        eAtivo: situation ? Number(situation) === 1 : undefined,
        eGerente: eGerente ? eGerente === 's' : undefined,
        eSupervisor: eSupervisor ? eSupervisor === 's' : undefined,
      });

      const sellerExists = await this.prisma.vendedor.findUnique({
        where: {
          codigo: seller.codigo,
        },
      });

      try {
        if (sellerExists) {
          await this.update(sellerExists.codigo, seller);
        } else {
          await this.create(seller);
        }
      } catch (error) {
        console.log(error);
      }
    }

    return;
  }
}
