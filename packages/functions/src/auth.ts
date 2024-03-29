import { AuthHandler, GoogleAdapter, LinkAdapter, Session, SessionTypes } from 'sst/node/auth';
import { sendEmail } from '@pwa-grouper/core/email/emailService';
import { Config } from "sst/node/config";
import { v4 as uuidv4 } from 'uuid';
import { User } from '@pwa-grouper/core/classes/user';
import { RoleType as Role } from '@pwa-grouper/core/types/role';
import type { UserType } from '@pwa-grouper/core/types/user';
import { useQueryParam } from 'sst/node/api';

const frontendCallback = `${process.env.SITE_URL}/callback`;
const isLocalMode = process.env.MODE === 'local';
let domain = isLocalMode ? process.env.DOMAIN || '' : process.env.SITE_URL || '';
domain = domain.replace('https://', '');
domain = domain.replace('http://', '');

// we have also created an extend SessionTypes interface in the $shared_types folder
declare module 'sst/node/auth' {
    export interface SessionTypes {
        user: {
            type: string;
            properties: {
                userId: string;
            };
            options: {  // These are a set of predefined claims which are not mandatory but recommended, to provide a set of useful, interoperable claims. 
                //  algorithm?: Algorithm  // algorithm used to sign the token
                // mutatePayload?: boolean //
                // expiresIn?: number | string  // expires at epoch time
                // notBefore?: number // not valid before epoch time
                // jti?: string  // unique identifier for the token
                // aud?: string | string[]  // audience
                // iss?: string  // issued by a URI representing the issuer
                // sub?: string  // subject
                // nonce?: string // number used once
                // kid?: string // key id
                // header?: JwtHeader 
                // noTimestamp?: boolean  // if true, do not validate the expiration of the token
                // clockTimestamp?: number  // epoch time now in seconds
            };
            iat: number;
            exp: number;
        };
        api_connection?: { // example of a custom session type for api connections
            api_key: string;
        };
    }
}

