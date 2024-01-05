// check SessionManager.getSession() and re-route to login if session is invalid
import SessionManager from '$lib/classes/SessionManager';
import  { SessionUserType as SessionUser } from '@sst-starter3/core/types/session';
import { env } from '$env/dynamic/public';
import { page } from '$app/stores'; // Import the page store
import { resolve } from 'path';

// Define a whitelist of public pages (routes)
const publicPages = [
    '/login', 
    '/session', 
    '/public', 
    '/sentry-example'
];

// Define route as the current page
let route: string;
const unsubscribe = page.subscribe(value => {
    route = (value.route?.id ?? '').toString();
});

// Define a function to check if a route is public
const isPublicRoute = (route: string): boolean => {
    return publicPages.includes(route);
}

// Subscribe to changes in the session and page
const sessionManager = SessionManager.getInstance();
console.log('0. -- hooks.client.ts getSession() for route: ');

export async function load (){
// async function authzSession() {
    const sessionManager = SessionManager.getInstance();    
    const mode = env.PUBLIC_MODE;
    const route = page.subscribe(value => value.route).toString();
    
    const session = await sessionManager.getSession();
    console.log('1. -- hooks.server.ts getSession() :', JSON.stringify(session));

    if (isPublicRoute(route) && session.session.sessionUser === SessionUser.PUBLIC && mode !== 'local') {
        console.log('2. -- hooks.server.ts getSession() redirected:', JSON.stringify(session));
        return new Response('Redirect', {
            status: 302,
            headers: {
                Location: '/login'
            }
        });
    } else {
        return resolve;
    }
}

