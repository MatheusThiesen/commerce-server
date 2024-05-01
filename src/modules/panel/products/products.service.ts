import { AgroupGridProduct } from '@/modules/app/products/useCases/AgroupGridProduct';
import { ListingRule } from '@/modules/app/products/useCases/ListingRule';
import { VariationsProduct } from '@/modules/app/products/useCases/VariationsProduct';
import { OrderBy } from '@/utils/OrderBy.utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FieldsProps, SearchFilter } from '../../../utils/SearchFilter.utils';

type listAllProps = {
  page: number;
  pagesize: number;
  orderby?: string;
  search?: string;
};

@Injectable()
export class ProductsService {
  readonly spaceLink = process.env.SPACE;

  readonly fieldsSearch: FieldsProps[] = [
    {
      name: 'descricao',
      type: 'string',
    },
    {
      name: 'codigo',
      type: 'number',
    },
    {
      name: 'codigoAlternativo',
      type: 'string',
    },
    {
      name: 'referencia',
      type: 'string',
    },
  ];

  constructor(
    private prisma: PrismaService,
    private variationsProduct: VariationsProduct,
    private agroupGridProduct: AgroupGridProduct,
    private readonly listingRule: ListingRule,
    private readonly searchFilter: SearchFilter,
    private readonly orderbyNormalized: OrderBy,
  ) {}

  async findAll({ page, pagesize, search, orderby }: listAllProps) {
    const orderByNormalized = this.orderbyNormalized.execute(orderby);

    const products = await this.prisma.produto.findMany({
      take: pagesize,
      skip: page * pagesize,
      select: {
        eAtivo: true,
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        descricaoAdicional: true,
        precoVenda: true,
        imagemPreview: true,
      },
      orderBy: [orderByNormalized] ?? [{ codigo: 'desc' }],
      where: {
        AND: [
          {
            OR: this.searchFilter.execute(search, this.fieldsSearch),
          },
        ],
      },
    });

    const total = await this.prisma.produto.count({
      where: {
        AND: [
          {
            OR: this.searchFilter.execute(search, this.fieldsSearch),
          },
        ],
      },
    });

    return {
      data: products,
      page,
      pagesize,
      total: total,
    };
  }

  async findOne(codigo: number) {
    const product = await this.prisma.produto.findFirst({
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        descricaoComplementar: true,
        descricaoAdicional: true,
        possuiFoto: true,
        precoVendaEmpresa: true,
        ncm: true,
        obs: true,
        qtdEmbalagem: true,
        imagemPreview: true,
        eAtivo: true,
        unidade: {
          select: {
            unidade: true,
            descricao: true,
          },
        },
        grupo: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        subGrupo: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        precoVenda: true,
        marca: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        colecao: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        genero: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        linha: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        corPrimaria: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
        imagens: {
          select: {
            nome: true,
          },
        },
        corSecundariaCodigo: true,
        corSecundaria: {
          select: {
            cor: {
              select: {
                codigo: true,
                descricao: true,
              },
            },
          },
        },

        listaPreco: {
          select: {
            id: true,
            descricao: true,
            valor: true,
            codigo: true,
          },
          where: {
            codigo: {
              in: [28, 42, 56, 300],
            },
          },
          orderBy: {
            codigo: 'asc',
          },
        },
        locaisEstoque: {
          orderBy: {
            data: 'asc',
          },
          select: {
            id: true,
            periodo: true,
            descricao: true,
            quantidade: true,
          },
          where: {
            ...this.listingRule.execute().locaisEstoque.some,
          },
        },
      },
      where: {
        AND: [{ codigo }],
      },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    const variacoes = await this.variationsProduct.execute({
      alternativeCode: product.codigoAlternativo,
      query: this.listingRule.execute(),
    });
    const grades = await this.agroupGridProduct.execute({
      reference: product.referencia,
    });

    return { ...product, variacoes, grades };
  }
}
