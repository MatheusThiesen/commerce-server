import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

interface IMailAttachment {
  filename: string;
  content?: any;
  path?: string;
  contentType?: string;
  cid?: string;
  encoding?: string;
  contentDisposition?: 'attachment' | 'inline';
  href?: string;
}

export interface IMailMessage {
  subject: string;
  html: string;
  attachments?: IMailAttachment[];
}

export interface IMailTo {
  name: string | undefined;
  email: string | undefined;
}

export interface MessageDTO {
  to: IMailTo[];
  cp?: IMailTo[];
  message: IMailMessage;
}

@Injectable()
class sendMailProducerService {
  constructor(@InjectQueue('sendMail-queue') private queue: Queue) {}

  async execute(dto: MessageDTO) {
    await this.queue.add('sendMail-job', dto);
  }
}

export { sendMailProducerService };
