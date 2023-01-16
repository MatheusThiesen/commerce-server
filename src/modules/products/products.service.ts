import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
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
  readonly listingRule = {
    // subGrupo: {
    //   eVenda: true,
    // },
    // possuiFoto: true,

    marca: {
      eVenda: true,
    },
    grupo: {
      eVenda: true,
    },
    precoVenda: {
      gt: 0,
    },
    eAtivo: true,
    locaisEstoque: {
      some: {
        quantidade: {
          gt: 0,
        },
      },
    },
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

    const productExist = await this.findOne(codigo);

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
          return { possuiFoto: Boolean(Number(filterGroup.data[0])) };
        }

        return {
          [filterGroup.value as string]: {
            in: filterGroup.data.map((item) => item.value),
          },
        };
      });
    }

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
              quantidade: {
                gt: 0,
              },
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
        ...this.listingRule,

        marcaCodigo: user.eVendedor
          ? {
              in: user.vendedor.marcas.map((marca) => marca.codigo),
            }
          : undefined,
        AND: filterNormalized,
      },
    });
    const productsTotal = await this.prisma.produto.findMany({
      distinct: distinct ? (distinct as any) : undefined,
      select: { codigo: true },
      where: {
        marcaCodigo: user.eVendedor
          ? {
              in: user.vendedor.marcas.map((marca) => marca.codigo),
            }
          : undefined,
        ...this.listingRule,
        AND: filterNormalized,
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
        ...this.listingRule,
        marcaCodigo: user.eVendedor
          ? {
              in: user.vendedor.marcas.map((marca) => marca.codigo),
            }
          : undefined,
      },
    });
  }

  async findOne(codigo: number) {
    const product = await this.prisma.produto.findUnique({
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
            quantidade: {
              gt: 0,
            },
          },
        },
      },
      where: {
        codigo,
      },
    });

    if (!product) {
      throw new BadRequestException('Product does not exist');
    }

    const variacoes = await this.variationsProduct.execute({
      alternativeCode: product.codigoAlternativo,
      query: this.listingRule,
    });
    const grades = await this.agroupGridProduct.execute({
      reference: product.referencia,
      query: this.listingRule,
    });

    return { ...product, variacoes, grades };
  }

  async remove(codigo: number) {
    await this.findOne(codigo);
    await this.prisma.produto.delete({ where: { codigo } });
    return;
  }

  async import(file: Express.Multer.File) {
    const products = await this.parseCsv.execute(file);

    for (const productsArr of products) {
      const [
        codigo,
        eAtivo,
        codigoAlternativo,
        referencia,
        descricao,
        descricaoComplementar,
        descricaoAdicional,
        precoVenda,
        unidade,
        marcaCodigo,
        corPrimariaCodigo,
        corSecundariaCodigo,
        colecaoCodigo,
        linhaCodigo,
        grupoCodigo,
        subgrupoCodigo,
        generoCodigo,
        precoVendaEmpresa,
      ] = productsArr;

      const product = new Product();
      Object.assign(product, {
        codigo: Number(codigo),
        eAtivo: Number(eAtivo) === 2,
        codigoAlternativo,
        referencia,
        descricao,
        descricaoComplementar,
        descricaoAdicional,
        precoVenda: Number(precoVenda),
        unidade,
        marcaCodigo: this.stringToNumberOrUndefined.execute(marcaCodigo),
        corPrimariaCodigo:
          this.stringToNumberOrUndefined.execute(corPrimariaCodigo),
        corSecundariaCodigo:
          this.stringToNumberOrUndefined.execute(corSecundariaCodigo),
        colecaoCodigo: this.stringToNumberOrUndefined.execute(colecaoCodigo),
        linhaCodigo: this.stringToNumberOrUndefined.execute(linhaCodigo),
        grupoCodigo: this.stringToNumberOrUndefined.execute(grupoCodigo),
        subgrupoCodigo: this.stringToNumberOrUndefined.execute(subgrupoCodigo),
        generoCodigo: this.stringToNumberOrUndefined.execute(generoCodigo),
        precoVendaEmpresa:
          this.stringToNumberOrUndefined.execute(precoVendaEmpresa),
      });
      const productExists = await this.prisma.produto.findUnique({
        where: {
          codigo: Number(codigo),
        },
      });

      try {
        if (productExists) {
          await this.update(product.codigo, product);
        } else {
          await this.create(product);
        }
      } catch (error) {
        console.log('erro aqui');
        console.log(error);
      }
    }

    await this.testImageProductProducerService.execute({});

    return;
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
}
