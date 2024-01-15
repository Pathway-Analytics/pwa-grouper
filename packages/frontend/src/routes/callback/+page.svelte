<script lang='ts'>
	import { onMount } from 'svelte';
	import { refreshSession } from '$lib/refreshSession';
	import { get } from 'svelte/store';
	// this page is used to handle the callback after login
    // we need a client side call to /api/session to get the session data
    // and then redirect to the dashboard or whaterver urlRediret is set
    // if the page is called with a session, it will redirect to /dashboard or urlRedirect
    // if no session is found, it will redirect to /login
	import type { SessionType, SessionResponseType } from '@pwa-grouper/core/types/session';

    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    const session: SessionType = $page.data.session;
    const urlRedirect = $page.data.urlRedirect;
    const ttlThreshold: number = 30 * 60 * 1000

    onMount(async () => {
        const url= new URL(window.location.href);
        if (session.isValid) {
            goto(urlRedirect || '/dashboard');
        } else {
            try{
                // if the route is public
                console.log('3. hooks.server test refreshing session...');
                const url= new URL(window.location.href);
                const token = url.searchParams.get('token') || '';
                const sessionResponse = await refreshSession(token);
                console.log('4. hooks.server test session refreshed: ', JSON.stringify(sessionResponse, null, 2));
                
            } catch (err) {
                console.log('4. hooks.server test error: ', err);
            }
            
            goto(url.searchParams.get('urlRedirect') || '/dashboard');
        }
    });

</script>