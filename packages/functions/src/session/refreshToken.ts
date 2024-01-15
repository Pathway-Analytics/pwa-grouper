import { ApiHandler, useCookie, useQueryParam, useResponse } from 'sst/node/api';
import { useSession } from "sst/node/auth"
import { User } from '@pwa-grouper/core/classes/user';
import type { SessionType } from '@pwa-grouper/core/types/session';
import { SessionUserType, emptySession } from '@pwa-grouper/core/types/session';
import { authzHandler } from '@pwa-grouper/core/authzHandler';
import { Config } from 'sst/node/config';


// This function check for the original cookie posted on api.mystage-myapp.mydomain.com
// and replaces it with a new cookie on .mydomain.com with sameSite set to Lax
// This allows the cookie to be used on the frontend site at mystage-myapp.mydomain.com
// and the backend api.mystage-myapp.mydomain.com
// If the original cookie but the .mydomain.com cookie is found instead
// the cookie is reffreshed with a new expiration date

const main = async () => {
    console.log('0. -- refreshToken auth-token found: ', useCookie('auth-token')? true : false );   
    const mode = process.env.MODE;
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

        if (useSession()) {
            console.log('1. -- refreshToken useSession found: ', useSession()? true : false );   
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
                let cookieOld = ''
                let cookieNew = ''
                console.log('5. -- refreshToken, USER session details: ', JSON.stringify(session, null, 2));
                // set the cookie
                // try differnt approach
                const responseData = {
                    message: "cookie reset",
                    session
                };
                if (mode === 'local') {
                    const token = useQueryParam('token');
                    console.log('6. -- refreshToken token (local mode) from QueryParams:', JSON.stringify(token));
                    cookieOld = `auth-token=${token}; Expires=${new Date(0)};, Path=/; HttpOnly; SameSite=None;`;
                    cookieNew = `auth-token=${token}; Expires=${date},  Path=/; `;
                } else {
                    const token = useCookie('auth-token');
                    console.log('7. -- refreshToken token from cookie:', JSON.stringify(token));
                    cookieOld = `auth-token=${token}; Expires=${new Date(0)};, Path=/; HttpOnly; SameSite=None;`;
                    cookieNew = `auth-token=${token}; Expires=${date}, Domain=.pathwayanalytics.com; Path=/; HttpOnly; Secure, SameSite=Lax;`;
                }
                console.log('8. -- refreshToken cookieOld, cookieNew:', JSON.stringify({cookieOld: cookieOld, cookieNew: cookieNew}, null, 2));
                console.log('9. -- refreshToken responseData:', JSON.stringify({responseData}, null, 2));
                
                // Return a successful response
                return {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    cookies: [cookieOld, cookieNew],
                    body: JSON.stringify(responseData)
                };

            } else {
                const responseData = {
                    message: "public session",
                    emptySession
                };
                console.log('10. -- refreshToken, oops PUBLIC session details: ', JSON.stringify(session, null, 2));
                return useResponse()
                    .status(200)
                    .serialize(responseData);
            }
        }

    } catch (error) {
        console.log('8. -- refreshToken error:', JSON.stringify(error));
        console.error(`Error in refreshToken: `, error);
        const responseData = {
            message: `Internal Server Error:  ${error}` ,
            emptySession
        };
        return useResponse()
            .status(500)
            .serialize(responseData);    
    }
};

export const handler = ApiHandler(authzHandler(main));