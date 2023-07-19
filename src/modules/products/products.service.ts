import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateManyProductsProducerService } from 'src/jobs/CreateManyProducts/createManyProducts-producer-service';
import { UpdateCacheProductsFiltersProducerService } from 'src/jobs/UpdateCacheProductsFilters/updateCacheProductsFilters-producer-service';
import { PrismaService } from '../../database/prisma.service';
import { TestImageProductProducerService } from '../../jobs/TestImageProduct/testImageProduct-producer-service';
import { OrderBy } from '../../utils/OrderBy.utils';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { FieldsProps, SearchFilter } from '../../utils/SearchFilter.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { ItemFilter } from './dto/query-products.type';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { AgroupGridProduct } from './useCases/AgroupGridProduct';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { ListingRule } from './useCases/ListingRule';
import { VariationsProduct } from './useCases/VariationsProduct';
import { FilterOrderNormalized } from './useCases/filterOrderNormalized';

type listAllProps = {
  page: number;
  pagesize: number;
  orderBy: string;
  filters: ItemFilter[];
  userId: string;
  distinct?: string;
  isReport?: number;
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
    private readonly httpService: HttpService,
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private orderBy: OrderBy,
    private listProductsFilters: ListProductsFilters,
    private variationsProduct: VariationsProduct,
    private agroupGridProduct: AgroupGridProduct,
    private readonly testImageProductProducerService: TestImageProductProducerService,
    private readonly createManyProductsProducerService: CreateManyProductsProducerService,
    private readonly updateCacheProductsFiltersProducerService: UpdateCacheProductsFiltersProducerService,
    private readonly listingRule: ListingRule,
    private readonly filterOrderNormalized: FilterOrderNormalized,
    private readonly searchFilter: SearchFilter,
    @InjectRedis() private readonly redis: Redis,
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
    filters = [],
    userId,
    distinct,
    isReport,
    search,
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

    const filterNormalized = await this.filterOrderNormalized.execute(filters);

    const reportAddSelect =
      Number(isReport) > 0
        ? {
            precoVendaEmpresa: true,
            qtdEmbalagem: true,
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
            marca: {
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
                periodo: true,
                descricao: true,
                quantidade: true,
              },
              where: {
                ...this.listingRule.execute().locaisEstoque.some,
              },
            },
          }
        : {};

    const products = await this.prisma.produto.findMany({
      distinct: distinct ? (distinct as any) : undefined,
      take: pagesize,
      skip: page * pagesize,

      orderBy: [
        {
          marca: {
            ornador: 'asc',
          },
        },
        {
          grupo: {
            ornador: 'asc',
          },
        },
        {
          genero: {
            ornador: 'asc',
          },
        },
        orderByNormalized,
        {
          codigo: 'desc',
        },
      ],
      select: {
        codigo: true,
        referencia: true,
        codigoAlternativo: true,
        descricao: true,
        descricaoAdicional: true,
        precoVenda: true,

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

        imagens: {
          take: 1,
          orderBy: { sequencia: 'asc' },
          select: {
            nome: true,
          },
        },

        ...(reportAddSelect as any),
      },
      where: {
        marcaCodigo:
          user.eVendedor && user.vendedor.marcas
            ? {
                in: user.vendedor.marcas.map((item) => item.codigo),
              }
            : undefined,
        AND: [
          filterNormalized,
          this.listingRule.execute(),
          { OR: this.searchFilter.execute(search, this.fieldsSearch) },
        ],
      },
    });

    return {
      data: products,
      page,
      pagesize,
      hasNextPage: products.length >= pagesize,
    };
  }

  async getFiltersForFindAll(userId: string, filters?: ItemFilter[]) {
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

    if (user.eVendedor) {
      user.vendedor.marcas.forEach((brand) => {
        filters.push({
          value: brand.codigo,
          name: 'marcaCodigo',
        });
      });
    }

    const filterNormalized = await this.filterOrderNormalized.execute(filters);

    const cacheKey = `products-filters-${filters
      .map((item) => `${item.name}-${item.value}`)
      .join('-')}`;
    const getCache = await this.redis.get(cacheKey);

    if (getCache) {
      this.updateCacheProductsFiltersProducerService.execute({
        filters: filterNormalized,
        cacheKey,
      });

      return JSON.parse(getCache);
    } else {
      const normalized = await this.listProductsFilters.execute({
        where: {
          ...this.listingRule.execute(),
          ...filterNormalized,
        },
      });

      await this.redis.set(
        cacheKey,
        JSON.stringify(normalized),
        'EX',
        60 * 60 * 24 * 1,
      );
      return normalized;
    }
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
        AND: [{ codigo }, { ...this.listingRule.execute() }],
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

  async verifyRelation(product: Product): Promise<Product> {
    const alreadyExistUnitMensure = await this.prisma.unidadeMedida.findUnique({
      where: {
        unidade: product?.unidadeMedida ?? '0',
      },
    });
    if (!alreadyExistUnitMensure && product?.unidadeMedida) {
      await this.prisma.unidadeMedida.create({
        data: {
          descricao: product?.unidadeMedidaDescricao ?? product?.unidadeMedida,
          unidade: product?.unidadeMedida,
        },
      });
    }

    delete product?.unidadeMedidaDescricao;

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
            `${this.spaceLink}/?prefix=Produtos%2F${reference}_01&max-keys=10`,
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
