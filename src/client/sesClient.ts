import { SESClient } from '@aws-sdk/client-ses';

export const sesClient = new SESClient({
  region: 'us-east-1',
});
