import { sequence } from '@sveltejs/kit/hooks';
import { type Handle, type HandleFetch } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { emptySession, type SessionType } from '@pwa-grouper/core/types/session';
import { RoleType } from '@pwa-grouper/core/types/role';
import { refreshSession } from '$lib/refreshSession';

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

    const handleAuth: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server handleAuth route: ', event.route.id);
        console.log('00. hooks.server handleAuth mode: ', env.PUBLIC_MODE);
        console.log('1. hooks.server handleAuth event: ', JSON.stringify(event));
        const locals = event.locals;
        const route = event.url.pathname;
        const mode = env.PUBLIC_MODE;
        locals.mode = env.PUBLIC_MODE
        locals.devToken = event.url.searchParams.get('token') || '';

        const ttlThreshold: number = 30 * 60 * 1000
        try{
            console.log('2. hooks.server handleAuth refreshing locals.session...');
            const token = event.url.searchParams.get('token') || '';
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
    handleAuth,
    handleAuth_z,
)