import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { OrderService } from 'src/modules/order/order.service';

@Processor('sendOrderErpApi-queue')
class SendOrderErpApiConsumer {
  constructor(private orderService: OrderService) {}

  @Process('sendOrderErpApi-job')
  async executeJob(job: Job<{ orderCode: number }>) {
    await this.orderService.sendApiErp(job.data.orderCode);

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

export { SendOrderErpApiConsumer };
