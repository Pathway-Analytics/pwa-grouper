<script lang='ts'>
    import { page } from '$app/stores';

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


