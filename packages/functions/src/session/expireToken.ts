// create an 
import { useCookie, ApiHandler, useResponse } from 'sst/node/api';
import type { SessionType } from '@pwa-grouper/core/types/session';
import { SessionUserType } from '@pwa-grouper/core/types/session';
import { authzHandler } from '@pwa-grouper/core/authzHandler';

// This handler will get the session from the cookie 
// If the session is not valid the wrapper will return an unauthorized.
// If the session is valid it will refresh the cookie Expires datetime and return it.

const main = ApiHandler(async (event) => {
    const token = useCookie('auth-token');

    interface DecodedToken {
        type: SessionUserType;
        properties: {
            userId: string;
        };
        iat: number;
    }
    let session: SessionType = {
        sessionUser: SessionUserType.PUBLIC,
        iat: 0,
        exp: 0,
        isValid: false,
        user: null
    };
    
    if (!!token) {
        // dont need to do much here...
        
        return useResponse()
            .status(200)
            .header('Content-Type', 'application/json')
            .header('Access-Control-Allow-Origin', `${process.env.SITE_URL}`)
            .cookie({
                key: 'auth-token',
                value: '',
                encrypted: 'true',
                secure: true,
                httpOnly: true,
                expires: new Date(0).toUTCString(),
                sameSite: 'None',
                path: '/'
            })
            .serialize({
                body: JSON.stringify(session)
            });

    }
});

// this handler will manage all the authorisation and error handling
export const handler = ApiHandler(authzHandler(main));
