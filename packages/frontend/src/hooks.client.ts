import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const tester: Handle = async ({ event, resolve }) => {

    console.log('0. hooks.client test event: ', JSON.stringify(event, null, 2));
    // fete the session
    const session = await fetch ('/api/session', {
        credentials: 'include'
    });
    console.log('1. hooks.client test session: ', JSON.stringify(session, null, 2));
    
    return resolve(event);
}
export const handle: Handle = sequence(tester);

