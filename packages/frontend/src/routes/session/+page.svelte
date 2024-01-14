<script lang='ts'>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
    import type { SessionType } from '@pwa-grouper/core/types/session';
    import SessionManager from '$lib/classes/SessionManager';

    let sessionRefreshSession: SessionType;
    let sessionFetch: SessionType;
    let sessionManager =  SessionManager.getInstance();

    async function handleGetSession() {
        const res = await fetch(`${env.PUBLIC_API_URL}/session`, 
        { credentials: 'include' }
        );
        return res.json();
    }

    // function redirect to dashboard 
    function handleRedirectToDashboard() {
        window.location.href = '/dashboard';
    }

    onMount(async () => {
        // await handleGetUsers();
        sessionRefreshSession = (await sessionManager.refreshSession()).session;
        sessionFetch = await handleGetSession();
        // handleRedirectToDashboard();
    });


</script>

<p>sessionRefreshSession</p>
{#await sessionRefreshSession}
    <p>loading...</p>
{:then session}
    {#if session}
        <pre>${JSON.stringify(session, null, 2)}</pre>
    {:else}
        <p>no session</p>
    {/if}
{/await}

<p>sessionFetch</p>
{#await sessionRefreshSession}
    <p>loading...</p>
{:then session}
    {#if session}
        <pre>${JSON.stringify(session, null, 2)}</pre>
    {:else}
        <p>no session</p>
    {/if}
{/await}

<p>
    <a href="/dashboard">Dashboard</a>
</p>
<p>
    <a href="/admin/users">users</a>
</p>