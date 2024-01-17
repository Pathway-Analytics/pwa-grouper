# Background

Firstly, before we start a word of warning, if we set:

```ts
        headers: {
            'Authorization': `Bearer ${authToken}`,
            // Other necessary headers
        },
```

and then we read

```ts
const token = useHeader("Authorization") // this will not read the token
```

Do not expect a lambda function running on node to read the header you set.  Node lowercases the header keys!

```ts
const token = useHeader("authorization") // this will read the token
```

Serverside cookie handling is a common challenge when dealing with cookies in server-side requests, especially in a setup where the frontend and API are on different subdomains. Even though you've set the cookie domain to .my-stage.mydomain.com, which should theoretically cover both the API (api.my-stage.mydomain.com) and the frontend (my-stage.mydomain.com), server-side requests in SvelteKit do not automatically include cookies.

Different Contexts: In a server-side rendering context (like SvelteKit's SSR), the server does not have access to the browser's cookies. When you make a fetch request server-side, it doesn't automatically include cookies that would be included in a client-side fetch.

Node Environment: The server-side of SvelteKit runs in a Node.js environment, which does not automatically handle cookies like a browser does.

To ensure that server-side requests include the necessary cookies, you'll need to manually pass the cookie from the client to the server-side context and include it in your fetch requests.

# Login Flow

This assume the api is on api.my-stage-my-app.domain.com and the frontend on .my-stage-my-app.domain.com.

Client side form submits email claim to /api/auth/link/authorize
auth handler construct responds with onLink()
sends email with temporary token to claim email 
user clicks link in email with token in the queryParams to /api/auth/link/callback

auth handler construct responds with onSuccess() function
sends response to the redirect url 
the response contains a cookie which encode the session params
>> we intercept the response before it is sent to reconfigure the cookie
>> we make the Domain= the .my-stage-my-app.domain.com which covers both api and frontend.

To pass the auth-token cookie from a client-side page to event.locals for use in server-side hooks, you need to create a flow that captures the cookie client-side and then sends it to the server in a way that can be accessed in the server-side context. Here's how you can do it:

To capture the cookie on the client side, you can use a script in your Svelte component. However, note that load in +page.svelte runs both on the server and client side. So, you need to ensure that the cookie reading logic only runs on the client side.

## Step 1: Capture Cookie in Server-Side Load Function

Start by capturing the cookie in the server-side load function of your callback page (/callback/+page.server.ts).

/callback/+page.server.ts

```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
    const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];

    // Pass the token to the client-side
    return {
        props: {
            token
        }
    };
};
```

In this code, you're extracting the auth-token cookie from the request headers and passing it as a prop to the client-side.

## Step 2: Pass Cookie to Client-Side

Next, receive the token in your client-side component and store it for future use, possibly in a store or local variable.

/callback/+page.svelte

```ts
<script lang="ts">
    export let token: string;

    // You can now use the token on the client-side
    // Optionally, store it in a client-side store or local storage for future use
</script>
```

## Step 3: Send Cookie Back to Server on Navigation or API Requests

When making a server-side request (e.g., during navigation or an API call), send the token back to the server. This can be done via custom headers or as part of the request context.

Sending token in a custom header (Client-Side Example)

```ts
fetch('/some-server-endpoint', {
    headers: {
        'X-Auth-Token': token
    }
});
```

## Step 4: Extract Cookie in hooks.server.ts

In hooks.server.ts, extract the auth-token from the incoming request headers and attach it to event.locals.

/src/hooks.server.ts

```ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const authToken = event.request.headers.get('x-auth-token');
    if (authToken) {
        event.locals.authToken = authToken;
    }

    return resolve(event);
};
```

## Step 5: Use the Cookie in Server-Side API Requests

Finally, use the authToken from event.locals in your server-side API requests.

Example Usage in a Server-Side Endpoint or
Page Server Module:

```ts
// src/routes/some-endpoint/+server.ts or in your +page.server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ locals }) => {
    // Retrieve the auth-token from locals
    const authToken = locals.authToken;

    // Include the auth-token in the server-side fetch request
    const response = await fetch('https://api.my-stage.mydomain.com/your-api-endpoint', {
        headers: {
            'authorization': `Bearer ${authToken}`,
            // Other necessary headers
        },
        credentials: 'include'
    });

    // Handle the response
    // ...
};
```

/callback/+page.svelte
```ts
<script>
import { browser } from '$app/env';
import { onMount } from 'svelte';

let authToken;

onMount(() => {
    if (browser) {
    // Assuming the cookie is accessible via document.cookie
    authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token')).split('=')[1];
        // Send the token to the server
        sendTokenToServer(authToken);
    }
});

async function sendTokenToServer(token) {
    await fetch('/api/store-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
}
</script>
```