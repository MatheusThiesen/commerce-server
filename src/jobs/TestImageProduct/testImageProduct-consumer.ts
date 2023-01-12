import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../../modules/products/products.service';

@Processor('testImageProduct-queue')
class TestImageProductConsumer {
  constructor(
    private prisma: PrismaService,
    private productService: ProductsService,
  ) {}

  @Process('testImageProduct-job')
  async executeJob(_job: Job<string>) {
    // const reference = job.data;

    const productExists = await this.prisma.produto.findMany({
      distinct: 'referencia',
      select: {
        referencia: true,
      },
      where: {
        subGrupo: {
          eVenda: true,
        },
        precoVenda: {
          gte: 1,
        },
        eAtivo: true,
        possuiFoto: false,
        locaisEstoque: {
          some: {
            quantidade: {
              gte: 1,
            },
          },
        },
      },
    });

    try {
      let count = 0;
      for (const product of productExists) {
        const testImageReference = await this.productService.testImage(
          product.referencia,
        );

        if (testImageReference) {
          await this.prisma.produto.updateMany({
            data: {
              possuiFoto: true,
            },
            where: {
              referencia: product.referencia,
            },
          });
        }

        count++;
      }

      console.log(
        `Teste fotos dos produtos ${count} de ${productExists.length}`,
      );
    } catch (error) {
      console.log(error);
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

export { TestImageProductConsumer };
