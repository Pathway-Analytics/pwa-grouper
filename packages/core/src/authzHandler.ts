import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import { useSession } from "sst/node/auth"
import { SessionUserType, type SessionTokenType } from '@sst-starter3/core/types/session';
import type { RoleType } from '@sst-starter3/core/types/role';
import { useResponse, useMethod, useJsonBody, usePath, useCookie } from 'sst/node/api';

type LambdaHandler = (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyStructuredResultV2>;

export const authzHandler = (handler: LambdaHandler, roles?: RoleType[]): LambdaHandler => {
  return async (event, context): Promise<APIGatewayProxyStructuredResultV2> => {
// TODO: Check user has required roles
    console.log('00000 authzHandler event:', JSON.stringify(event));
    try {
      if (event.headers && event.headers.cookie && event.headers.cookie.includes('auth-token')) {
        console.log('000 authzHandler Auth-token cookie is included in the request.');
      }  else {

        console.log('000 authzHandler Auth-token cookie is not included in the request.');
      }
      console.log('00 -- authzHandler cookie.', JSON.stringify(useCookie('auth-token')))
      const session: SessionTokenType = useSession();
      console.log('1. -- authzHandler session:', JSON.stringify(session));

      if (!session || usePath().includes('session')) {
        console.log('2. -- authzHandler session:', JSON.stringify(usePath()));

        return await handler(event, context);

        console.log('2. -- authzHandler session:', JSON.stringify(usePath()));
      }

      if (!session || session.type === SessionUserType.PUBLIC ) {
        console.log('3. -- authzHandler session:', JSON.stringify(session.type));

        return useResponse()
          .status(401)
          .serialize({ body: JSON.stringify({ message: 'Unauthorized' }) });
      }

      if (['POST', 'PUT', 'PATCH'].includes(useMethod())) {
        console.log('4. -- authzHandler session:', JSON.stringify(useMethod()));

        const body = useJsonBody();
        if (!body) {
          return useResponse()
            .status(400)
            .serialize({ body: JSON.stringify({ message: 'Badly formed request' }) });
        }
      }

      console.log('5. -- authzHandler session:', JSON.stringify(session));
      return await handler(event, context);
      
    } catch (error) {
      console.log('6. -- authzHandler session:', JSON.stringify(error));

      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      console.error('Error in authHandler:', error);
      return useResponse()
        .status(500)
        .serialize({ body: JSON.stringify({ message: errorMessage }) });
    }
  };
};
