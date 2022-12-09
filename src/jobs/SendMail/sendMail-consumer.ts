import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { MessageDTO } from './sendMail-producer-service';

@Processor('sendMail-queue')
class sendMailConsumer {
  constructor(private mailService: MailerService) {}

  @Process('sendMail-job')
  async executeJob(job: Job<MessageDTO>) {
    const { message, to, cp } = job.data;

    await this.mailService.sendMail({
      to: to.map((m) => `${m.name} < ${m.email} >`),
      cc:
        !!cp && cp.length > 0
          ? cp.map((m) => `${m.name} < ${m.name} >`)
          : undefined,
      from: process.env.MAILER_FROM_EMAIL,
      subject: message.subject,
      html: message.html,
      attachments: !!message.attachments ? message.attachments : undefined,
    });
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name} with data...`);
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

export { sendMailConsumer };
