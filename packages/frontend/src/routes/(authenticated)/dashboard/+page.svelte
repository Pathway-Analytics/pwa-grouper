<script lang='ts'>

    import { page } from '$app/stores';
    console.log('page: ', JSON.stringify(page, null, 2));
</script>

<div class="scrollable">
    <h1>Dashboard</h1>
    {#if $page}
    <pre>Email: {JSON.stringify($page.data?.session?.user?.email, null,2)}</pre>
    {:else}
    <p></p>
    {/if}

    <!-- link to /session  page here -->
    <p>
        <a href="/">Home</a>
    </p>
    <p>
        <a href="/admin/users">users</a>
    </p>

</div>
<style>
    div.scrollable {
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
    }
    </style>

