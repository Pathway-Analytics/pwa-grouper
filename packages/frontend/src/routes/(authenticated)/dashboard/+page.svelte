<script lang='ts'>
    import { page } from '$app/stores';

</script>
<h1>Dashboard</h1>
{#if $page}
<pre>Session: {JSON.stringify($page, null,2)}</pre>
{:else}
<p>hello</p>
{/if}

<!-- link to /session  page here -->
<p>
    <a href="/">Home</a>
</p>
<p>
    <a href="/admin/users">users</a>
</p>


