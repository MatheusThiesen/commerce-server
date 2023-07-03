import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrderBy } from 'src/utils/OrderBy.utils';
import { AgroupGridProduct } from '../products/useCases/AgroupGridProduct';
import { ListingRule } from '../products/useCases/ListingRule';
import { VariationsProduct } from '../products/useCases/VariationsProduct';
import { FilterOrderNormalized } from '../products/useCases/filterOrderNormalized';
import {
  GridProps,
  PageData,
  VariationsProps,
} from './useCases/GenerateCatalog';

@Injectable()
export class CatalogService {
  readonly spaceLink = process.env.SPACE;
  readonly limitDays = 7;

  constructor(
    private prisma: PrismaService,
    private orderBy: OrderBy,
    private agroupGridProduct: AgroupGridProduct,
    private variationsProduct: VariationsProduct,
    private readonly listingRule: ListingRule,
    private readonly filterOrderNormalized: FilterOrderNormalized,
  ) {}

  async findOne({
    id,
    page,
    pagesize,
  }: {
    id: string;
    page: number;
    pagesize: number;
  }) {
    const catalogo = await this.prisma.catalogoProduto.findUnique({
      select: {
        id: true,
        orderBy: true,
        filtro: true,
        isGroupProduct: true,
        isStockLocation: true,
        qtdAcessos: true,
        createdAt: true,
      },
      where: {
        id,
      },
    });

    const now = new Date();
    now.setDate(now.getDate() - this.limitDays);

    if (!catalogo) {
      throw new BadRequestException('Id de catálogo inválido ou inexistente');
    }
    if (now > catalogo.createdAt) {
      throw new BadRequestException('Catálogo expirado');
    }

    const normalizedFilters = catalogo?.filtro
      ? await this.filterOrderNormalized.execute(JSON.parse(catalogo?.filtro))
      : undefined;

    const products = await this.prisma.produto.findMany({
      take: pagesize,
      skip: page * pagesize,
      distinct: 'referencia',
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
        imagens: {
          take: 1,
          orderBy: { sequencia: 'asc' },
          select: {
            nome: true,
          },
        },
        locaisEstoque: {
          select: {
            descricao: true,
            quantidade: true,
          },
          where: normalizedFilters?.locaisEstoque?.some,
        },
      },
      where: {
        AND: [this.listingRule.execute(), normalizedFilters],

        CatalogoProduto: {
          some: {
            id: catalogo.id,
          },
        },
      },
      orderBy: [
        {
          generoCodigo: 'asc',
        },
        this.orderBy.execute(catalogo.orderBy),
        {
          codigo: 'desc',
        },
      ],
    });

    const productsNormalized: PageData[] = [];
    for (const product of products) {
      const agroupProduct = await this.agroupGridProduct.execute({
        reference: product.referencia,
        query: normalizedFilters,
      });

      const grids: GridProps[] = agroupProduct.map((grid) => ({
        name: `${grid.codigo} - ${
          grid.descricaoAdicional
        } - PDV: ${grid.precoVenda.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        })}`,
        stocks: catalogo.isStockLocation
          ? grid.locaisEstoque.map((stock) => ({
              description: stock.descricao,
              qtd: stock.quantidade,
            }))
          : [],
      }));

      let variations: VariationsProps[] = [];

      if (!!catalogo.isGroupProduct) {
        const getVariationsProduct = await this.variationsProduct.execute({
          alternativeCode: product.codigoAlternativo,
          query: this.listingRule.execute(),
        });

        variations = getVariationsProduct
          .filter((f) => f.referencia !== product.referencia)
          .map((v) => ({
            imageMain:
              `${this.spaceLink}/Produtos/${v.referencia}_01` as string,
            reference: v.referencia,
          }));
      }

      const newPage: PageData = {
        isGroupProduct: !!catalogo.isGroupProduct,
        isStockLocation: !!catalogo.isStockLocation,
        variations: variations,

        imageMain: `${this.spaceLink}/Produtos/${
          product?.imagens && product.imagens[0]
            ? product.imagens[0].nome
            : product.referencia + '_01'
        }` as string,
        alternativeCode: product?.codigoAlternativo ?? '-',
        reference: product?.referencia ?? '-',
        description: product?.descricao ?? '-',
        descriptionAdditional: product?.descricaoAdicional ?? '-',
        colors:
          product?.corPrimaria?.descricao &&
          product?.corSecundaria?.cor?.descricao
            ? `${product.corPrimaria.descricao} e ${product.corSecundaria.cor.descricao}`
            : product?.corPrimaria?.descricao ?? '-',
        price: product?.precoVenda?.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        }),
        brand: product?.marca?.descricao ?? '-',
        colection: product?.colecao?.descricao ?? '-',
        genre: product?.genero?.descricao ?? '-',
        group: product?.grupo?.descricao ?? '-',
        subgroup: product?.subGrupo?.descricao ?? '-',
        line: product?.linha?.descricao ?? '-',
        grids: grids,
      };

      productsNormalized.push(newPage);
    }

    return {
      products: productsNormalized,
      date: new Date(),
      page,
      pagesize,
      hasNextPage: products.length >= pagesize,
    };
  }

  async findOneCount({ id }: { id: string }) {
    const catalogo = await this.prisma.catalogoProduto.findUnique({
      select: {
        id: true,
        orderBy: true,
        filtro: true,
        isGroupProduct: true,
        isStockLocation: true,
        qtdAcessos: true,
        createdAt: true,
      },
      where: {
        id,
      },
    });

    const now = new Date();
    now.setDate(now.getDate() - this.limitDays);

    if (!catalogo) {
      throw new BadRequestException('Id de catálogo inválido ou inexistente');
    }
    if (now > catalogo.createdAt) {
      throw new BadRequestException('Catálogo expirado');
    }

    const normalizedFilters = catalogo?.filtro
      ? await this.filterOrderNormalized.execute(JSON.parse(catalogo?.filtro))
      : undefined;

    const products = await this.prisma.produto.findMany({
      distinct: 'referencia',
      select: { codigo: true },
      where: {
        AND: [this.listingRule.execute(), normalizedFilters],

        CatalogoProduto: {
          some: {
            id: catalogo.id,
          },
        },
      },
      orderBy: [
        {
          generoCodigo: 'asc',
        },
        this.orderBy.execute(catalogo.orderBy),
        {
          codigo: 'desc',
        },
      ],
    });

    return {
      total: products.length,
    };
  }

  async updateVisit(id: string) {
    const catalogo = await this.prisma.catalogoProduto.findUnique({
      select: {
        id: true,
        orderBy: true,
        isGroupProduct: true,
        isStockLocation: true,
        qtdAcessos: true,
        createdAt: true,
      },
      where: {
        id,
      },
    });

    const now = new Date();
    now.setDate(now.getDate() - this.limitDays);

    if (!catalogo) {
      throw new BadRequestException('Id de catálogo inválido ou inexistente');
    }
    if (now > catalogo.createdAt) {
      throw new BadRequestException('Catálogo expirado');
    }

    await this.prisma.catalogoProduto.update({
      where: {
        id: id,
      },
      data: {
        qtdAcessos: {
          increment: 1,
        },
      },
    });

    return;
  }
}
