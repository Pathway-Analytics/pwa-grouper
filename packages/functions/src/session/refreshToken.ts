import { ApiHandler, useCookie, useResponse } from 'sst/node/api';
import { useSession } from "sst/node/auth"
import { User } from '@pwa-grouper/core/classes/user';
import type { SessionType } from '@pwa-grouper/core/types/session';
import { SessionUserType } from '@pwa-grouper/core/types/session';
import { authzHandler } from '@pwa-grouper/core/authzHandler';

const main = async () => {
    console.log('0. -- refreshToken token:', JSON.stringify(useCookie('auth-token')));
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
            console.log('2. -- refreshToken token:', JSON.stringify(token));
            let decodedToken: DecodedToken = useSession();
            console.log('3. -- refreshToken decodedToken:', JSON.stringify(decodedToken));

            if (decodedToken.type !== SessionUserType.PUBLIC) {
                console.log('4. -- refreshToken decodedToken.type !== public:', JSON.stringify(decodedToken.type));
                session.sessionUser = decodedToken.type;
                session.iat = decodedToken.iat;
                session.exp = Math.floor(Date.now() / 1000) + 3600;
                session.user = await User.getByIdOrEmail(decodedToken.properties.userId);
                session.isValid = true;

                let date = new Date(session.exp * 1000);
                console.log('5. -- refreshToken session data{}:', JSON.stringify(session));
                console.log('5. -- refreshToken Response:',
                'key:', 'auth-token',
                'value:', token,
                'encrypted:', true,
                'secure:', true,
                'httpOnly:', true,
                'expires:', date,
                'sameSite:', 'Lax',
                'path:', '/',
                'domain:' , '.pathwayanalytics.com',
                'body:', JSON.stringify(session)
                );
                // setting two cookies, expiring one and setting the other
                // does not seem to work so we are call the expireToken function to clear it.
                // and then setting setting the one
                
                // call api/expiredToken to clear the cookie
                // await fetch(`${process.env.API_URL}/logout`, {
                //     method: 'GET',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'Access-Control-Allow-Origin': `${process.env.SITE_URL}`
                //     },
                //     credentials: 'include'
                // });
                // set the cookie
                return useResponse()
                    .status(200)
                    .cookie({
                        key: 'auth-token',
                        value: '',
                        encrypted: true,
                        secure: true,
                        httpOnly: true,
                        expires: new Date(0),
                        sameSite: 'none',
                        path: '/'
                    }).cookie({
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
                    .serialize({ body: JSON.stringify(session)});
            } else {
                console.log('6. -- refreshToken decodedToken.type == public:', JSON.stringify(session));
                return useResponse()
                    .status(200)
                    .serialize({ body: JSON.stringify(session) });
            }
        } else {
            console.log('7. -- refreshToken NO token:');  
            return useResponse()
                .status(200)
                .serialize({ body: JSON.stringify(session) });
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