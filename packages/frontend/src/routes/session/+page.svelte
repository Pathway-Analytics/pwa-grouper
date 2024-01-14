<script lang='ts'>
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/private';
    import type { SessionType } from '@pwa-grouper/core/types/session';

    let session: SessionType;

    async function handleGetUsers() {
        const res = await fetch(`${env.PUBLIC_API_URL}/session`, 
        { credentials: 'include' }
        );
        session = await res.json();
    }
    onMount(async () => {
        await handleGetUsers();
    });
</script>

{#await session}
    <p>loading...</p>
{:then session}
    {#if session}
        <p>session</p>
    {:else}
        <p>no session</p>
    {/if}
{/await}

