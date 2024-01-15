<script lang='ts'>
    import { page } from '$app/stores';
	import { onMount } from 'svelte';
    import { env } from '$env/dynamic/public';

    onMount( async () => {
        const session = await fetch(`${env.PUBLIC_API_URL}/session`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json());

        console.log('dashboard mounted');
        console.log('dashboard session: ', session);
        console.log('dashboard locals: ', JSON.stringify($page, null,2) );
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


