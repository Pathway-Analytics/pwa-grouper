import { 
	ApiHandler, useBody, useResponse
} from 'sst/node/api';
import { User } from '@sst-starter3/core/classes/user';
import type { UserFilterType } from '@sst-starter3/core/types/user';
import { authzHandler } from '@sst-starter3/core/authzHandler';

const main = async () => {
	// returns list of users meeting criteria in  userfilter
	const body = useBody();
	
	try {
		const userFilter: UserFilterType = JSON.parse(body || '{}') ;
		const res = await User.filterListUser(userFilter);

		return useResponse()
			.status(200)
			.header('Content-Type', 'application/json')
			.header('Access-Control-Allow-Origin', `${process.env.SITE_URL}`)
			.serialize({
				body: JSON.stringify(res)
			});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Internal server error';
		console.error(`Error in list users: ${JSON.stringify(body)}: `, error);

		return useResponse()
			.status(500)
			.header('Content-Type', 'application/json')
			.header('Access-Control-Allow-Origin', `${process.env.SITE_URL}`)
			.serialize({
				body: JSON.stringify({ message: errorMessage })
			});
	}
	
};

// this handler will manage all the authorisation and error handling
// note, we wrap the main handler in the withAuthAndErrorHandling wrapper
// and then wrap that in the ApiHandler wrapper - this allows us to use the
// useSession() and other useful hooks in the main handler.
export const handler = ApiHandler(authzHandler(main));