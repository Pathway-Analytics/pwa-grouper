<script lang="ts">
    import { LightSwitch } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';
        
</script>
<LightSwitch />
 {#if $page.data.session}
    <h1>
        Hi {$page.data.session} 
    </h1>
{:else}
    <h1>Welcome </h1>
{/if}
