import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { response } from '../utils/response';
import { env } from '../config/env';
import { sqsClient } from '../client/sqsClient';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEventV2) {
  const { userId, filters } = JSON.parse(event.body || '');

  const command = new SendMessageCommand({
    QueueUrl: env.SQS_GENERATE_REPORT_QUEUE,
    MessageBody: JSON.stringify({ userId, filters }),
  });

  await sqsClient.send(command);

  return response(201, {
    message:
      'The report is being generated. You will receive an email once it is ready.',
  });
}
