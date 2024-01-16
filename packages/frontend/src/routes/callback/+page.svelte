<script lang='ts'>

import { page } from '$app/stores';
import { refreshSession } from '$lib/refreshSession';
import { onMount } from 'svelte';
    
    let SessionResponse={}

    onMount (async () => {
        console.log('callback +page', $page);
        const token = $page.url.searchParams.get('token') || '';
         SessionResponse = await refreshSession(token);
        console.log('SessionResponse', JSON.stringify(SessionResponse, null, 2));
        
    });
</script>
<div class="scrollable">
{#if SessionResponse}
<p>Session from refreshSession() called from the client side: </p>
    <pre>{JSON.stringify(SessionResponse, null,2)}</pre>
{:else}
    <p>loading SessionResponse...</p>
{/if}


<p>
    Session data extracted from local store:
</p>

{#if $page.data}
    <h1>
    Hi {$page.data.session?.user?.firstName} {$page.data.session?.user?.lastName}
    <p>
        {$page.data.session?.user?.email}
    </p>
    <p>
        {new Date($page.data.session?.exp*1000).toUTCString()}
    </p>
    </h1>
{:else}
    <h1>Welcome </h1>
{/if}

<style>
    div.scrollable {
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
    }
    </style>
</div>