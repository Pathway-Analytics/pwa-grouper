<script lang='ts'>
import { onMount } from 'svelte';
import { up } from '$lib/migrate/04_adminAreas';
import { 
  Table, TableHead, TableHeadCell,
  TableBody,  TableBodyRow, TableBodyCell,  
  Checkbox, TableSearch 
} from 'flowbite-svelte';


let data: any = [];

onMount(async () => {
  console.log('loading...');
      try {
        await up();
        console.log('Function executed successfully');
      } catch (error) {
        console.error('Error executing function', error);
      }
});
  </script>
  <Table {data}>
    <TableHead>
      <TableHeadCell>LSOA</TableHeadCell>
      <TableHeadCell>Code</TableHeadCell>
      <TableHeadCell>Name</TableHeadCell>
    </TableHead>
    <TableBody>
      {#await data}
        <p>loading...</p>
      {:then data}
        {#each data as row}
          <TableBodyRow>
            <TableBodyCell>
              {row.id}  
            </TableBodyCell>
            <TableBodyCell>
              {row.code}  
            </TableBodyCell>
            <TableBodyCell>
              {row.name}  
            </TableBodyCell>
          </TableBodyRow>
        {/each}        
      {:catch error}
        <p>error: {error.message}</p>
      {/await}
    </TableBody>
  </Table>