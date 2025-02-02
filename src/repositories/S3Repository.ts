import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3Client } from '../client/s3Client';
import { IBucketRepository } from '../interfaces/IBucketRepository';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Repository implements IBucketRepository {
  private s3: S3Client;

  constructor() {
    this.s3 = s3Client;
  }

  async getPresignedUrl(bucketName: string, fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: 24 * 60 * 60, // 24 hours
    });

    return url;
  }
}
