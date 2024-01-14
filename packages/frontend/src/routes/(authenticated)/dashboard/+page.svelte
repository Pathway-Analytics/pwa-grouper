<script lang='ts'>
    import { page } from '$app/stores';
</script>
<h1>Dashboard</h1>
{#if $page.data.session.user.email}
<p>Session: {$page.data.session.user.email}</p>
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


