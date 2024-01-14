<script lang='ts'>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
    import type { SessionType } from '@pwa-grouper/core/types/session';
    import SessionManager from '$lib/classes/SessionManager';

    let sessionGetSession: SessionType;
    let sessionRefreshSession: SessionType;
    let sessionClientFetch: SessionType;
    export let data;
    let sessionServerFetch = data 
    let sessionManager =  SessionManager.getInstance();

    async function handleFetchSession() {
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
        sessionClientFetch = await handleFetchSession();
        sessionGetSession = (await sessionManager.getSession()).session;
        // handleRedirectToDashboard();
    });


</script>

<div class="scrollable">
    <p>Session Manager: getSession</p>
    {#await sessionGetSession}
        <p>loading...</p>
    {:then session}
        {#if session}
            <pre>${JSON.stringify(session.sessionUser, null, 2)}</pre>
        {:else}
            <p>no session</p>
        {/if}
    {/await}


    <p>Session Manager: refreshSession</p>
    {#await sessionRefreshSession}
        <p>loading...</p>
    {:then session}
        {#if session}
            <pre>${JSON.stringify(session.sessionUser, null, 2)}</pre>
        {:else}
            <p>no session</p>
        {/if}
    {/await}

    <p>Client Fetch Session</p>
    {#await sessionClientFetch}
        <p>loading...</p>
    {:then session}
        {#if session}
            <pre>${JSON.stringify(session.sessionUser, null, 2)}</pre>
        {:else}
            <p>no session</p>
        {/if}
    {/await}

    <p>Server Fetch Session</p>
    {#await sessionServerFetch}
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
</div>

<style>
    .scrollable {
      height: 100vh; /* Adjust as needed */
      overflow-y: auto;
    }
  </style>
  