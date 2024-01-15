import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle, type HandleFetch, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import  { emptySession, type SessionType } from '@pwa-grouper/core/types/session';
import { refreshSession } from '$lib/refreshSession';

// ===== Fetch ====
    // this is applied to every fetch throughout the app...
    // server side pages do not have access direct access to cookies in the browser
    // any cookies needed in a server side page request must be forwarded in the request
    const createNewRequest = (request: Request, headers: Headers, url: string) => {
        return new Request(url, { 
            method: request.method,
            headers: headers,
            body: request.body,
            mode: request.mode,
            credentials: request.credentials,
            cache: request.cache,
            redirect: request.redirect,
            referrer: request.referrer,
            integrity: request.integrity
        });
    }
    
    export const handleFetch: HandleFetch = async ({ event, request, fetch }): Promise<Response> => {
        console.log('0. hooks.server handleFetch started...') ;
        let newRequest: Request = request;
    
        if (newRequest.url.startsWith(`${env.PUBLIC_API_URL}/session`)) {
            console.log('0. hooks.server handleFetch adding ', `${event.request.headers}`) ;
        }
    
        // if mode is local, add the auth-token header to the request
        // this is needed for local development
        if (env.PUBLIC_MODE === 'local') {
            console.log('1. hooks.server handleFetch mode is local') ;
            const token = event.url.searchParams.get('auth-token') || 
                event.url.searchParams.get('token') ;
            const newHeaders = new Headers(newRequest.headers);
            
            // add authorization header for local development
            newHeaders.set('Authorization', `Bearer ${token}`);
            newRequest = createNewRequest(newRequest, newHeaders, newRequest.url);
    
            // keep token in the url for local development
            const url = new URL(newRequest.url);
            url.searchParams.set('token', token || '');
            newRequest = createNewRequest(newRequest, newRequest.headers, url.toString());
            
            console.log('2. hooks.server handleFetch ', `${JSON.stringify(newHeaders, null, 2)}`) ;
          
        } else {
            console.log('3. hooks.server handleFetch mode is not local, forwarding headers...') ;
            let newRequest: Request = request;
            const newHeaders = new Headers(newRequest.headers);
            newRequest = createNewRequest(newRequest, newHeaders, newRequest.url);
            console.log('4. hooks.server handleFetch headers forwarded: ', `${JSON.stringify(newHeaders, null, 2)}`) ;    
        }
        return fetch(newRequest);
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

    const handleAuth: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server handleAuth mode: ', env.PUBLIC_MODE);
        console.log('1. hooks.server handleAuth event: ', JSON.stringify(event));
        const locals = event.locals;
        const route = event.url.pathname;
        const mode = env.PUBLIC_MODE;
        locals.mode = env.PUBLIC_MODE
        locals.devToken = event.url.searchParams.get('token') || '';
        locals.session = emptySession;

        const ttlThreshold: number = 30 * 60 * 1000
        try{
            // if the route is public
            if (isPublicRoute(route)) {
                console.log('2. hooks.server handleAuth route is public: ', event.url.pathname);
                return resolve(event)
            } else if (locals?.session?.isValid && !(locals?.session?.exp < Date.now()-ttlThreshold)) {
                console.log('3. hooks.server handleAuth session is valid');
                return resolve(event)
            } else {
                console.log('4. hooks.server handleAuth refreshing session...');
                const token = event.url.searchParams.get('token') || '';
                console.log('5. hooks.server handleAuth session before refresh: ', JSON.stringify(locals.session, null, 2));
                locals.session = await refreshSession(token);
                console.log('6. hooks.server handleAuth session after refresh: ', JSON.stringify(locals.session, null, 2));
                return resolve(event)
            }
        } catch (err) {
            console.log('7. hooks.server handleAuth error: ', err);
            return resolve(event)
        }
    }

    const handleAuthzAdmin: Handle = async ({ event, resolve }): Promise<Response> => {
        return resolve(event)
    }

    const handleAuthzProviderPlus: Handle = async ({ event, resolve }): Promise<Response> => {
        return resolve(event)
    }

    const handleAuthzProviderBasic: Handle = async ({ event, resolve }): Promise<Response> => {
        return resolve(event)
    }

    const handleAuthzCommissioner: Handle = async ({ event, resolve }): Promise<Response> => {
        return resolve(event)
    }

// export const handle: Handle = sequence( checkQueryParamToken, authHook);
export const handle: Handle = sequence(
    handleAuth,
    // handleAuthzAdmin,
    // handleAuthzProviderPlus,
    // handleAuthzProviderBasic,
    // handleAuthzCommissioner,
)