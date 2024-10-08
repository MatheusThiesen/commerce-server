import { ListProductsFilters } from '@/modules/app/products/useCases/ListProductsFilters';
import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  // OnQueueActive,
  // OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import Redis from 'ioredis';

@Processor('updateCacheProductsFilters-queue')
class UpdateCacheProductsFiltersConsumer {
  constructor(
    private listProductsFilters: ListProductsFilters,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Process('updateCacheProductsFilters-job')
  async executeJob(job: Job<any>) {
    const normalized = await this.listProductsFilters.execute({
      filters: job.data.filters,
    });

    await this.redis.set(
      job.data.cacheKey,
      JSON.stringify(normalized),
      'EX',
      60 * 60 * 24 * 1,
    );

    try {
    } catch (error) {
      console.log(error);
    }

    return {};
  }

  @OnQueueError()
  onError(error) {
    console.log(error);
  }

  // @OnQueueActive()
  // onActive(job: Job) {
  //   console.log(
  //     `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueCompleted()
  // onCompleted(job: Job, result: any) {
  //   console.log(`Completed job ${job.id} of type ${job.name}`);
  //   console.log(result);
  // }
}

export { UpdateCacheProductsFiltersConsumer };
