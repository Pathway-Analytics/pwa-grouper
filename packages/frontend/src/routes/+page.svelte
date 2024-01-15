<script lang="ts">
    import { LightSwitch } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';

</script>
<LightSwitch />
 {#if $page.data.session.user}
    <h1>
        Hi {$page.data.session.user.firstName} {$page.data.session.user.lastName}
        <p>
            {$page.data.session.user.email}
        </p>
        <p>
            {new Date($page.data.session.exp*1000).toUTCString()}
        </p>
    </h1>
{:else}
<h1>Welcome </h1>
{/if}

{#if $page.data.mode}
    <p>
        {$page.data.mode}
    </p>
{/if}
    <!-- link to dashbaord -->
    <p>
        <a href="/dashboard">Dashboard</a>
    </p>
    
