import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    console.log('+layout.server session in load locals:', locals.session);

    return {session: locals.session};
};