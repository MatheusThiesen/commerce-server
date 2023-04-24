import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateManyProductsProducerService } from 'src/jobs/CreateManyProducts/createManyProducts-producer-service';
import { PrismaService } from '../../database/prisma.service';
import { TestImageProductProducerService } from '../../jobs/TestImageProduct/testImageProduct-producer-service';
import { GroupByObj } from '../../utils/GroupByObj.utils';
import { OrderBy } from '../../utils/OrderBy.utils';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { StringToNumberOrUndefined } from '../../utils/StringToNumberOrUndefined.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { ItemFilter } from './dto/query-products.type';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { AgroupGridProduct } from './useCases/AgroupGridProduct';
import {
  GridProps,
  PageData,
  VariationsProps,
} from './useCases/GenerateCatalog';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { VariationsProduct } from './useCases/VariationsProduct';

type listAllProps = {
  page: number;
  pagesize: number;
  orderBy: string;
  filters: ItemFilter[];
  userId: string;
  distinct?: string;
  isReport?: boolean;
};

@Injectable()
export class ProductsService {
  readonly spaceLink = 'https://alpar.sfo3.digitaloceanspaces.com/';

  listingRule = () => {
    const now = new Date();
    const month = now.toLocaleString('pt-br', {
      month: '2-digit',
    });
    const year = now.toLocaleString('pt-br', {
      year: 'numeric',
    });

    const rule = {
      // subGrupo: {
      //   eVenda: true,
      // },
      // possuiFoto: true,
      // precoVenda: {
      //   gt: 0,
      // },

      marca: {
        eVenda: true,
      },
      grupo: {
        eVenda: true,
      },
      eAtivo: true,
      locaisEstoque: {
        some: {
          quantidade: {
            gt: 0,
          },
          OR: [
            {
              periodo: 'pronta-entrega',
            },
            {
              data: {
                gte: new Date(`${year}-${month}-01T00:00`),
              },
            },
          ],
        },
      },
    };

    return rule;
  };

  constructor(
    private readonly httpService: HttpService,
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private orderBy: OrderBy,
    private stringToNumberOrUndefined: StringToNumberOrUndefined,
    private listProductsFilters: ListProductsFilters,
    private variationsProduct: VariationsProduct,
    private agroupGridProduct: AgroupGridProduct,
    private readonly testImageProductProducerService: TestImageProductProducerService,
    private readonly createManyProductsProducerService: CreateManyProductsProducerService,
    private readonly groupByObj: GroupByObj,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = new Product();
    Object.assign(product, { ...createProductDto, possuiFoto: false });

    const productVerifyRelation = await this.verifyRelation(product);

    const productExists = await this.prisma.produto.findUnique({
      where: {
        codigo: product.codigo,
      },
    });

    if (productExists) {
      throw new Error('Product already exists');
    }

    const createdProduct = await this.prisma.produto.create({
      data: {
        ...productVerifyRelation,
        corSecundaria: !!productVerifyRelation.corSecundariaCodigo
          ? {
              create: {
                corCodigo: productVerifyRelation.corSecundariaCodigo,
              },
            }
          : undefined,
      },
    });

    return createdProduct;
  }

