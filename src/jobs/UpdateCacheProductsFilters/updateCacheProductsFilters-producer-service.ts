import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
class UpdateCacheProductsFiltersProducerService {
  constructor(
    @InjectQueue('updateCacheProductsFilters-queue') private queue: Queue,
  ) {}

  async execute({ filters, cacheKey }: { filters?: any; cacheKey: string }) {
    await this.queue.add('updateCacheProductsFilters-job', {
      filters,
      cacheKey,
    });
  }
}

export { UpdateCacheProductsFiltersProducerService };
