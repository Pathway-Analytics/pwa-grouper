import { 
	ApiHandler, usePathParam, useResponse
 } from 'sst/node/api';
import { User } from '@pwa-grouper/core/classes/user';
import { authzHandler } from '@pwa-grouper/core/authzHandler';

const main = async () => {
	// returns user info of userid 
	const idOrEmail = usePathParam('id');
	if (!idOrEmail) {
		return useResponse()
			.status(400)
			.header('Content-Type', 'application/json')
			.header('Access-Control-Allow-Origin', `${process.env.SITE_URL}`)
			.serialize({
				body: JSON.stringify({ message: 'Bad Request: id or email must be provided' })
			})
			
	} else {
		// takes first id or email
		try{
			const res = await User.getByIdOrEmail(idOrEmail);

		return useResponse()
			.status(200)
			.header('Content-Type', 'application/json')
			.header('Access-Control-Allow-Origin', `${process.env.SITE_URL}`)
			.serialize({
				body: JSON.stringify({ res })
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Internal server error';
			console.error(`Error in get user: ${idOrEmail}: `, error);
			return useResponse()
				.status(500)
				.header('Content-Type', 'application/json')
				.header('Access-Control-Allow-Origin', `${process.env.SITE_URL}`)
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