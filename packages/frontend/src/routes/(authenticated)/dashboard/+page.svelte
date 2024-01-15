<script lang='ts'>
    import { page } from '$app/stores';
	import { onMount } from 'svelte';

    onMount( async () => {
        const session = await fetch(`${process.env.API_URL}/session`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'applicatio\n/json'
            }
        }).then(res => res.json());

        console.log('mounted');
        console.log('session, ', session);
    });
</script>
<h1>Dashboard</h1>
{#if $page.data}
<pre>Session: {JSON.stringify($page.data, null,2)}</pre>
{:else}
<p>hello</p>
{/if}

<!-- link to /session  page here -->
<p>
    <a href="/session">Session</a>
</p>
<p>
    <a href="/admin/users">users</a>
</p>


