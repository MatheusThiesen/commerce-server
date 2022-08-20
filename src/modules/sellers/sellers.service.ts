import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { ParseCsv } from '../../utils/parseCsv.utils';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Seller } from './entities/seller.entity';

@Injectable()
export class SellersService {
  private selectSeller = {
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
      password: await hash(createSellerDto.password),
    });

    const sellerExists = await this.prisma.vendedor.findUnique({
      where: { codigo: seller.codigo },
    });

    if (sellerExists) {
      throw new Error('Seller already exists');
    }

    const createdSeller = await this.prisma.vendedor.create({
      select: this.selectSeller,
      data: seller,
    });

    return createdSeller;
  }

  async findAll() {
    const sellers = await this.prisma.vendedor.findMany({
      select: this.selectSeller,
    });
    return sellers;
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
      password: updateSellerDto.password
        ? await hash(updateSellerDto.password)
        : undefined,
    });

    await this.findOne(codigo);

    const updatedSeller = await this.prisma.vendedor.update({
      select: this.selectSeller,
      data: seller,
      where: { codigo },
    });

    return updatedSeller;
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.vendedor.delete({ where: { codigo } });

    return;
  }
}
