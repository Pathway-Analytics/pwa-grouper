<script lang='ts'>

import { page } from '$app/stores';
import { refreshSession } from '$lib/refreshSession';
import { onMount } from 'svelte';
import { Input, Table, TableBody, Button, 
    TableBodyCell, TableBodyRow, TableHead, 
    TableHeadCell, Checkbox, TableSearch 
} from 'flowbite-svelte';
        
</script>
<div class="scrollable">
{#if $page}
<p>Session from refreshSession() called from the client side: </p>
    <pre>{JSON.stringify($page, null,2)}</pre>
        <Button>
            <a href="/dashboard">Dashboard</a>
        </Button>

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




<Button>
    <a href="/">Home</a>
</Button>

<style>
    div.scrollable {
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
    }
    </style>
</div>