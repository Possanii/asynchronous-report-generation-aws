import { mbToBytes } from '../../utils/mbToBytes';
import { LeadsRepository } from '../../repositories/Leads';
import { S3MPUManager } from '../../repositories/S3MPUManager';
import { env } from '../../config/env';

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
}
