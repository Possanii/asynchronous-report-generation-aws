import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../client/sesClient';
import { IEmailGateway, ISendEmailParams } from '../interfaces/IEmailGateway';

export class SESGateway implements IEmailGateway {
  async sendEmail({
    from,
    to,
    subject,
    html,
  }: ISendEmailParams): Promise<void> {
    const sendEmailCommand = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Subject: {
          Charset: 'utf-8',
          Data: subject,
        },
        Body: {
          Html: {
            Charset: 'utf-8',
            Data: html,
          },
        },
      },
    });

    await sesClient.send(sendEmailCommand);
  }
}
