import type { PageServerLoad } from "./$types";
import { env } from '$env/dynamic/public';
import { refreshSession } from "$lib/refreshSession";

const  load: PageServerLoad = async ({ url, locals }) => {
    // const res = await fetch(`${env.PUBLIC_API_URL}/session`, {
    //     method: 'GET',
    //     headers: { 'Content-Type': 'application/json' },
    //     credentials: 'include',
    // });
    const token = url.searchParams.get('token') ||'';
    const sessionResponse = await refreshSession(token);
    const session = sessionResponse.session;
    const message = sessionResponse.message;
    console.log('0. callback +page.server.ts sessionResponse: ', JSON.stringify(sessionResponse, null, 2));

    locals.session = session;
    locals.devToken = env.PUBLIC_MODE === 'local' ? token : '';
    locals.mode = env.PUBLIC_MODE;

    return {
        data: {
            session: locals.session,
            devToken: locals.devToken,
            mode: locals.mode,
        },
    };
};