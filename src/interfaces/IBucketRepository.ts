export interface IBucketRepository {
  getPresignedUrl(bucketName: string, fileKey: string): Promise<string>;
}
