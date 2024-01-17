<script lang='ts'>

import { page } from '$app/stores';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';

onMount(async () => {
    // redirect to dashboard or querysting ('urlRedirect') if present
    const urlRedirect = $page.url.searchParams.get('urlRedirect') || '/dashboard';
    console.log('urlRedirect: ', urlRedirect);

    // redirect status 302
    goto(urlRedirect, { replaceState: true });

});
        
</script>
<div class="scrollable">
{#if $page}
<p>loaded!</p>
{:else}
    <p>loading ... loading ...</p>
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