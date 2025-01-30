import { mbToBytes } from '../../utils/mbToBytes';
import { LeadsRepository } from '../../repositories/Leads';

const minChunkSize = mbToBytes(6);

export async function handler() {
  const leadsRepository = new LeadsRepository();

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

    if (currentChunk) {
      console.log('Reached 6MB! Sending report to S3');
    }

    currentChunk = '';
  }

  if (currentChunk) {
    console.log('There are some chunks remaining! Sending report to S3');
  }
}
