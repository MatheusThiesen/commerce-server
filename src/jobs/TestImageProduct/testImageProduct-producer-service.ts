import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
class TestImageProductProducerService {
  constructor(@InjectQueue('testImageProduct-queue') private queue: Queue) {}

  async execute({ reference }: { reference?: string }) {
    await this.queue.add('testImageProduct-job', reference);
  }
}

export { TestImageProductProducerService };
