import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { OrderBy } from '../../../../utils/OrderBy.utils';

interface ListProductsFiltersProps {
  referencesProduct: string[];
  orderBy: string;
  filters?: string;
  groupProduct?: boolean;
  stockLocation?: boolean;
  userId: string;
}

export interface PageData {
  imageMain: string;
  reference: string;
  description: string;
  descriptionAdditional: string;
  alternativeCode: string;
  colors: string;
  price: string;
  priceList28: string;
  brand: string;
  colection: string;
  genre: string;
  group: string;
  subgroup: string;
  line: string;
  grids: GridProps[];

  isGroupProduct: boolean;
  isStockLocation: boolean;
  variations?: VariationsProps[];
}

export type VariationsProps = {
  imageMain: string;
  reference: string;
};

export type GridProps = {
  name: string;
  stocks?: StockLocationProps[];
};
type StockLocationProps = {
  description: string;
  qtd: number;
};

@Injectable()
export class GenerateCatalog {
  constructor(private prisma: PrismaService, private orderByProcess: OrderBy) {}

  async execute({
    referencesProduct,
    orderBy,
    groupProduct,
    stockLocation,
    filters,
    userId,
  }: ListProductsFiltersProps) {
    const products = await this.prisma.produto.findMany({
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        descricaoAdicional: true,
        precoVenda: true,
        descricaoComplementar: true,
        precoVendaEmpresa: true,
        genero: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        marca: {
          select: {
            descricao: true,
          },
        },
        grupo: {
          select: {
            descricao: true,
          },
        },
        subGrupo: {
          select: {
            descricao: true,
          },
        },
        linha: {
          select: {
            descricao: true,
          },
        },
        colecao: {
          select: {
            descricao: true,
          },
        },
        corPrimaria: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        corSecundaria: {
          select: {
            cor: {
              select: {
                descricao: true,
              },
            },
          },
        },
        locaisEstoque: {
          select: {
            descricao: true,
            quantidade: true,
          },
        },
      },
      where: {
        referencia: {
          in: referencesProduct,
        },
      },
      orderBy: [
        {
          generoCodigo: 'asc',
        },
        this.orderByProcess.execute(orderBy),
      ],
    });

    const createdCatalog = await this.prisma.catalogoProduto.create({
      select: {
        id: true,
      },
      data: {
        isGroupProduct: !!groupProduct,
        isStockLocation: !!stockLocation,
        orderBy: orderBy,
        filtro: filters,
        usuario: {
          connect: {
            id: userId,
          },
        },
      },
    });

    for (const product of products) {
      await this.prisma.catalogoProduto.update({
        where: { id: createdCatalog.id },
        data: {
          produto: {
            connect: {
              codigo: product.codigo,
            },
          },
        },
      });
    }

    return createdCatalog.id;
  }
}
