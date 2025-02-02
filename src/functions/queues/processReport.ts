import { mbToBytes } from '../../utils/mbToBytes';
import { LeadsRepository } from '../../repositories/Leads';
import { S3MPUManager } from '../../repositories/S3MPUManager';
import { env } from '../../config/env';
import { S3Repository } from '../../repositories/S3Repository';
import { SESGateway } from '../../gateways/SESGateway';

const minChunkSize = mbToBytes(6);

export async function handler() {
  const fileKey = `${new Date().toISOString()}-leads.csv`;

  const leadsRepository = new LeadsRepository();
  const mpu = new S3MPUManager(env.S3_REPORTS_BUCKET_NAME ?? '', fileKey);

  await mpu.start();

  try {
    const header = 'ID,Nome,E-mail,Cargo\n';

    let currentChunk = header;

    for await (const { Items = [] } of leadsRepository.getLeadsGenerator()) {
      currentChunk += Items.map(
        (item) =>
          item.id.S +
          ',' +
          item.name.S +
          ',' +
          item.email.S +
          ',' +
          item.jobTitle.S +
          '\n'
      ).join('');

      const currentChunkSize = Buffer.byteLength(currentChunk, 'utf-8');

      if (currentChunkSize < minChunkSize) {
        continue;
      }

      console.log('Reached 6MB! Sending report to S3');

      await mpu.uploadPart(Buffer.from(currentChunk, 'utf-8'));

      currentChunk = '';
    }

    if (currentChunk) {
      console.log('There are some chunks remaining! Sending report to S3');

      await mpu.uploadPart(Buffer.from(currentChunk, 'utf-8'));
    }

    await mpu.complete();
  } catch {
    await mpu.abort();
  }

  const s3Repository = new S3Repository();

  const presignedUrl = await s3Repository.getPresignedUrl(
    env.S3_REPORTS_BUCKET_NAME ?? '',
    fileKey
  );

  const emailGateway = new SESGateway();

  await emailGateway.sendEmail({
    from: env.AWS_SOURCE_SENDER_EMAIL ?? '',
    to: [env.AWS_CUSTOMER_RECIPIENT_EMAIL ?? ''],
    subject: 'Leads Report',
    html: `<p>Hi there!</p><p>Here is the link to download the leads report: <a href="${presignedUrl}">${presignedUrl}</a></p>`,
  });
}
