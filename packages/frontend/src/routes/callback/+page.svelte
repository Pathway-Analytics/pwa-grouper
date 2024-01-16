<script lang='ts'>

import { page } from '$app/stores';

</script>

{#if $page.data}
    <h1>
    Hi {$page.data.session?.user?.firstName} {$page.data.session.user?.lastName}
    <p>
        {$page.data.session.user?.email}
    </p>
    <p>
        {new Date($page.data.session.exp*1000).toUTCString()}
    </p>
    </h1>
{:else}
    <h1>Welcome </h1>
{/if}
