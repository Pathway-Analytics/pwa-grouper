import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {

    console.log('+layout.server session in load locals:', JSON.stringify(locals, null, 2));

    // if the session is valid, return the session
    // save it in locals so it can be used in the layout
    // in the layout we can access it with $session
    return {
        session: locals.session.session,
        mode: locals.mode,
        devToken: locals.devToken,
    };
};