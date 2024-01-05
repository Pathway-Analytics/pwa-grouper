import { 
	ApiHandler, usePathParam, useResponse
 } from 'sst/node/api';
import { User } from '@sst-starter3/core/classes/user';
import { authzHandler } from '@sst-starter3/core/authzHandler';
import { RoleType } from '@sst-starter3/core/types/role';

const main = async () => {
	// deletes the user with the given id or email
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
			const res = await User.delete(idOrEmail);

		return useResponse()
			.status(200)
			.header('Content-Type', 'application/json')
            .header('Access-Control-Allow-Origin', `${process.env.SITE_URL}`)
			.serialize({
				body: JSON.stringify({ message: 'User deleted successfully' })
			})
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Internal server error';
			console.error(`Error in delete user: ${idOrEmail}: `, error);

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
// this handler will manage all the authorisation and error handling
// note, we wrap the main handler in the withAuthAndErrorHandling wrapper
// and then wrap that in the ApiHandler wrapper - this allows us to use the
// useSession() and other useful hooks in the main handler.
export const handler = ApiHandler(authzHandler(main, [RoleType.ADMIN]));
