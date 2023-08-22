import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
class SendOrderErpApiProducerService {
  constructor(@InjectQueue('sendOrderErpApi-queue') private queue: Queue) {}

  async execute({ orderCode }: { orderCode: number }) {
    await this.queue.add('sendOrderErpApi-job', { orderCode });
  }
}

export { SendOrderErpApiProducerService };
