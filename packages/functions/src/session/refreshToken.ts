import { ApiHandler, useCookie, useHeader, useQueryParam, useResponse } from 'sst/node/api';
import { useSession } from "sst/node/auth"
import { User } from '@pwa-grouper/core/classes/user';
import type { SessionType } from '@pwa-grouper/core/types/session';
import { SessionUserType, emptySession } from '@pwa-grouper/core/types/session';
import { authzHandler } from '@pwa-grouper/core/authzHandler';


// This function check for the original cookie posted on api.mystage-myapp.mydomain.com
// and replaces it with a new cookie on .mydomain.com with sameSite set to Lax
// This allows the cookie to be used on the frontend site at mystage-myapp.mydomain.com
// and the backend api.mystage-myapp.mydomain.com
// If the original cookie but the .mydomain.com cookie is found instead
// the cookie is reffreshed with a new expiration date

const isLocalMode = process.env.MODE === 'local';
let domain = isLocalMode ? process.env.DOMAIN || '' : process.env.SITE_URL || '';
domain = domain.replace('https://', '');
domain = domain.replace('http://', '');

const updateUserLastLogin = async (session: SessionType) => {
    if (session.user?.id) {
        let getUser = await User.getByIdOrEmail(session.user?.id || '');
        getUser.lastLogin = new Date()
        const updateUserLastLogin = await User.createUpdate(getUser);
        const updatedSession = session
        if (updateUserLastLogin){
            updatedSession.user = getUser
        }
        return updatedSession;
    }
    return session;
}

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

                let refreshDate = new Date(session.exp * 1000).toUTCString();
                let expiresDate = new Date().toUTCString();
                let cookieOld = ''
                let cookieNew = ''
                console.log('5. -- refreshToken, USER session details: ', JSON.stringify(session, null, 2));
                // set the cookie
                let token: string | undefined = ''       
                // if (isLocalMode) {
                // strip Bearer from the useHeader('Authorisation') token or useQueryParam('token')
                    token = useQueryParam('token') 
                    || useHeader('authorization')?.replace('Bearer ', '') 
                    || useHeader('Authorization')?.replace('Bearer ', '') 
                        || useCookie('auth-token');

                    console.log('6. -- refreshToken token from QueryParam:', useQueryParam('token'));
                    console.log('6. -- refreshToken token from Header:', useHeader('authorization')?.replace('Bearer ', ''));
                    console.log('6. -- refreshToken token from Cookie:', useCookie('auth-token'));
                    console.log('6. -- refreshToken token token selected :', token);
                    cookieOld = `auth-token=${token}; Expires=${expiresDate}; Path=/; HttpOnly; SameSite=None;`;
                    // cookieNew = `auth-token=${token}; Expires=${refreshDate};  Path=/; `;
                // } else {
                //     token = useCookie('auth-token');
                //     console.log('7. -- refreshToken token from cookie:', JSON.stringify(token));
                //     cookieOld = `auth-token=${token}; Expires=${expiresDate}; Path=/; HttpOnly; SameSite=None;`;
                    cookieNew = `auth-token=${token}; Expires=${refreshDate}; Domain=.${domain}; Path=/; HttpOnly; Secure; SameSite=Lax;`;
                // }
                // update the user last login
                session = await updateUserLastLogin(session);
                const responseData = {
                    message: "cookie reset",
                    session, 
                    token: token
                };

                console.log('8. -- refreshToken cookieOld, cookieNew:', JSON.stringify({cookieOld: cookieOld, cookieNew: cookieNew}, null, 2));
                console.log('9. -- refreshToken responseData:', JSON.stringify({responseData}, null, 2));
                
                // Return a successful response
                // Caution: multivalue headers are not supported by API Gateway's HTTP proxy integration
                // Payload v2 formt:
                // Duplicate headers are combined with commas and included in the headers field. Duplicate query strings are combined with commas and included in the queryStringParameters field.
                // Format 2.0 includes a new cookies field. All cookie headers in the request are combined with commas and added to the cookies field. In the response to the client, each cookie becomes a set-cookie header.
                // https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
                
                return {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    cookies: [cookieOld, cookieNew],
                    body: JSON.stringify(responseData)
                };

            } else {
                session = emptySession;
                const responseData = {
                    message: "public session",
                    session
                };
                console.log('10. -- refreshToken, oops PUBLIC session details: ', JSON.stringify(responseData, null, 2));
                return {
                    statusCode: 200,
                    body: JSON.stringify(responseData)
                }
            }
        }

    } catch (error) {
        console.log('11. -- refreshToken error:', JSON.stringify(error));
        console.error(`Error in refreshToken: `, error);
        session = emptySession;
        const responseData = {
            message: `Internal Server Error:  ${error}` ,
            session
        };
        console.log('12. -- refreshToken, oops error details: ', JSON.stringify(responseData, null, 2));
        return useResponse()
            .status(500)
            .serialize(responseData)
    }
};

export const handler = ApiHandler(authzHandler(main));