  async update(codigo: number, updateProductDto: UpdateProductDto) {
    const product = new Product();
    Object.assign(product, updateProductDto);
    const productVerifyRelation = await this.verifyRelation(product);

    const productExist = await this.prisma.produto.findUnique({
      where: { codigo },
      select: { codigo: true, corSecundariaCodigo: true, corSecundaria: true },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    if (
      productVerifyRelation.corSecundariaCodigo >= 1 &&
      productExist.corSecundariaCodigo !==
        productVerifyRelation.corSecundariaCodigo
    ) {
      if (productExist.corSecundaria) {
        await this.prisma.produto.update({
          data: {
            corSecundaria: {
              delete: true,
            },
          },
          where: {
            codigo: productExist.codigo,
          },
        });
      }
      await this.prisma.produto.update({
        data: {
          corSecundariaCodigo: product.corSecundariaCodigo,
          corSecundaria: {
            create: {
              corCodigo: product.corSecundariaCodigo,
            },
          },
        },
        where: {
          codigo: productExist.codigo,
        },
      });
    }

    const updatedProduct = await this.prisma.produto.update({
      data: productVerifyRelation,
      where: { codigo },
    });

    return updatedProduct;
  }

  async findAll({
    page,
    pagesize,
    orderBy,
    filters,
    userId,
    distinct,
    isReport,
  }: listAllProps) {
    const user = await this.prisma.usuario.findUnique({
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

    const orderByNormalized = this.orderBy.execute(orderBy);

    let filterNormalized = [];

    if (filters) {
      const groupFilters = this.groupByObj.execute(
        filters,
        (item) => item.name,
      );

      filterNormalized = groupFilters.map((filterGroup) => {
        if (filterGroup.value === 'locaisEstoque') {
          return {
            locaisEstoque: {
              some: {
                ...this.listingRule().locaisEstoque.some,
                periodo: {
                  in: filterGroup.data.map((item) => item.value),
                },
              },
            },
          };
        }

        if (filterGroup.value === 'concept') {
          return {
            subGrupo: {
              regraProdutoConceito: {
                some: {
                  conceitoCodigo: {
                    in: filterGroup.data.map((item) => item.value),
                  },
                },
              },
            },
          };
        }

        if (filterGroup.value === 'possuiFoto') {
          return { possuiFoto: Boolean(Number(filterGroup.data[0].value)) };
        }

        return {
          [filterGroup.value as string]: {
            in: filterGroup.data.map((item) => item.value),
          },
        };
      });
    }

    // console.log(JSON.stringify(filterNormalized, null, 2));

    const reportAddSelect = isReport
      ? {
          precoVendaEmpresa: true,
          linha: {
            select: {
              codigo: true,
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
          genero: {
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
          locaisEstoque: {
            orderBy: {
              periodo: 'asc',
            },
            select: {
              id: true,
              descricao: true,
              quantidade: true,
            },
            where: {
              ...this.listingRule().locaisEstoque.some,
            },
          },
        }
      : {};

    const products = await this.prisma.produto.findMany({
      distinct: distinct ? (distinct as any) : undefined,
      take: pagesize,
      skip: page * pagesize,
      orderBy: [orderByNormalized, { referencia: 'asc' }] ?? [
        { codigo: 'desc' },
        { referencia: 'asc' },
      ],
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        descricaoAdicional: true,
        precoVenda: true,

        marca: {
          select: {
            codigo: true,
            descricao: true,
          },
        },

        ...(reportAddSelect as any),
      },
      where: {
        AND: [
          ...filterNormalized,
          this.listingRule(),
          {
            marcaCodigo: user.eVendedor
              ? {
                  in: user.vendedor.marcas.map((marca) => marca.codigo),
                }
              : undefined,
          },
        ],
      },
    });

    const productsTotal = await this.prisma.produto.findMany({
      distinct: distinct ? (distinct as any) : undefined,
      select: { codigo: true },
      where: {
        AND: [
          ...filterNormalized,
          this.listingRule(),
          {
            marcaCodigo: user.eVendedor
              ? {
                  in: user.vendedor.marcas.map((marca) => marca.codigo),
                }
              : undefined,
          },
        ],
      },
    });

    return {
      data: products,
      page,
      pagesize,
      total: productsTotal.length,
    };
  }

  async getFiltersForFindAll(userId: string) {
    const user = await this.prisma.usuario.findUnique({
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
    return await this.listProductsFilters.execute({
      where: {
        ...this.listingRule(),
        marcaCodigo: user.eVendedor
          ? {
              in: user.vendedor.marcas.map((marca) => marca.codigo),
            }
          : undefined,
      },
    });
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
        unidade: true,
        possuiFoto: true,
        precoVendaEmpresa: true,
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
            descricao: true,
            quantidade: true,
          },
          where: {
            ...this.listingRule().locaisEstoque.some,
          },
        },
      },
      where: {
        AND: [{ codigo }, { ...this.listingRule() }],
      },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    const variacoes = await this.variationsProduct.execute({
      alternativeCode: product.codigoAlternativo,
      query: this.listingRule(),
    });
    const grades = await this.agroupGridProduct.execute({
      reference: product.referencia,
      query: this.listingRule(),
    });

    return { ...product, variacoes, grades };
  }

  async remove(codigo: number) {
    const product = await this.prisma.produto.findUnique({
      where: { codigo },
      select: { codigo: true },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    await this.prisma.produto.delete({ where: { codigo } });
    return;
  }

  async import(file: Express.Multer.File) {
    const products = await this.parseCsv.execute(file);
    await this.createManyProductsProducerService.execute({
      products,
    });

    return;
  }

  async listCatalog(id: string) {
    const catalogo = await this.prisma.catalogoProduto.findUnique({
      select: {
        id: true,
        orderBy: true,
        isGroupProduct: true,
        isStockLocation: true,
        qtdAcessos: true,
      },
      where: {
        id,
      },
    });

    await this.prisma.catalogoProduto.update({
      data: {
        qtdAcessos: ++catalogo.qtdAcessos,
      },
      where: {
        id,
      },
    });

    const products = await this.prisma.produto.findMany({
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
        locaisEstoque: {
          select: {
            descricao: true,
            quantidade: true,
          },
        },
      },
      where: {
        CatalogoProduto: {
          some: {
            id: catalogo.id,
          },
        },
        ...this.listingRule(),
      },
      orderBy: [
        {
          generoCodigo: 'asc',
        },
        this.orderBy.execute(catalogo.orderBy),
      ],
    });

    const productsNormalized: PageData[] = [];
    for (const product of products) {
      const grids: GridProps[] = (
        await this.agroupGridProduct.execute({
          reference: product.referencia,
          query: this.listingRule(),
        })
      ).map((grid) => ({
        name: `${grid.codigo} - ${grid.descricaoAdicional} - PDV: ${grid.precoVenda}`,
        stocks: grid.locaisEstoque.map((stock) => ({
          description: stock.descricao,
          qtd: stock.quantidade,
        })),
      }));

      let variations: VariationsProps[] = [];

      if (!!catalogo.isGroupProduct) {
        const getVariationsProduct = await this.variationsProduct.execute({
          alternativeCode: product.codigoAlternativo,
          query: this.listingRule(),
        });

        variations = getVariationsProduct
          .filter((f) => f.referencia !== product.referencia)
          .map((v) => ({
            imageMain:
              `${this.spaceLink}Produtos/${product.referencia}_01` as string,
            reference: v.referencia,
          }));
      }

      const newPage: PageData = {
        isGroupProduct: !!catalogo.isGroupProduct,
        isStockLocation: !!catalogo.isStockLocation,
        variations: variations,

        imageMain:
          `${this.spaceLink}Produtos/${product.referencia}_01` as string,
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
    };
  }

  async verifyRelation(product: Product): Promise<Product> {
    const alreadyExistBrand = await this.prisma.marca.findUnique({
      where: {
        codigo: product.marcaCodigo,
      },
    });
    if (!alreadyExistBrand) throw new Error('Brand not already exists');

    const alreadyExistColorPrimary = await this.prisma.cor.findUnique({
      where: {
        codigo: product.corPrimariaCodigo,
      },
    });
    if (!alreadyExistColorPrimary) delete product.corPrimariaCodigo;

    const alreadyExistColorSecondary = await this.prisma.cor.findUnique({
      where: {
        codigo: product.corSecundariaCodigo,
      },
    });
    if (!alreadyExistColorSecondary) delete product.corSecundariaCodigo;

    const alreadyExistCollection = await this.prisma.colecao.findUnique({
      where: {
        codigo: product.colecaoCodigo,
      },
    });
    if (!alreadyExistCollection) delete product.colecaoCodigo;

    const alreadyExistLine = await this.prisma.linha.findUnique({
      where: {
        codigo: product.linhaCodigo,
      },
    });
    if (!alreadyExistLine) delete product.linhaCodigo;

    const alreadyExistGroup = await this.prisma.grupo.findUnique({
      where: {
        codigo: product.grupoCodigo,
      },
    });
    if (!alreadyExistGroup) delete product.grupoCodigo;

    const alreadyExistSubgroup = await this.prisma.subGrupo.findUnique({
      where: {
        codigo_codigoGrupo: {
          codigo: product.subgrupoCodigo,
          codigoGrupo: product.grupoCodigo,
        },
      },
    });
    delete product.subgrupoCodigo;
    if (alreadyExistSubgroup) product.subGrupoId = alreadyExistSubgroup.id;

    return product;
  }

  async testImage(reference: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<any>(
            `https://alpar.sfo3.digitaloceanspaces.com/?prefix=Produtos%2F${reference}_01&max-keys=10`,
          )
          .pipe(
            catchError((_error: AxiosError) => {
              throw 'An error happened!';
            }),
          ),
      );

      const findImage = String(response.data).indexOf('<Contents>');

      return findImage === -1 ? false : true;
    } catch (error) {
      return false;
    }
  }
  async testImageJob(reference?: string) {
    await this.testImageProductProducerService.execute({ reference });
    return;
  }

  normalizedMonth(datePeriod: Date, type: 'period' | 'name') {
    const normalizedDate = datePeriod;
    const day = normalizedDate.toLocaleString('pt-br', {
      day: '2-digit',
    });
    const month = normalizedDate.toLocaleString('pt-br', {
      month: '2-digit',
    });
    const year = normalizedDate.toLocaleString('pt-br', {
      year: 'numeric',
    });

    const dateMonthLong = new Date(`${month}/${day}/${year}`).toLocaleString(
      'pt-br',
      {
        month: 'long',
      },
    );

    if (type === 'period') {
      return `${month}-${year}`;
    } else {
      return `${
        dateMonthLong[0].toUpperCase() + dateMonthLong.substring(1)
      } ${year}`;
    }
  }
}
