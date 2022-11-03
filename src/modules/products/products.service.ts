import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import { OrderBy } from '../../utils/OrderBy.utils';
import { ParseCsv } from '../../utils/ParseCsv.utils';
import { StringToNumberOrUndefined } from '../../utils/StringToNumberOrUndefined.utils';
import { CreateProductDto } from './dto/create-product.dto';
import { ItemFilter } from './dto/query-products.type';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ListProductsFilters } from './useCases/ListProductsFilters';
import { VariationsProduct } from './useCases/VariationsProduct';

@Injectable()
export class ProductsService {
  constructor(
    private readonly httpService: HttpService,
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private orderBy: OrderBy,
    private stringToNumberOrUndefined: StringToNumberOrUndefined,
    private listProductsFilters: ListProductsFilters,
    private variationsProduct: VariationsProduct,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const possuiFoto = await this.testImage(createProductDto.referencia);

    const product = new Product();
    Object.assign(product, { ...createProductDto, possuiFoto });

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
        corSecundaria: {
          create: {
            corCodigo: productVerifyRelation.corSecundariaCodigo,
          },
        },
      },
    });

    return createdProduct;
  }

  async update(codigo: number, updateProductDto: UpdateProductDto) {
    const possuiFoto = await this.testImage(updateProductDto.referencia);

    const product = new Product();
    Object.assign(product, { ...updateProductDto, possuiFoto });

    await this.findOne(codigo);

    const updatedProduct = await this.prisma.produto.update({
      data: {
        ...product,
        corSecundaria: {
          create: {
            corCodigo: product.corSecundariaCodigo,
          },
        },
      },
      where: { codigo },
    });

    return updatedProduct;
  }

  async findAll(
    page: number,
    pagesize: number,
    orderBy: string,
    filters: ItemFilter[],
  ) {
    const orderByNormalized = this.orderBy.execute(orderBy);
    const filtersAvailable = await this.listProductsFilters.execute({
      where: {
        eAtivo: true,
        possuiFoto: true,
        locaisEstoque: {
          some: {
            quantidade: {
              gte: 1,
            },
          },
        },
      },
    });

    const filterNormalized = filters
      ?.filter((filter) =>
        filtersAvailable.map((item) => item.name).includes(filter.name),
      )
      ?.map((filter) => {
        if (['locaisEstoque'].includes(filter.name)) {
          return {
            locaisEstoque: {
              some: {
                periodo: String(filter.value),
              },
            },
          };
        } else {
          return { [filter.name]: filter.value };
        }
      });

    const products = await this.prisma.produto.findMany({
      distinct: 'referencia',
      take: pagesize,
      skip: page * pagesize,
      orderBy: orderByNormalized ?? { codigo: 'desc' },
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
        colecao: {
          select: {
            codigo: true,
            descricao: true,
          },
        },
      },
      where: {
        eAtivo: true,
        possuiFoto: true,
        locaisEstoque: {
          some: {
            quantidade: {
              gte: 1,
            },
          },
        },
        AND: filterNormalized,
      },
    });
    const productsTotal = await this.prisma.produto.findMany({
      distinct: 'referencia',
      select: { codigo: true },
      where: {
        eAtivo: true,
        possuiFoto: true,
        locaisEstoque: {
          some: {
            quantidade: {
              gte: 1,
            },
          },
        },
        AND: filterNormalized,
      },
    });

    return {
      data: products,
      filters: filtersAvailable,
      page,
      pagesize,
      total: productsTotal.length,
    };
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
        grupo: {
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
      cod: product.codigo,
    });

    return { ...product, variacoes };
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
      ] = productsArr;

      const possuiFoto = await this.testImage(referencia);

      const product = new Product();
      Object.assign(product, {
        codigo: Number(codigo),
        eAtivo: Number(eAtivo) === 2,
        codigoAlternativo,
        referencia,
        descricao,
        descricaoComplementar,
        descricaoAdicional,
        possuiFoto,
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
      });

      const productExists = await this.prisma.produto.findUnique({
        where: {
          codigo: product.codigo,
        },
      });

      try {
        if (productExists) {
          await this.update(productExists.codigo, product);
        } else {
          await this.create(product);
        }
      } catch (error) {
        console.log(product);
        console.log(error);
      }
    }

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
        codigo: product.subgrupoCodigo,
      },
    });
    if (!alreadyExistSubgroup) delete product.subgrupoCodigo;

    // corSecundariaCodigo

    return product;
  }

  async testImage(reference: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService
          .get<any>(
            `https://alpar.sfo3.digitaloceanspaces.com/Produtos/${reference}_01`,
          )
          .pipe(
            catchError((_error: AxiosError) => {
              throw 'An error happened!';
            }),
          ),
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}
