import {
  AttributeValue,
  DynamoDBClient,
  paginateScan,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { env } from '../config/env';
import { dynamoClient } from '../client/dynamoClient';

export class LeadsRepository {
  private dynamoDB: DynamoDBClient;

  constructor() {
    this.dynamoDB = dynamoClient;
  }

  async *scan() {
    let lastEvaluatedKey: Record<string, AttributeValue> | undefined;

    do {
      const command = new ScanCommand({
        TableName: env.DYNAMO_LEADS_TABLE,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const { Items = [], LastEvaluatedKey } =
        await this.dynamoDB.send(command);

      lastEvaluatedKey = LastEvaluatedKey;

      yield Items;
    } while (lastEvaluatedKey);
  }

  public getLeadsGenerator() {
    const paginator = paginateScan(
      { client: this.dynamoDB, pageSize: 50 },
      { TableName: env.DYNAMO_LEADS_TABLE }
    );

    return paginator;
  }
}