export const handler = AuthHandler({
    providers: {
        google: GoogleAdapter({
        mode: "oidc",
        clientID:  Config.GOOGLE_CLIENT_ID,
        // maybe future auth has this
        // prompt: 'select_account',

        onSuccess: async (tokenset) => {
            const claims = tokenset.claims();
            console.log('1. authhandler google onSuccess -- tokenset.claims: ', JSON.stringify(tokenset.claims(), null, 4));
            const authUser = await handleClaim(claims);
            if(authUser) {
                // if we are in localhost mode then use session parameters
                if (isLocalMode ) {
                    console.log('2.1. authhandler google onSuccess using sessionParams, mode is: ', isLocalMode ? 'local' : 'deployed');
                    const params = getSessionParameter(authUser.id || '');
                    let cookie = Session.cookie(params)?.cookies?.[0] ?? '';
                    cookie = cookie.replace('; Domain=', '');
                    cookie = `${cookie}; Domain=localhost;`; //we wold need to remove port etc but in dev mode we use the authorization header anyway...
                    console.log('2.2. authhandler google onSuccess set cookie is: ', cookie); 
                    const newProxyStructure = Session.cookie(params);
                    newProxyStructure.cookies = [cookie];
                    return newProxyStructure;
                } else {
                    console.log('3.1. authhandler goolgle onSuccess using sessionParams, mode is: ', isLocalMode ? 'local' : 'deployed');
                    const params = getSessionParameter(authUser.id || '');
                    let cookie = Session.cookie(params)?.cookies?.[0] ?? '';
                    cookie = cookie.replace('; Domain=', '');
                    cookie = `${cookie}; Domain=localhost;`; //we wold need to remove port etc but in dev mode we use the authorization header anyway...
                    console.log('3.2. authhandler google onSuccess set cookie is: ', cookie); 
                    const newProxyStructure = Session.cookie(params);
                    newProxyStructure.cookies = [cookie];
                    return newProxyStructure;
                }
            } else {
                console.log('4. authhandler google user not found')

                return {
                    statusCode: 403,
                    body: JSON.stringify({ 'Authentication google Error': "Credentials not valid" }),
                };
            }
        },
    
    }),
        link: LinkAdapter({

            onLink: async (link, claims) => {
                console.log('6. authhandler magiclink onLink')

                // swap out the domain in the link for the api domain so we hide the aws api gateway url
                // we need to do this for secure cookies to work
                link = link.replace(Config.AWS_API_URL, process.env.API_URL || '');

                const emailmsg = await composeEmail(claims.email, link);
                const userExists = await User.getByIdOrEmail(claims.email);
                if (Config.SELF_REG === 'true' || userExists || Config.ADMIN_USER_EMAIL === claims.email) {
                    const sentEmail = await sendEmail(emailmsg.recipient, emailmsg.sender, emailmsg.subject, emailmsg.textBody, emailmsg.htmlBody);
                    console.log('6. authhandler magiclink onLink sentEmail: ', sentEmail);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ message: "Link sent successfully" }),
                    };
                } else {
                    console.log('6. authhandler magiclink onLink error: ', 'SELF_REG is not enabled', ` request made by: ${claims.email}`);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ message: "goodluck..." }),
                    };
                }
            },

            onSuccess: async (tokenset) => {
                console.log('7. authhandler magiclink onSuccess(tokenset): ' , JSON.stringify(tokenset, null, 4));
                const claims: Record<string, any> = tokenset;
                console.log('8. authhandler magiclink onSuccess claims: ' , JSON.stringify(claims, null, 4));
                const authUser: UserType | undefined = await handleClaim(claims);
                // take the authUser.id and return a session parameter
                console.log('9. authhandler magiclink onSuccess authUser: ', authUser);
                if (authUser?.id !== undefined) {
                    console.log('10. authhandler magiclink onSuccess  authUser.id', authUser.id);
                    if (isLocalMode ) {
                        console.log('11. authhandler magiclink onSuccess using sessionParams, mode is: ', isLocalMode ? 'local' : 'deployed');
                        const params = getSessionParameter(authUser.id || '');
                        let cookie = Session.cookie(params)?.cookies?.[0] ?? '';
                        cookie = cookie.replace('; Domain=', '');
                        cookie = `${cookie}; Domain=localhost;`; //we wold need to remove port etc but in dev mode we use the authorization header anyway...
                        console.log('12. authhandler magiclink onSuccess set cookie is: ', cookie); 
                        // const newProxyStructure = Session.cookie(params);
                        // newProxyStructure.cookies = [cookie];
                        // console.log('13. authhandler magiclink onSuccess set newcookie: ', newProxyStructure?.cookies?.[0]);
                        return  Session.parameter(params)
                        // return newProxyStructure;
                    } else {
                        console.log('14. authhandler magiclink onSuccess using sessionParam, mode is: ', isLocalMode ? 'local' : 'deployed');
                        //-X const cookies = getSessionCookies(authUser.id || '');
                        // it may be possible to use the cookie method here but we need to set the cookie in the site domain
                        const cookies = getSessionCookies(authUser.id || '');
                        const params = getSessionParameter(authUser.id || '');
                        // reset the cookie to the site subdomain: .my-stage-my-app.domain.com
                        //-X const newProxyStructure = Session.cookie(cookies);
                        // cookie = cookie.replace('; Domain=', '');
                        // cookie = `${cookie}; Domain=.${domain}`;
                        // console.log('15. authhandler magiclink onSuccess set newProxyStructure is: ', JSON.stringify(newProxyStructure, null, 2));
                        return Session.parameter(params);
                    }
                    // decide whether to use cookies or params for session management 
                    // https://docs.sst.dev/auth#cookies
                    // if using cookie: set cors, requests must use 'include' for credentials
                    // this only sets the cookie for the api domain
                    // to setting the cookie in the site domain needs to done on the site server
                    // hooks.
                } else {
                    console.log('16. authhandler magiclink onSuccess authUser not found')
                    return {
                        statusCode: 403,
                        body: JSON.stringify({ 'Authentication Error': "Credentials not valid" }),
                    };
                }
            },
            
            onError: async () => {
                console.log('17. authhandler MagicLink onError')
                return {
                    statusCode: 500,
                    body: JSON.stringify({ 'Link message': "An error occurred" }),
                };
            },
        }),
    }
});

function getSessionCookies (userId: string):{
    type: keyof SessionTypes;
    properties: {
        userId: string;
    };
    options: {
        // expiresIn: number;
        // iat?: number;
        // exp?: number;
    };
    redirect: string;
}{
    const urlRedirect = useQueryParam('urlRedirect');
    const redirect = urlRedirect
        ? `${frontendCallback}&urlRedirect=${urlRedirect}`
        : `${frontendCallback}`;
    return {
        type: 'user' as keyof SessionTypes,
        properties: {
            userId: userId,
        },
        options: {
            // expiresIn: 60 * 60 * 24 * 1000, // 1 day
        },
        // redirect to frontend callback to set the session cookie
        redirect: redirect
    };
}

