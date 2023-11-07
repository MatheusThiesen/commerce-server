import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Product } from 'src/modules/products/entities/product.entity';
import { ParseCsv } from 'src/utils/ParseCsv.utils';
import { StringToNumberOrUndefined } from 'src/utils/StringToNumberOrUndefined.utils';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../../modules/products/products.service';

@Processor('createManyProducts-queue')
class CreateManyProductsConsumer {
  constructor(
    private prisma: PrismaService,
    private productService: ProductsService,
    private parseCsv: ParseCsv,
    private stringToNumberOrUndefined: StringToNumberOrUndefined,
  ) {}

  @Process('createManyProducts-job')
  async executeJob(job: Job<{ products: any }>) {
    for (const productsArr of job.data.products) {
      const [
        codigo,
        eAtivo,
        codigoAlternativo,
        referencia,
        descricao,
        descricaoComplementar,
        descricaoAdicional,
        precoVenda,
        marcaCodigo,
        corPrimariaCodigo,
        corSecundariaCodigo,
        colecaoCodigo,
        linhaCodigo,
        grupoCodigo,
        subgrupoCodigo,
        generoCodigo,
        precoVendaEmpresa,
        qtdEmbalagem,
        obs,
        ncm,
        unidadeMedida,
        unidadeMedidaDescricao,
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
        qtdEmbalagem: this.stringToNumberOrUndefined.execute(qtdEmbalagem),
        obs: obs,
        ncm: ncm,
        unidadeMedida: unidadeMedida,
        unidadeMedidaDescricao: unidadeMedidaDescricao,
      });

      const productExists = await this.prisma.produto.findUnique({
        where: {
          codigo: Number(codigo),
        },
      });

      try {
        if (productExists) {
          await this.productService.update(product.codigo, product);
        } else {
          await this.productService.create(product);
        }

        // await this.productService.testImageJob(product.referencia);
      } catch (error) {
        console.log(productsArr);
        console.log('erro aqui');
        console.log(error);
      }
    }

    return {};
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueError()
  onError(error) {
    console.log(error);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log(`Completed job ${job.id} of type ${job.name}`);
    console.log(result);
  }
}

export { CreateManyProductsConsumer };
