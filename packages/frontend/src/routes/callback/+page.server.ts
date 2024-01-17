import type { SessionResponseType } from "@pwa-grouper/core/types/session";
import type { PageServerLoad } from "./$types";
import { refreshSession } from "$lib/refreshSession";


// return url query string params for token and urlRedirect

// export const load: PageServerLoad = async ({ request, url, cookies, locals }) => {
//     const tokenCookie = cookies.get('auth-token') || '';
//     console.log('0. /callback/+page.server.ts tokenCookie: ', tokenCookie);
//     const tokenURL = url.searchParams.get('token') || '';
//     console.log('0. /callback/+page.server.ts tokenURL: ', tokenURL);
//     const tokenHeader = request.headers.get('Authorization') || '';
//     console.log('0. /callback/+page.server.ts tokenHeader: ', tokenHeader);
//     const urlRedirect = url.searchParams.get('urlRedirect') || 'dashboard';
//     console.log('0. /callback/+page.server.ts urlRedirect: ', urlRedirect);

//     const token =  tokenURL || tokenHeader || tokenCookie;
//     console.log('0. /callback/+page.server.ts token: ', token);

//     try{
//         if (token) {
//             const sessionResponse: SessionResponseType = await refreshSession(token);
//             locals.session = sessionResponse.session;
//             locals.token = sessionResponse.token;
//             locals.message = sessionResponse.errMsg;
//             console.log('1. /callback/+page.server.ts session: ', JSON.stringify(locals.session, null, 2));
//         }
//         console.log('1. /callback/+page.server.ts redirecting to: ',urlRedirect);

        
//         return {
//             props: {
//                 session: locals.session,
//                 token: locals.token,
//                 message: locals.message,
//                 urlRedirect: urlRedirect
//             }
//         }
//     } catch (err) {
//         console.log('5. /callback/+page.server.ts error: ', err);
//         return 
//         {
//             props: {
//             }
//         }
//     }  
// }
 