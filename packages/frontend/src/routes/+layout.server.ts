import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {

    console.log('+layout.server session in load before locals:', JSON.stringify(locals, null, 2));
    const props = {
        session: locals.session,
        mode: locals.mode,
        devToken: locals.devToken
    };
    console.log('+layout.server session in load before locals:', JSON.stringify(locals, null, 2));

    // return the session
    // save it in page props 
    // in the layout we can access it with $session
    return {
        session: locals.session,
        mode: locals.mode,
        devToken: locals.devToken,
    };
};

