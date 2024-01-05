<script context="module">
    import { menuItems } from "../json/menuItems";

    export function load () {
        return {
            menuItems
        }
    }
</script>
  
<script lang='ts'>
  import { 
    Navbar, NavBrand, NavLi, NavUl, 
    NavHamburger, 
    Avatar, 
    Dropdown, DropdownItem, DropdownHeader, DropdownDivider 
  } from 'flowbite-svelte';
  import { LightSwitch } from '@skeletonlabs/skeleton';
  import { ChevronDownOutline } from 'flowbite-svelte-icons'
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import  SessionManager  from '$lib/classes/SessionManager';
  import type { SessionType } from '@pwa-grouper/core/types/session';
  
  const sessionManager = SessionManager.getInstance();
  let session: SessionType | null ;
  let activeUrl: string | undefined
  let appName = env.PUBLIC_APP_NAME;

  onMount(async () => {
    activeUrl = $page.url.pathname;
    
    session = (await sessionManager.getSession()).session;
    console.log('NavBar session: ',JSON.stringify(session));

  })

  async function handleLogout() {
    console.log('-- calling SessionManager.logout from session page: ');
    session = await sessionManager.logout();
  }

</script>
<span class="block text-sm">{#if !!session?.user?.firstName || !!session?.user?.lastName}{session.user?.lastName} {session.user?.firstName}{/if}</span>

  <Navbar fluid={true}>
    <NavBrand href="/">
      <img src='/favicon.png' class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
      <span class="
        self-center 
        whitespace-nowrap 
        text-xl font-semibold 
        text-primary-500 dark:text-secondary-300">
        {appName}
      </span>
    </NavBrand>
    <div class="flex items-center md:order-2">
      <LightSwitch class="mx-4"/>
      <Avatar class="cursor-pointer z-10" id="avatar-menu" src="/usericon.png" />
      <NavHamburger class="cursor-pointer" class1="w-full md:flex md:w-auto md:order-1" />
    </div>
    <NavUl {activeUrl}>
      {#each menuItems as item}
        {#if item.name === "Settings" && item.menuItems && item.menuItems.length > 0}
          <div class="flex-end">
            <Dropdown placement="bottom" triggeredBy="#avatar-menu">
              <DropdownHeader>
                <span class="block text-sm">{#if !!session?.user?.firstName || !!session?.user?.lastName}{session.user?.lastName} {session.user?.firstName}{/if}</span>
                <span class="block truncate text-sm font-medium">{#if !!session?.user?.email}{session.user?.email}{/if}</span>
              </DropdownHeader>
            {#each item.menuItems as subMenuItem}
              <DropdownItem href={subMenuItem.link} class="right-0">
                {subMenuItem.name}
              </DropdownItem>
            {/each}
            <DropdownDivider />
            <DropdownItem href="/logout">
              <a href="/logout" on:click|preventDefault={handleLogout}>
              Logout
            </DropdownItem>
            </Dropdown>
          </div>
        {:else}
          {#if item.menuItems}
            <NavLi class="cursor-pointer" href={item.link}>
              {item.name}
              <ChevronDownOutline class="
              w-3 h-3 ml-2 text-primary-800 dark:text-white inline" />
            </NavLi>
              <Dropdown class="w-44 z-20">
              {#each item.menuItems as subMenuItem}
                <DropdownItem href={subMenuItem.link}>
                  {subMenuItem.name}
                </DropdownItem>
            {/each} 
              </Dropdown>
            {:else}
            <NavLi  href={item.link} class="cursor-pointer">
              {item.name}
            </NavLi>
          {/if}
        {/if}
      {/each}
    </NavUl>
  </Navbar>