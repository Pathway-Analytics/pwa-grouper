<script lang='ts'>
    import { page } from '$app/stores';
</script>
<h1>Dashboard</h1>
{#if $page.data.session}
<p>Session: {$page.data.session.user.email}</p>
{:else}
<p>hello</p>
{/if}

