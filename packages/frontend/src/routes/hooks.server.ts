import SessionManager from '$lib/classes/SessionManager';
import {sequence} from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import  { emptySession, type SessionType } from '@pwa-grouper/core/types/session';

// This server hook is called for every frontend request to the server
// It checks if the request has a valid session cookie
// process flow is avialble here: docs/Auth Flows-Session Refresh.drawio.png

const publicPages = [
    '/login',
    '/session',
    '/public',
    '/sentry-example',
];

function isPublicRoute(route:string) {
    return publicPages.includes(route);
}

// if the SessionManager is not initialized, initialize it
// this is only needed for the first request after login
const sessionManager = SessionManager.getInstance()

// a hook to authz 
// if it exists, load the session
// if it does not exist, redirect to login
const authHook: Handle = async ({ event, resolve }): Promise<Response> => {
    let session: SessionType = emptySession;
    const mode = env.PUBLIC_MODE;
    const isLocalHost = mode === 'local';
    const route = event.url.pathname;
    const IsProtected = !isPublicRoute(route);

    // if the route is public
    if (!IsProtected) {
        return resolve(event)
    } 

    else {
        // get the session 
        session = (await sessionManager.getSession()).session;
            // getSession will get session from local store if there
            // if it needs refreshing or not there it will fetch it from api server
            // and set it in the local store
            // note: this does not need the cookie to be set in the browser
            // the initial login cookie is set to domain api.mydomain.com
            // the getSession() call is made to api.mydomain.com and resets the cookie
            // to the domain .mydomain.com for all subsequent calls.
            // but the local store is used to keep session details including expiry time.
            // so the local store is used to check if the session is valid or not.
            // calls to the api are always validated by the cookie though.

        if (session.isValid || isLocalHost) {

            // set the event.locals.session to the session
            // this is available as an alternative to the store
            // event.locals is a server side session store so it more secure than local store.
            event.locals.session = session;

            return resolve(event)
        } 
        // redirect to login
        else {
            return new Response('Redirect', {
                status: 302,
                headers: {
                    Location: '/login'
                }
            });
        }
    }
}

const oneHook: Handle = async ({ event, resolve }) => {
    return resolve(event);
}

const twoHook: Handle = async ({ event, resolve }) => {
    return resolve(event);
}

export const handle: Handle = sequence(authHook, oneHook, twoHook);
