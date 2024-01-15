import SessionManager from '$lib/classes/SessionManager';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleFetch } from '@sveltejs/kit';

import { env } from '$env/dynamic/public';
import  { emptySession, type SessionType } from '@pwa-grouper/core/types/session';
import { refreshSession } from '$lib/refreshSession';

// ===== Fetch ====
    // this is applied to every fetch throughout the app...
    // server side pages do not have access direct access to cookies in the browser
    // any cookies needed in a server side page request must be forwarded in the request
    export const handleFetch: HandleFetch = async ({ event, request, fetch }): Promise<Response> => {
        console.log('0. hooks.server handleFetch started...') ;
        if (request.url.startsWith(`${env.PUBLIC_API_URL}/session`)) {
            console.log('0. hooks.server handleFetch adding ', `${event.request.headers.get('auth-token')}`) ;
            const newHeaders = new Headers(request.headers);
            newHeaders.set('auth-token', event.request.headers.get('auth-token') || '');
            request = new Request(request, { headers: newHeaders });
        }

        return fetch(request);
    }

// ===== Errors =====
    export async function handleError(error: Error) {
        console.log('error: ', error);
        // return a response indicating the error if needed
        // return error;
    }

// ===== Handles ====

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

    function isCallbackRequest(requestHost: string): boolean{
        return true;
    }

    // if the SessionManager is not initialized, initialize it
    // this is only needed for the first request after login
    const sessionManager = SessionManager.getInstance()


    const test: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server test event: ', JSON.stringify(event));
        const locals = event.locals;
        const route = event.url.pathname;
        const ttlThreshold: number = 30 * 60 * 1000
        try{
            // if the route is public
            if (isPublicRoute(route)) {
                console.log('1. hooks.server test route is public: ', event.url.pathname);
                return resolve(event)
            } else if (locals.session.isValid && !(locals.session.exp < Date.now()-ttlThreshold)) {
                console.log('2. hooks.server test session is valid');
                return resolve(event)
            } else {
                console.log('3. hooks.server test refreshing session...');
                locals.session = await refreshSession();
                return resolve(event)
            }
        } catch (err) {
            console.log('4. hooks.server test error: ', err);
            return resolve(event)
        }
    }
    // a hook to authz 
    // if it exists, load the session
    // if it does not exist, redirect to login
    const handleAuth: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server authHook event: ', JSON.stringify(event));
        let session: SessionType = emptySession;
        const mode = env.PUBLIC_MODE;
        console.log('1. hooks.serverauthHook mode: ', mode);
        const isLocalHost = mode === 'local';
        const route = event.url.pathname;
        const IsProtected = !isPublicRoute(route);
        console.log('2. hooks.server authHook route: ', route);
        // if the route is public
        if (!IsProtected || isLocalHost) {
            console.log('3. hooks.server authHook route is public: ', route);
            return resolve(event)
        } 

        else {
            console.log('4. hooks.server authHook route is protected: ', route);
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
            console.log('5. hooks.server authHook session isValid: ', JSON.stringify(session.isValid));
            if (session.isValid || isLocalHost) {

                console.log('6. hooks.server authHook session is valid');
                // set the event.locals.session to the session
                // this is available as an alternative to the store
                // event.locals is a server side session store so it more secure than local store.
                event.locals.session = session;

                return resolve(event)
            } 
            // redirect to login
            else {
                console.log('7. hooks.serverauthHook session is not valid');
                return new Response('Redirect', {
                    status: 302,
                    headers: {
                        Location: '/login'
                    }
                });
            }
        }
    }

// export const handle: Handle = sequence( checkQueryParamToken, authHook);
export const handle: Handle = sequence(
    // handleAuth,
    test
);