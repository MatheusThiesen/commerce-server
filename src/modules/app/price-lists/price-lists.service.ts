import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { PriceList } from './entities/price-list.entity';

@Injectable()
export class PriceListsService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createPriceListDto: CreatePriceListDto) {
    const priceList = new PriceList();
    Object.assign(priceList, createPriceListDto);

    const priceListExists = await this.prisma.listaPreco.findUnique({
      where: {
        produtoCodigo_codigo: {
          codigo: createPriceListDto.codigo,
          produtoCodigo: createPriceListDto.produtoCodigo,
        },
      },
    });

    if (priceListExists) {
      throw new Error('PriceList already exists');
    }

    const createdColor = await this.prisma.listaPreco.create({
      data: priceList,
    });

    await this.updateProduct(
      createPriceListDto.produtoCodigo,
      createPriceListDto.codigo,
      createPriceListDto.valor,
    );

    return createdColor;
  }

  async findOne(id: string) {
    const priceList = await this.prisma.listaPreco.findUnique({
      where: {
        id: id,
      },
    });

    if (!priceList) {
      throw new Error('PriceList does not exist');
    }

    return priceList;
  }

  async update(id: string, updatePriceListDto: UpdatePriceListDto) {
    const priceList = new PriceList();
    Object.assign(priceList, updatePriceListDto);

    await this.prisma.listaPreco.findUniqueOrThrow({
      where: {
        produtoCodigo_codigo: {
          codigo: priceList.codigo,
          produtoCodigo: priceList.produtoCodigo,
        },
      },
    });

    const updetedPriceList = await this.prisma.listaPreco.update({
      data: priceList,
      where: {
        id: id,
      },
    });

    await this.updateProduct(
      updetedPriceList.produtoCodigo,
      updetedPriceList.codigo,
      updetedPriceList.valor,
    );

    return updetedPriceList;
  }

  async import(file: Express.Multer.File) {
    const priceLists = await this.parseCsv.execute(file);

    for (const priceListArr of priceLists) {
      const [id, codigo, descricao, valor, situation, produtoCodigo] =
        priceListArr;

      const priceList = new PriceList();
      Object.assign(priceList, {
        id: String(id),
        codigo: Number(codigo),
        descricao: descricao,
        valor: Number(valor),
        eAtivo: situation === 1,
        produtoCodigo: Number(produtoCodigo),
      });

      const priceListExists = await this.prisma.listaPreco.findUnique({
        where: {
          produtoCodigo_codigo: {
            codigo: priceList.codigo,
            produtoCodigo: priceList.produtoCodigo,
          },
        },
      });

      try {
        if (priceListExists) {
          await this.update(priceListExists.id, priceList);
        } else {
          await this.create(priceList);
        }
      } catch (error) {
        console.log(error);
      }
    }

    return;
  }

  async updateProduct(productCode: number, listCode: number, value: number) {
    const updated = {
      [`precoTabela${listCode}`]: value,
    };

    await this.prisma.produto.update({
      data: updated,
      where: {
        codigo: productCode,
      },
    });
  }
}
