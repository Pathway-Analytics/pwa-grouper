<script lang='ts'>
import { onMount } from 'svelte';
import { lookUp } from '$lib/migrate/04_adminAreas';
import { env } from '$env/dynamic/public'
import { page } from '$app/stores';
import { 
  Table, TableHead, TableHeadCell,
  TableBody,  TableBodyRow, TableBodyCell,  
  Checkbox, TableSearch, 
  Button
} from 'flowbite-svelte';
 
let data: any = [];
let type: string;
let within: string;

$: {
    if (type || within) {
      fetchData(type, within);
    }
  }

async function triggerEvent(event: string) {
  const response = await fetch(`${env.PUBLIC_API_URL}/process/trigger/${event}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    // include credentials true to allow sending cookies
    credentials: 'include',
    body: JSON.stringify({collections:["E92"], within:"E92000001", lastItem: false})
  });

  if (!response.ok) {
    console.log('Error: Failed to trigger event', await response.text());
  }
}
async function fetchData(type: string, within?: string) {
  console.log('loading...', type, within);
  try {
    data = await lookUp(type, within);
    console.log('Function executed successfully');
  } catch (error) {
    console.log('Error: Error executing function', error);
  }
}

  onMount(async () => {
    if (type) {
      fetchData(type, within);
    }
  });

</script>
  {#if $page.data.session}
    <p>Session: {$page.data.session.user.email}</p>
  {/if}
  
  <Button on:click={() => triggerEvent("fetchChildren")}>Trigger Event</Button>
  <input bind:value={type} placeholder="Enter type" />
  <input bind:value={within} placeholder="Enter collection" />
  <p>Record count: {#if data}{data.length}{:else}0{/if}</p>
  <div class="scrollable-content">
  <Table {data}>
    <TableHead>
      <TableHeadCell>Code</TableHeadCell>
      <TableHeadCell>Name</TableHeadCell>
      <TableHeadCell>Geography</TableHeadCell>
    </TableHead>
    <TableBody>
      {#await data}
        <p>loading...</p>
      {:then data}
        {#each data as row}
          <TableBodyRow>
            <TableBodyCell>
              <a href={row.link} target="_blank">{row.code}</a>
            </TableBodyCell>
            <TableBodyCell>
              {row.name}  
            </TableBodyCell>
            <TableBodyCell>
              {row.geography}  
            </TableBodyCell>
          </TableBodyRow>
        {/each}        
      {:catch error}
        <p>error: {error.message}</p>
      {/await}
    </TableBody>
  </Table>
</div>
  <style>
    .scrollable-content {
      height: 100vh; /* Adjust as needed */
      overflow-y: auto;
    }
  </style>