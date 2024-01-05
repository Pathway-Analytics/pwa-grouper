import { 
    ApiHandler, useBody, useResponse
} from 'sst/node/api';
import { User } from '@sst-starter3/core/classes/user';
import type { UserFilterType } from '@sst-starter3/core/types/user';
import type { RoleType } from '@sst-starter3/core/types/role';
import { authzHandler } from '@sst-starter3/core/authzHandler';

// takes a POST request with a userInfo:Users object
// returns userInfo:Users object

const main = async () => {
    const body = useBody();

    if (!body) {
        return useResponse()
            .status(400)
            .header('Content-Type', 'application/json')
            .header('Access-Control-Allow-Origin', process.env.SITE_URL)
            .serialize({
                body: JSON.stringify({ message: 'Bad Request: id or email must be provided' })
            })
            
    } else {
        try {
            let user: UserFilterType;
            user = JSON.parse(body);
            const res = await User.createUpdate(user);
            return useResponse()
                .status(200)
                .header('Content-Type', 'application/json')
                .header('Access-Control-Allow-Origin', process.env.SITE_URL,)
                .serialize({
                    body: JSON.stringify({ res })
                })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Internal server error';
            console.error(`Error in Update user: ${JSON.stringify(body)}: `, error);
            return useResponse()
                .status(500)
                .header('Content-Type', 'application/json')
                .header('Access-Control-Allow-Origin', process.env.SITE_URL)
                .serialize({
                    body: JSON.stringify({ message: errorMessage })
                })
        }
    }
};

// this handler will manage all the authorisation and error handling
// note, we wrap the main handler in the withAuthAndErrorHandling wrapper
// and then wrap that in the ApiHandler wrapper - this allows us to use the
// useSession() and other useful hooks in the main handler.
export const handler = ApiHandler(authzHandler(main));
