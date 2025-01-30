import type { APIGatewayProxyResultV2 } from 'aws-lambda';

export function response(
  status: number,
  body: Record<string, any>
): APIGatewayProxyResultV2 {
  return {
    statusCode: status,
    body: body && JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
