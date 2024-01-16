import { sequence } from '@sveltejs/kit/hooks';
import { type Handle, type HandleFetch } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { RoleType } from '@pwa-grouper/core/types/role';
import { refreshSession } from '$lib/refreshSession';
import type { SessionResponseType } from '@pwa-grouper/core/types/session';

const ttlThreshold: number = 30 * 60 * 1000  // ttl for session before we refresh to keep alive


// ===== Helpers ====
    // function isRestrictedRoute accepts route param of type string or undefined
    // pass in the event.route.id and the optional required route 'provider' or 'admin'
    function isRestrictedRoute(routeId: string | undefined, sessionRoles? :string): boolean {
        // session roles array add authenticated
        const roles: string[] = `${sessionRoles?.toLowerCase()},authenticated`?.split(',') || [];
        
        // does the roles array include 'admin', then return false (not restricted)
        if (roles.includes(RoleType.ADMIN)) return false;
        
        // array of any string between parentheses in the routeId
        const routes = routeId?.match(/\((.*?)\)/g)?.map(route => route.replace(/[\(\)]/g, ''));
        
        // does the roles array include all the required matches?
        const allMatchesIncluded: boolean = routes?.every(route => roles.includes(route)) || true;
        let isRestricted: boolean = !allMatchesIncluded;
        
        return isRestricted;
    }
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

// ===== Fetch ====
    // this is applied to every fetch throughout the app...
    // server side pages do not have access direct access to cookies in the browser
    // any cookies needed in a server side page request must be forwarded in the request    
    export const handleFetch: HandleFetch = async ({ event, request, fetch }): Promise<Response> => {
        console.log('0. hooks.server handleFetch started...') ;

        // wrap each request with an authorization header
        const newHeaders = new Headers(request.headers);
        event.locals.token && newHeaders.set('Authorization', `Bearer ${event.locals.token}`);
        newHeaders.set('credentials', 'include');
        
        const newRequest: Request = createNewRequest(request, newHeaders, request.url);
        
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
    // const callback: Handle = async ({ event, resolve }): Promise<Response> => {
    //     console.log('0. hooks.server callback mode: ', env.PUBLIC_MODE);
    //     console.log('1. hooks.server callback route: ', JSON.stringify(event.route.id, null, 2));
    //     // if route id is /callback
    //     if (event.route.id === 'callback') {
    //         console.log('2. hooks.server callback route is /callback');
    //         // get the props from the event
    //         const locals = event.locals;
    //         console.log('3. hooks.server callback locals: ', JSON.stringify(locals, null, 2));
    //         }
    //     return resolve(event)
    // }

    const useSessionHandler: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server useSessionHandler route: ', event.route.id);
// check if the event.url.searchParam('token') is null
// call the env.PUBLIC_API_URL/session
// add the url.searchParam('token') as an Authorization header
// return the response
// set resonse in the event.locals
// return resolve(event)
        try {
            if (event.url.searchParams.get('token') === null) return resolve(event);
            const currentSession = event.locals.session;
            if (currentSession && currentSession.exp > Date.now() + ttlThreshold) {
                console.log('1. hooks.server useSessionHandler session is valid, returning...');
                return resolve(event)
            } else {
                console.log('2. hooks.server useSessionHandler session is invalid, refreshing...');
                const token = event.url.searchParams.get('token') || '';
                const sessionResponse: SessionResponseType = await refreshSession(token);
                event.locals.session = sessionResponse.session;
                event.locals.token = sessionResponse.token;

                console.log('3. hooks.server useSessionHandler session refreshed: ', JSON.stringify(event.locals.session, null, 2));
                return resolve(event)
            }
        } catch (err) {
            console.log('4. hooks.server useSessionHandler error: ', err);
            return resolve(event)
        }
    }

    const handleAuth: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server handleAuth route: ', event.route.id);
        console.log('00. hooks.server handleAuth mode: ', env.PUBLIC_MODE);
        console.log('1. hooks.server handleAuth event: ', JSON.stringify(event));
        const locals = event.locals;
        const route = event.url.pathname;
        const mode = env.PUBLIC_MODE;
        locals.mode = env.PUBLIC_MODE
        locals.token = event.url.searchParams.get('token') || '';

        try{
            console.log('2. hooks.server handleAuth refreshing locals.session...');
            const token = event.url.searchParams.get('token') || null;
            console.log('3. hooks.server handleAuth locals.session before refresh: ', JSON.stringify(locals.session, null, 2));
            const sessionResponse = await refreshSession(token);
            locals.session = sessionResponse.session;
            console.log('4. hooks.server handleAuth locals.session after refresh: ', JSON.stringify(locals.session, null, 2));
            return resolve(event)
        } catch (err) {
            console.log('5. hooks.server handleAuth error: ', err);
            return resolve(event)
        }
    }

    // authorization hook to check the user is authorized to access the route
    const handleAuth_z: Handle = async ({ event, resolve }): Promise<Response> => {
        
        // passes in the event.route.id and the session user roles if any
        if (!isRestrictedRoute(event.route.id || '',  event.locals.session?.user?.roles || '')) {
            return resolve(event)
        }

        // redirect to /dashboard
        return new Response(null, { status: 302, headers: { Location: '/dashboard' } });
    
    }


// export const handle: Handle = sequence( checkQueryParamToken, authHook);
export const handle: Handle = sequence(
    // callback,
    useSessionHandler,
    // handleAuth,
    handleAuth_z,
)