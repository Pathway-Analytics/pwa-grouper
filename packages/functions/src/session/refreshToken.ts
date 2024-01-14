import { ApiHandler, useCookie, useResponse } from 'sst/node/api';
import { useSession } from "sst/node/auth"
import { User } from '@pwa-grouper/core/classes/user';
import type { SessionType } from '@pwa-grouper/core/types/session';
import { SessionUserType } from '@pwa-grouper/core/types/session';
import { authzHandler } from '@pwa-grouper/core/authzHandler';

// This function check for the original cookie posted on api.mystage-myapp.mydomain.com
// and replaces it with a new cookie on .mydomain.com with sameSite set to Lax
// This allows the cookie to be used on the frontend site at mystage-myapp.mydomain.com
// and the backend api.mystage-myapp.mydomain.com
// If the original cookie but the .mydomain.com cookie is found instead
// the cookie is reffreshed with a new expiration date

const main = async () => {
    console.log('0. -- refreshToken auth-token found: ', useCookie('auth-token')? true : false );
    const token = useCookie('auth-token');
    console.log('1. -- refreshToken token:', JSON.stringify(token));
    interface DecodedToken {
        type: SessionUserType;
        properties: { userId: string; };
        iat: number;
    }
    let session: SessionType = {
        sessionUser: SessionUserType.PUBLIC,
        iat: 0,
        exp: 0,
        isValid: false,
        user: null
    };

    try {

        if (!!token) {
            console.log('2. -- decoding session...');
            let decodedToken: DecodedToken = useSession();
            console.log('3. -- refreshToken decodedToken:', JSON.stringify(decodedToken));

            if (decodedToken.type !== SessionUserType.PUBLIC) {
                console.log('4. -- refreshToken looks like the session is NOT public');
                session.sessionUser = decodedToken.type;
                session.iat = decodedToken.iat;
                session.exp = Math.floor(Date.now() / 1000) + 3600;
                session.user = await User.getByIdOrEmail(decodedToken.properties.userId);
                session.isValid = true;

                let date = new Date(session.exp * 1000);
                console.log('5. -- refreshToken oops, USER session details: ', JSON.stringify(session, null, 2));
                // set the cookie
                return useResponse()
                    .status(200)
                    // remove the original cookie if it is still there
                    .cookie({
                        key: 'auth-token',
                        value: '',
                        encrypted: true,
                        secure: true,
                        httpOnly: true,
                        expires: new Date(0),
                        sameSite: 'none',
                        path: '/'
                    })
                    //  and set the new or refresh the cookie for the domain
                    .cookie({
                        key: 'auth-token',
                        value: token,
                        encrypted: true,
                        secure: true,
                        httpOnly: true,
                        expires: date,
                        sameSite: 'Lax',
                        domain:  '.pathwayanalytics.com',
                        path: '/'
                    })
                    // add the session details to the response body
                    // so we dont have to decode the token on the frontend
                    .serialize({ body: session });
            } else {
                console.log('6. -- refreshToken oops, PUBLIC session details: ', JSON.stringify(session, null, 2));
                return useResponse()
                    .status(200)
                    .serialize({ body: session });
            }
        } else {
            console.log('7. -- refreshToken NO token:');  
            return useResponse()
                .status(200)
                .serialize({ body: session });
        }
    } catch (error) {
        console.log('8. -- refreshToken error:', JSON.stringify(error));
        console.error(`Error in refreshToken: `, error);
        return useResponse()
            .status(500)
            .serialize({ body: JSON.stringify({ message: 'Internal Server Error' }) });
    }
};

export const handler = ApiHandler(authzHandler(main));