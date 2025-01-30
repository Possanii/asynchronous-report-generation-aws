import { paginateScan } from '@aws-sdk/client-dynamodb';
import { dynamoClient } from '../../client/dynamoClient';
import { env } from '../../config/env';

export async function handler() {
  const paginator = paginateScan(
    { client: dynamoClient, pageSize: 50 },
    { TableName: env.DYNAMO_LEADS_TABLE }
  );

  for await (const { Count } of paginator) {
    console.log({ Count });
  }
}
