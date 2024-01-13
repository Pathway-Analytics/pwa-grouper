import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import { useSession } from "sst/node/auth"
import { SessionUserType, emptySession, type SessionTokenType } from '@pwa-grouper/core/types/session';
import type { RoleType } from '@pwa-grouper/core/types/role';
import { useResponse, useMethod, useJsonBody, usePath, useCookie, useQueryParam, usePathParam } from 'sst/node/api';

type LambdaHandler = (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyStructuredResultV2>;

// This function is used to wrap all API routes that require authentication
// It checks that the user is logged in and has the required roles
// If not, it returns a 401 Unauthorized response
// If the user is logged in and has the required roles, it calls the handler

export const authzHandler = (handler: LambdaHandler, roles?: RoleType[]): LambdaHandler => {
  return async (event, context): Promise<APIGatewayProxyStructuredResultV2> => {
// TODO: Check user has required roles
    console.log('0. authzHandler event:', JSON.stringify(event));
    try {
      
      console.log('1. -- authzHandler cookie found: ', JSON.stringify(useCookie('auth-token')))
      // useSession() returns the session object if the user is logged in
      // either session.Paramters({}) or session.Cookie({}) can be used
      // session.Cookie({}) is more secure but cannot be used with localhost.
      const session: SessionTokenType = useSession();
      console.log('2. -- authzHandler session found: ', JSON.stringify(session));  
  
      // ignore if the path is /session 
      console.log('3. -- authzHandler session path: ', JSON.stringify(usePath()));
      if (!session || event.rawPath === '/session' ) {
        console.log('3. -- authzHandler ignoreing the authzHandler for the /session path: ');

        return await handler(event, context);

      }

      // if no session or session is public, return 401
      if (!session || session.type === SessionUserType.PUBLIC ) {
        console.log('4. -- authzHandler session is public: ', JSON.stringify(session.type));

        return useResponse()
          .status(401)
          .serialize({ body: JSON.stringify({ message: 'Unauthorized' }) });
      }

      // check if the request has a body and if so, parse it
      if (['POST', 'PUT', 'PATCH'].includes(useMethod())) {
        console.log('5. -- authzHandler session:', JSON.stringify(useMethod()));

        const body = useJsonBody();
        if (!body) {
          return useResponse()
            .status(400)
            .serialize({ body: JSON.stringify({ message: 'Badly formed request' }) });
        }
      }

      console.log('6. -- authzHandler session looks good:', JSON.stringify(session));
  
      return await handler(event, context);

    } catch (error) {
      console.log('6. -- authzHandler error: ', JSON.stringify(error));

      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      console.error('Error in authHandler:', error);
      return useResponse()
        .status(500)
        .serialize({ body: JSON.stringify({ message: errorMessage }) });
    }
  };
};
