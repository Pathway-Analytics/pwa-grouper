<script lang='ts'>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
    import type { SessionType } from '@pwa-grouper/core/types/session';
    import SessionManager from '$lib/classes/SessionManager';

    let session: SessionType;
    let sessionManager =  SessionManager.getInstance();

    async function handleGetUsers() {
        const res = await fetch(`${env.PUBLIC_API_URL}/session`, 
        { credentials: 'include' }
        );
        session = await res.json();
    }

    // function redirect to dashboard 
    function handleRedirectToDashboard() {
        window.location.href = '/dashboard';
    }

    onMount(async () => {
        // await handleGetUsers();
        session = (await sessionManager.refreshSession()).session;
        handleRedirectToDashboard();

    });


</script>

{#await session}
    <p>loading...</p>
{:then session}
    {#if session}
        <pre>${JSON.stringify(session, null, 2)}</pre>
    {:else}
        <p>no session</p>
    {/if}
{/await}

