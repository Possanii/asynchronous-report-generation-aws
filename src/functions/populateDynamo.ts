import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { dynamoClient } from '../client/dynamoClient';
import { env } from '../config/env';
import { response } from '../utils/response';

export async function handler() {
  // WARNING: TAKE CARE! IT COULD COST YOU FUTURE INVOICES FROM AWS DEPENDING ON TOTAL WRITES
  const total = 50;

  const leadsCreated = await Promise.allSettled(
    Array.from({ length: total }, async () => {
      const userName = faker.person.fullName();

      const putCommand = new PutItemCommand({
        TableName: env.DYNAMO_LEADS_TABLE,
        Item: {
          id: { S: randomUUID() },
          name: { S: userName },
          email: {
            S: faker.internet
              .email({
                firstName: userName.split(' ')[0],
                lastName: userName.split(' ').pop(),
              })
              .toLocaleLowerCase(),
          },
          jobTitle: { S: faker.person.jobTitle() },
        },
      });

      await dynamoClient.send(putCommand);
    })
  );

  const totalCreatedLeads = leadsCreated.filter(
    (result) => result.status === 'fulfilled'
  ).length;

  return response(201, {
    totalCreatedLeads,
  });
}
