<script lang='ts'>
    // import list of users from api /users and display in a table
    // provide functionality to add, edit, delete users
    // provide functinality to assign roles to users of RoleType add to user.roles : string csv format
    import { page } from '$app/stores';
    import { Input, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Checkbox, TableSearch } from 'flowbite-svelte';
    import type { UserType } from '@pwa-grouper/core/types/user';
    import type { RoleType } from '@pwa-grouper/core/types/role';
    import { env } from '$env/dynamic/public';
    import { onMount } from 'svelte';

    const authBearer = `Bearer ${$page.data.token}`;

    let user: UserType = {
        id: '' ,
        email: '',
        roles: '',
        firstName: '',
        lastName: '',
        picture: '',
        lastLogin: new Date(),
        contactTel: ''
    };
    let roles: RoleType[] = [];
    type ExtendedUser = UserType & {
        rolesArray: RoleType[],
        isEditing?: boolean,
    };
    
    let users: ExtendedUser[] = [];
    // use the promise here to show loadding....
    let usersPromise: Promise<ExtendedUser[]> 

    // instantiate a new user for adding
    const newUser: ExtendedUser = {
    id: 'new', // or some default value
    email: '@', // or some default value
    rolesArray: [],
    isEditing: true
};
    
    // Editing a input field in a table cell is a bit tricky
    // we need to keep track of the editing user id
    // and only update the bound user array when the user clicks save
    let localUser: ExtendedUser ;

    onMount(async () => {
        await handleGetUsers();
        usersPromise = Promise.resolve(users);
    });

    $: usersPromise = Promise.resolve(users);

    async function handleGetUsers() {
        console.log('local mode, token: ',env.PUBLIC_MODE, $page.data.token);
        if (env.PUBLIC_MODE === 'local'){

            console.log('local mode, token: ', $page.data.token);
            const res = await fetch(`${env.PUBLIC_API_URL}/users`, { 
                credentials: 'include', 
                headers: { 'Authorization': authBearer }
            }
            );
            if (res.ok) {
                users = await res.json();
                users = [...users];
            }
        } else {
            const res = await fetch(`${env.PUBLIC_API_URL}/users`, { 
                credentials: 'include' }
            );
            users = await res.json();
            users = [...users];
        }
    }

    // we use this to take the edited record out of the users array
    // and then put it back in after the update so the UI updates
    // otherwise UI constantly updates on every keystroke and we lose focus
    function handleEdit(user: ExtendedUser) {
        localUser = { ...user };
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1 && users.length > 0) {
            users[index].isEditing = true;
            users = [...users]; // Trigger reactivity
        }
    }

    async function handleUpdateUser(extUser: ExtendedUser | null = null) {
        const isUpdatingUser = extUser !== null;
        const userToUpdate = isUpdatingUser ? localUser : newUser;

        // Close editing immediately for quicker UI response
        userToUpdate.isEditing = false;
        users = [...users]; // Trigger reactivity
        
        const res = await fetch(`${env.PUBLIC_API_URL}/user/${localUser.id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': authBearer,
                'Content-Type': 'application/json',
             },
            credentials: 'include', 
            body: JSON.stringify(localUser),
        });
        
        const updatedUser = await res.json();
        const updatedExtUser: ExtendedUser = { ...updatedUser.res, isEditing: false };
        if (isUpdatingUser) {
            // Update existing user
            const index = users.findIndex(user => user.id === updatedExtUser.id);
            if (index !== -1) {
                users[index] = updatedExtUser;
                console.log('updated user: ', users[index] , JSON.stringify(updatedExtUser));
            } else {
                console.log('Error: User to update not found in the array');
            }
        } else {
            // Add new user
            if (!users.some(user => user.id === updatedExtUser.id)) {
                users = [updatedExtUser, ...users];
            } else {
                console.log('Error: Attempting to add a user with a duplicate ID');
            }
        }
        if (res.ok) {
            // Update local user with the updated user from the server
            localUser = { ...updatedExtUser };
        } else {
            // Update local user with the original user
            localUser = { ...userToUpdate };
        }
        users = [...users]; // Trigger reactivity
    }


    async function handleDeleteUser(extUser:ExtendedUser) {
        const res = await fetch(`${env.PUBLIC_API_URL}/user/${extUser.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        user = await res.json();
        handleGetUsers();
        users = [...users];
    }

    // function to add an empty new user to the users array
    // and set the isEditing flag to true
    async function handleNewUser() {
        let newUser = {} as ExtendedUser;
        newUser.isEditing = true;
        newUser.id = '';
        users = [newUser, ...users];
        usersPromise = Promise.resolve(users);
    }

</script>

<h1>Users</h1>
<!-- use flowbite table and pagination components -->
<!-- https://flowbite.com/docs/components/table/ -->
<!-- https://flowbite.com/docs/components/pagination/ -->

<div class="container mx-auto px-4 sm:px-6 lg:px-8">
<button class="btn btn-primary" on:click={() => handleNewUser()}>Add User</button>

<Table items={users} striped={true} class="divide-y">
    <TableHead>
        <!-- <TableHeadCell>id</TableHeadCell> -->
        <TableHeadCell>id</TableHeadCell>
        <TableHeadCell>eMail</TableHeadCell>
        <TableHeadCell>First Name</TableHeadCell>
        <TableHeadCell>Last Name</TableHeadCell>
        <TableHeadCell>Picture</TableHeadCell>
        <TableHeadCell>Last Login</TableHeadCell>
        <TableHeadCell>Tel</TableHeadCell>
        <TableHeadCell>Roles</TableHeadCell>
        <TableHeadCell></TableHeadCell>
    </TableHead>
    <TableBody>
        {#await usersPromise}
            <TableBodyRow>
                <TableBodyCell colspan='7'>Loading...</TableBodyCell>
            </TableBodyRow>
        {:then}
            <!-- {#if users.length === 0}
                <TableBodyRow>
                    <TableBodyCell colspan="6">No users found</TableBodyCell>
                </TableBodyRow>
            {:else} -->
            {#if users.length > 0}
                {#each users as extUser (extUser.id)}   
                    <TableBodyRow>
                        <!-- <TableBodyCell class='px-2 py-0'>{extUser.id}</TableBodyCell> -->
                        {#if extUser.isEditing}
                            <TableBodyCell class='px-2 py-0 m-0'><Input class='' id='id' size="sm" bind:value={localUser.id} /></TableBodyCell>
                            <TableBodyCell class='px-2 py-0 m-0'><Input class='' id='email' size="sm" bind:value={localUser.email} /></TableBodyCell>
                            <TableBodyCell class='px-2 py-0'><Input class='' id='firstName' size="sm" bind:value={localUser.firstName} /></TableBodyCell>
                            <TableBodyCell class='px-2 py-0'><Input class='' id='lastName' size="sm" bind:value={localUser.lastName} /></TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.picture}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.lastLogin}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'><Input class='' id='contactTel' size="sm" bind:value={localUser.contactTel} /></TableBodyCell>
                            <TableBodyCell class='px-2 py-0'><Input class='' id='roles' size="sm" bind:value={localUser.picture} /></TableBodyCell>
                        {:else}
                            <TableBodyCell class='px-2 py-0'>{extUser.id? extUser.id : ''}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.email}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.firstName}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.lastName}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.picture}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.lastLogin}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.contactTel}</TableBodyCell>
                            <TableBodyCell class='px-2 py-0'>{extUser.roles}</TableBodyCell>
                            {/if}
                        <TableBodyCell class='px-2 py-0'>
                            {#if extUser.isEditing}
                                <button on:click={() => handleUpdateUser(extUser)}>Save</button>
                            {:else}
                            <button on:click={() => handleEdit(extUser)}>Edit</button>
                            {/if}
                            <button on:click={() => handleDeleteUser(extUser)}>Delete</button>    
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            {/if}
        <!-- {/if} -->
        {:catch error}
            <p style="color: red">{error.message}</p>    
        {/await}
    </TableBody>
</Table>
</div>


<p>
    <a href="/dashboard">Dashboard</a>
</p>

<p>
    <a href="/">Home</a>
</p>