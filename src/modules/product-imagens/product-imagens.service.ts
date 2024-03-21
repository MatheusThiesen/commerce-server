import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImage } from './entities/product-imagen.entity';

@Injectable()
export class ProductImagensService {
  constructor(private prisma: PrismaService, private parseCsv: ParseCsv) {}

  async create(createProductImageDto: CreateProductImageDto) {
    const productImage = new ProductImage();
    Object.assign(productImage, createProductImageDto);

    const productImageExists = await this.prisma.produtoImagem.findUnique({
      select: {
        id: true,
      },
      where: {
        produtoCodigo_nome_sequencia: {
          nome: productImage.nome,
          sequencia: productImage.sequencia,
          produtoCodigo: productImage.produtoCodigo,
        },
      },
    });

    if (productImageExists) {
      return await this.update(productImageExists.id, productImage);
    }

    const existProduct = await this.prisma.produto.findUnique({
      select: {
        codigo: true,
        referencia: true,
        imagemPreview: true,
      },
      where: {
        codigo: productImage.produtoCodigo,
      },
    });

    if (!existProduct) {
      throw new BadRequestException('Product does not exist');
    }

    const [referenceFile] = productImage.nome.split('_');

    if (referenceFile.toUpperCase() !== existProduct.referencia.toUpperCase()) {
      throw new BadRequestException(`References don't match`);
    }

    const findFirstImage = await this.prisma.produtoImagem.findFirst({
      select: {
        nome: true,
      },
      where: {
        produtoCodigo: productImage.produtoCodigo,
      },
      orderBy: {
        sequencia: 'asc',
        nome: 'asc',
      },
    });

    await this.prisma.produto.update({
      data: {
        possuiFoto: true,
        imagemPreview:
          existProduct.imagemPreview !== findFirstImage.nome
            ? findFirstImage.nome
            : undefined,
      },
      where: {
        codigo: existProduct.codigo,
      },
    });

    const createdProductImage = await this.prisma.produtoImagem.create({
      data: productImage,
    });

    return createdProductImage;
  }

  async findOne(id: string) {
    const productImage = await this.prisma.produtoImagem.findUnique({
      select: {
        id: true,
      },
      where: {
        id,
      },
    });

    if (!productImage) {
      throw new BadRequestException('productImage does not exist');
    }

    return productImage;
  }

  async update(id: string, updateProductImageDto: UpdateProductImageDto) {
    const productImage = new ProductImage();
    Object.assign(productImage, updateProductImageDto);

    await this.findOne(id);

    const existProduct = await this.prisma.produto.findUnique({
      select: {
        codigo: true,
        referencia: true,
      },
      where: {
        codigo: productImage.produtoCodigo,
      },
    });

    if (!existProduct) {
      throw new BadRequestException('Product does not exist');
    }

    const [referenceFile] = productImage.nome.split('_');

    if (referenceFile.toUpperCase() !== existProduct.referencia.toUpperCase()) {
      throw new BadRequestException(`References don't match`);
    }

    await this.prisma.produto.update({
      data: {
        possuiFoto: true,
      },
      where: {
        codigo: existProduct.codigo,
      },
    });

    const updatedProductImage = await this.prisma.produtoImagem.update({
      data: productImage,
      where: { id },
    });

    return updatedProductImage;
  }

  async import(file: Express.Multer.File) {
    const imagens = await this.parseCsv.execute(file);

    for (const imageArr of imagens) {
      const [imagemNome, sequencia, produtoCod] = imageArr;

      const productImage = new ProductImage();

      Object.assign(productImage, {
        nome: String(imagemNome),
        sequencia: Number(sequencia),
        produtoCodigo: Number(produtoCod),
      });

      try {
        const productImageExists = await this.prisma.produtoImagem.findUnique({
          select: {
            id: true,
          },
          where: {
            produtoCodigo_nome_sequencia: {
              nome: productImage.nome,
              sequencia: productImage.sequencia,
              produtoCodigo: productImage.produtoCodigo,
            },
          },
        });

        if (productImageExists) {
          await this.update(productImageExists.id, productImage);
        } else {
          await this.create(productImage);
        }
      } catch (error) {
        console.log(productImage);
        console.log(error);
      }
    }

    return;
  }
}
