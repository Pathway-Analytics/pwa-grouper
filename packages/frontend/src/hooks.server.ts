import { sequence } from '@sveltejs/kit/hooks';
import { type Handle, type HandleFetch } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { RoleType } from '@pwa-grouper/core/types/role';
import { refreshSession } from '$lib/refreshSession';
import type { SessionResponseType, SessionType } from '@pwa-grouper/core/types/session';

const ttlThreshold: number = 30 * 60 * 1000  // ttl for session before we refresh to keep alive


// ===== Helpers ====
    // function isRestrictedRoute accepts route param of type string or undefined
    // pass in the event.route.id and the optional required route 'provider' or 'admin'
    function isRestrictedRoute(routeId: string | undefined, session :SessionType): boolean {
         
        // session roles array add authenticated
        let roles: string[] = [];
        let routes: string[] = [];
        console.log('0. hooks.server isRestrictedRoute session: ', JSON.stringify(session, null, 2));
        if (session.isValid === true ){
             roles = `${session.user?.roles?.toLowerCase()},authenticated`?.split(',') || [];
        } 
        console.log('1. hooks.server isRestrictedRoute roles: ', roles);
        // does the roles array include 'admin', then return false (not restricted)
        if (roles.includes(RoleType.ADMIN)) return false;
        
        // array of any string between parentheses in the routeId
        routes = routeId?.match(/\((.*?)\)/g)?.map(route => route.replace(/[\(\)]/g, '')) || [];
        console.log('2. hooks.server isRestrictedRoute routes: ', routes);
        
        // does the roles array include all the required matches?
        const allMatchesIncluded: boolean = routes?.every(route => roles.includes(route)) || false;
        let isRestricted: boolean = !allMatchesIncluded;
        console.log('3. hooks.server isRestrictedRoute allMatchesIncluded: ', allMatchesIncluded);
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

    // if the route is /callback and the token is there set the session
    // anything hitting /callback with a token in the query string 
     const initAuthHandler: Handle = async ({ event, resolve }): Promise<Response> => {
        // if route.id is /callback
        // and the event.url.searchParams.get('token') is not null
        const tokenCookie = event.cookies.get('auth-token') || '';
        console.log('0. initAuthHandlers tokenCookie: ', tokenCookie);
        const tokenURL = event.url.searchParams.get('auth-token') || '';
        console.log('0. initAuthHandler tokenURL: ', tokenURL);
        const tokenHeader = event.request.headers.get('Authorization') || '';
        console.log('0. initAuthHandler tokenHeader: ', tokenHeader);
        const urlRedirect = event.url.searchParams.get('urlRedirect') || 'dashboard';
        console.log('0. initAuthHandler urlRedirect: ', urlRedirect);
    
            
        try{
            console.log('0. hooks.server initAuthHandler route: ', event.route.id);
            console.log('1. hooks.server initAuthHandler token: ', event.url.searchParams || '');
            if (event.route.id === '/callback' && event.url.searchParams.get('token') !== null) {
                console.log('0. hooks.server initAuthHandler request: ', JSON.stringify(event.request, null, 2));
                const token = event.url.searchParams.get('token') || '';
                const urlRedirect = event.url.searchParams.get('urlRedirect') || 'dashboard';

                console.log('1. hooks.server initAuthHandler session initialising... ', token? 'token found' : 'token not found');
                    
                const sessionResponse: SessionResponseType = await refreshSession(token);
                event.locals.session = sessionResponse.session;
                event.locals.token = sessionResponse.token;
                event.locals.message = sessionResponse.errMsg;
                console.log('2. hooks.server initAuthHandler session initialised: ', JSON.stringify(event.locals.session, null, 2));
            
                console.log('3. hooks.server initAuthHandler session redirecting: ', urlRedirect || '');
                return new Response(null, {
                    status: 302, // Temporary redirect
                    headers: {
                        Location: `/${urlRedirect}` || '/dashboard',
                    }
                });
                
            } else {
                console.log('4. hooks.server initAuthHandler skipped... ');
                const response = await resolve(event);
                return response;
            }
        } catch (err) {
            console.log('5. hooks.server initAuthHandler error: ', err);
            return new Response(null, {
                status: 400, // Temporary redirect
                headers: {
                    Location: '/error',
                }
            });
        }
    }

    // check if the session is valid on the frontend, if not try to refresh it
    const authHandler: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server authHandler route: ', event.route.id);
        
        try {
            if (event.locals.token && // there is a token
                event.locals.session.exp - Date.now() < ttlThreshold && //about to expire
                event.locals.session.exp > Date.now() // not yet expired
            ) {
                // refresh the session
                const token = event.locals.token;
                console.log('1. hooks.server authHandler session expired, refreshing...');
                const sessionResponse: SessionResponseType = await refreshSession(token);
                event.locals.session = sessionResponse.session;
                event.locals.token = sessionResponse.token;
                event.locals.message = sessionResponse.errMsg;
                console.log('2. hooks.server authHandler session refreshed: ', JSON.stringify(event.locals.session, null, 2));
    
                const response = await resolve(event);
                return response;

            } else if (event.locals.token &&
                event.locals.session.exp > Date.now() - ttlThreshold // not expired
                ) {
                // session is valid
                console.log('3. hooks.server authHandler valid session: ');
                const response = await resolve(event);
                return response;
            } else {
                // no session is not valid 
                // authZHandler will hanle any redirects later...
                console.log('4. hooks.server authHandler no session found: ');
                const response = await resolve(event);
                return response;
            }

        } catch (err) {
            console.log('5. hooks.server authHandler error: ', err);
            return new Response(null, {
                status: 400, // Temporary redirect
                headers: {
                    Location: '/error',
                }
            });
        }
    }

    // authorization hook to check the user is authorized to access the route
    const authZHandler: Handle = async ({ event, resolve }): Promise<Response> => {
        console.log('0. hooks.server authZHandler route id: ', event.route.id);
        console.log('1. hooks.server authZHandler route roles: ',  event.locals.session?.user?.roles || '');
                        
        // passes in the event.route.id and the session user roles if any
        if (!isRestrictedRoute(event.route.id || '',  event.locals.session?.user?.roles || '')) {
            console.log('3. hooks.server authZHandler route is not restricted ');
            const response = await resolve(event);
            return response;

        } else {
            console.log('5. hooks.server authZHandler route is RESTRICTED redirecting...');
            return new Response(null, {
                status: 302, // Temporary redirect
                headers: {
                    Location: '/login',
                }
            });
        }
    }

// we cannot garuntee the order of the hooks as some may be async
// export const handle: Handle = sequence( checkQueryParamToken, authHook);
// src/hooks.server.ts
// export const handle: Handle = async ({ event, resolve }) => {
//     // const handleInitAuth = () => initAuthHandler({ event, resolve: handleAuth });
//     // const handleAuth = () => authHandler({ event, resolve: handleAuthZ });
//     // const handleAuthZ = () => authZHandler({ event, resolve });

//     // return handleInitAuth();
// };


export const handle: Handle = sequence(
    initAuthHandler,
    // authHandler,
    // authZHandler,
)

