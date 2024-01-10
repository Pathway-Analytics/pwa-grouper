<script lang='ts'>
    import { onMount } from 'svelte';
    import { up } from '$lib/migrate/04_adminAreas';
  
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