function getSessionParameter (userId: string):{
    type: keyof SessionTypes;
    properties: {
        userId: string;
    };
    options: {
        // expiresIn: number;
        // iat?: number;
        // exp?: number;
    };
    redirect: string;
} 
{
    const urlRedirect = useQueryParam('urlRedirect');
    // add a urlRedirect query param to the redirect url 
    // the urlRedirect is used to redirect to after the session is set in localstorage
    const redirect = urlRedirect
        ? `${frontendCallback}&urlRedirect=${urlRedirect}`
        : `${frontendCallback}`;
    return {
        type: 'user' as keyof SessionTypes,
        properties: {
            userId: userId,
        },
        options: {
            // expiresIn: 60 * 60 * 24 * 1000, // 1 day
        },
        // redirect to frontend session page where the session is set in localstorage 
        redirect: redirect
    };
}

// function to take the claim onSuccess and 
// if claims.email matches ADMIN_USER_EMAIL
//   the createUpdate a new user with ADMIN_USER_ROLE
// else if SELF_REG then create a new user
// else if user exists then return user
// else ignore
async function handleClaim(claims:Record<string,any>): Promise<UserType | undefined> {

    console.log('14. authhandler handleClaim claims: ', claims);
    const adminEmail:string = Config.ADMIN_USER_EMAIL || '';
    const selfReg:boolean = Boolean(Config.SELF_REG) || false;

    if (claims.email){
        const existingUser: UserType = await User.getByIdOrEmail(claims.email) 
        // is this an admin user?
        if (adminEmail === claims.email) {
            // check if user exists
            console.log('15. authhandler handleClaim createUpdate(newUser) Admin User: ', claims.email);
            if (existingUser.id) {
                console.log('16. authhandler handleClaim  existing User: ', JSON.stringify(existingUser));
                // Check if user has ADMIN role
                // Convert roles CSV string to array
                let roles = existingUser.roles ? existingUser.roles.split(',') : [];
                // Add 'ADMIN' to roles array if it's not already there
                if (!roles.includes('ADMIN')) {
                    console.log('17. authhandler handleClaim  check roles : ', existingUser.roles);
                    roles.push('ADMIN');
                    // Convert roles array back to CSV string
                    existingUser.roles = roles.join(',');
                    existingUser.lastLogin = new Date();
                    return await User.createUpdate(existingUser);
                } else {
                    console.log('18. authhandler handleClaim createUpdate(newUser) Admin User already has ADMIN role: ', claims.email);
                    return existingUser;
                }
            } else {
                // add new user with ADMIN role
                console.log('19. authhandler handleClaim createUpdate(newUser) create new Admin user: ', claims.email);
                const newUser: UserType = {
                    id: uuidv4(),
                    email: claims.email as string,
                    picture: claims.picture,
                    firstName: claims.given_name,
                    lastName: claims.family_name,
                    roles: Role.ADMIN,
                    lastLogin: new Date()
                };
                return await User.createUpdate(newUser);
            }
        // is Self-reg enabled?
        } else if ( selfReg ) {

            if (existingUser.id) {
                return existingUser;
            } else {
                const newUser: UserType = {
                    id: uuidv4(),
                    email: claims.email as string,
                    picture: claims.picture,
                    firstName: claims.given_name,
                    lastName: claims.family_name,
                    roles: '',
                    lastLogin: new Date()
                };
                console.log('20. authhandler handleClaim createUpdate(newUser) : ', newUser);
                return await User.createUpdate(newUser);
            }
        // Does the user exist already?
        } else {
            if (!existingUser) {
                console.log('21. authhandler handleClaim error user not found', existingUser);
            } 
            return existingUser;
        }
    } else {
        console.log('22. authhandler handleClaim error claims.email not found', claims);
        return undefined;
    }
}

function composeEmail(email: string, link: string):
Promise<{
    recipient: string, 
    sender: string, 
    subject: string, 
    textBody: string,
    htmlBody: string
}> {
    // use AWS SES to send an email to the user with the link
    // the link should be a URL with a JWT token in the query string
    // await sendEmail(claims.email, link); 
    // replace '
    console.log('13. claims', email);
    const appName = Config.APP_NAME;
    console.log('14. appName', appName);
    const recipient: string = email as string;
    const sender = Config.ADMIN_USER_EMAIL || '';
    console.log('15. sender', sender);
    const subject = `Login Link from ${appName}`;
    const textBody = `Hello ${email.split('@')[0]},\n\nHere is your login link: ${link}\n\nPlease use it right away\n\nThanks,\nPathway Analytics}`;
    const htmlBody = ` 
    <h1>Hello ${email.split('@')[0]},</h1> 
    <p>Here is your login link: <a href="${link}">Login</a></p> 
    <p>Please use it right away</p> 
    <p>Thanks,</p> 
    <p>${appName}</p> 
    `;
    return Promise.resolve({
        recipient: recipient, 
        sender: sender, 
        subject: subject, 
        textBody: textBody, 
        htmlBody: htmlBody
    });
}