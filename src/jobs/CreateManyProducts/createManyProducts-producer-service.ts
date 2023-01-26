import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
class CreateManyProductsProducerService {
  constructor(@InjectQueue('createManyProducts-queue') private queue: Queue) {}

  async execute({ products }: { products: any }) {
    await this.queue.add('createManyProducts-job', { products });
  }
}

export { CreateManyProductsProducerService };
