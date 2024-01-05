<script lang="ts">
	import { onMount } from 'svelte';
    import SessionManager from '$lib/classes/SessionManager';
    import type { SessionType, SessionResponseType } from '@sst-starter3/core/types/session';
    import { env } from '$env/dynamic/public';

    const sessionManager = SessionManager.getInstance();
    let session: SessionType | null ;
    let session_api: SessionType | null ;
    console.log('--  session page: ');

    onMount(async () => {
        // call the session manager to get the session
        session = await handleGetSession();

        // test for the direct api call as well
        const res = await fetch(`${env.PUBLIC_API_URL}/session`, { credentials: 'include' });
        session_api = await res.json();        
    });

    async function handleGetSession() {

        console.log('1. -- calling SessionManager.getSession from session page: ');
                
        try {
            let response = await sessionManager.getSession();
            if (response instanceof Response) {
                let session = await response.json();
                // console.log('2. -- result from SessionManager.getSession from session page: ', JSON.stringify(session));
                // this is probably an errror being returned
                return session;
            } else if (response === null){
                return null;
            } else {
                return response as SessionResponseType;
            }
        } catch (error) {
            console.error('Error in session validation, getSession():', error);
            return null;
        }

    }

    async function handleLogout() {
        console.log('-- calling SessionManager.logout from session page: ');
        session = await sessionManager.logout();
    }
</script>
<p>
    OnMount this page will automatically set a fresh token.
    <br />
    SetSession will evaluate the local svelte store and only refresh if it needs to.
    <br />
    Logout will clear the local svelte store and the session cookie.
</p>
<button on:click={handleGetSession}>Get Session</button>
<button on:click={handleLogout}>Logout</button>

{#if session}
    <div class="m2">
        <p>sessionManager</p>
        <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>    
{:else }

    <div class="m2">
        <p>Loading session state...</p>
    </div>
    
{/if}
<a href={`${env.PUBLIC_API_URL}/session`}>Session</a>