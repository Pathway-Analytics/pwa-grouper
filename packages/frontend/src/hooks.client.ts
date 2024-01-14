import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/public';

const tester: Handle = async ({ event, resolve }) => {

    console.log('0. hooks.client test event: ', JSON.stringify(event, null, 2));
    // fetch the session
    const resource = `${env.PUBLIC_API_URL}/session`
    const session = await fetch (resource, {
        method: 'GET',
        credentials: 'include'
    });
    console.log('1. hooks.client test session: ', JSON.stringify(session, null, 2));

    return resolve(event);
}
export const handle: Handle = sequence(tester);

