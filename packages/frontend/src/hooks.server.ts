import SessionManager from '$lib/classes/SessionManager';
import {sequence} from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/public';
import { emptySession, SessionUserType as SessionUser, type SessionType } from '@pwa-grouper/core/types/session';

// const publicPages = [
//     '/login',
//     '/session',
//     '/public',
//     '/sentry-example',
// ];

// function isPublicRoute(route:string) {
//     return publicPages.includes(route);
// }

// export const handle = sequence(
//     // Sentry.sentryHandle(), 
//     async function _handle({ event, resolve }) {

//         const sessionManager = SessionManager.getInstance();    
//         const mode = env.PUBLIC_MODE;
//         const route = event.url.pathname
//         const IsProtected = !isPublicRoute(route);

//         const session = await sessionManager.getSession();
//         console.log('1. -- hooks.server.ts getSession() :', JSON.stringify(session));

//         if (IsProtected && session.session.sessionUser === SessionUser.PUBLIC && mode !== 'local') {
//             console.log('2. -- hooks.server.ts getSession() redirected:', JSON.stringify(session));
//             return new Response('Redirect', {
//                 status: 302,
//                 headers: {
//                     Location: '/login'
//                 }
//             });
//         } else {
//             return resolve(event);
//         }
//     }
// )
