# Authentication & Authorization  

*(to be search-friendly authorization not authorisation)*

- **Authentication**: the claims being made are 'authentic'  
- **Authorization**: the access being sought is 'permitted'  

In this starter two authentication hadlers are implemented Google 0Auth and Magic link.  It is worth pointing out the obvious, that Google is a third party 0Auth provider so we are relying on a trusted third party to provide a temporary token and Magic link is native to the host.  

Frustratingly, authentication & authorization are one of the more challenging aspects of developing a website, however, they are an early requirement to achieve anything useful.  So new developers find themselves facing steep learning curve and a wide range of complex issues not often encountered in 'normal' developement and it is a steep learning curve.  It can be a long time before they become productive with a workable solution.

This note covers what I learnt along that journey.

## Authentication

In the sst framework, the claims authentication is made my the chosen authentication adapter (Google, Github MAgic Link etc) and then a local token is set by the api host that is attached to the api.  This  auth-token has the following properties:

- Name: auth-token
- Value: a jwt token that can be decoded to reveal the SessionTypes objet.  
- Domain: the domain is not actually set but it adopts the api subdomain  
- Path: /  
- Expires: seven days from the creation date
- HttpOnly is set  
- Secure is set  
- SameSite: none
- Partition:
- Priority: Medium  

The only part that can be configured within sst is the SessionType object carried within the jwt token.  (By the way, I am referring to the jwt but it is not really a fully compliant jwt because we do not expose a jwks endpoint to validate it - sst uses useSession, more on this later.)

Now these may not be the settings you want, in particular, you will probably want to access the secure HttpOnly token from the Frontend server, but unless you have configured you api to use the same domain (which could be a good option), then you will atleast want to alter the domain to accomodate your Frontend probably by setting the parent domain with a '.' prefix '.parentdomain.com' this will accomodate requests to parentdomain.com, and api.parentdomain.com.  Even so, the secure cookie can only be read from server side. So you may want to add some user related data as another cookie.

Assuming we have the frontend on mydomain.com and the api on api.mydomain.com, the flow is:

1. Login: mydomain.com/login
2. Authenticate: api.mydomain.com/auth/link/authorize (for example)
3. User allows claims to be shared or clicks email link
4. api.mydomain.com/auth/link/callback (for example) the auth handler onSuccess action then creates session cookie or parameters, we have implemented Session.cookie.  The auth-token cookie is set.
5. mydomain.com/callback then resets the auth-token with the specific parameters required for the frontend, eg for Domain=.mydomain.com; and Expires can be set according to user role for example.
6. The final redirect is made as required.

By hitting mydomain.com/callback with a valid current token at any time, the token is effectivly refreshed or revalidated on BOTH the api and frontend.  Any user data cookies set at this time are also updated.  Well, that's what I had planned, but expiring and setting a new cookie both with the same name and in the same request causes unpredictable cookie behaviour.  So it was easier to set a new fe-auth-token cookie with a domain set to .frontend.mydomain.com for use on the frontend server instead.

Doing this with http://localhost:5173 is not possible since secure cooies require a https:// connection.  So for stages that are local the cookie is not set as secure.

mydomain.com/logout does the same thing but simply sets the Expires to 0 which effectivly deletes the cookies and logs out the session.  

## Authorization

With third party 0Auth and stateless authentication, there is no need to store passwords and users to allow access; any user can login as long as they can validate their claimed email with the 0Auth provider.  This may not be what you want to protect your site, you may want to predefine your users or grant them a temporary role until they meet some other requirement - like paying!  

In this starter, there is an .env variable SELF_REG that determines how the site handles user 'registration' which all starts with the valid 0Auth claim.  The starter does not handle more complex role management other than to offer a collection of different roles in the RoleType used in user.roles, these could be used to manage access to components and api requests.

But to stop the admin getting locked out there is a .env variable ADMIN_USER_EMAIL allows the declaration of the admin email, when a login claims this email the login flow continues and sets the user with the .env variable ADMIN_USER_ROLE role, even if .env variable SELF_REG is false.

The .env variable SELF_REG flag allows or prevents users from logging in unless they are already listed in the users table.  When set false, the login flow checks the users table for the claimed email address and only if it is present does it allow login (with the exception of the ADMIN_USER_EMAIL).

### API Authorizer

A word about the sst [ApiAuthorizer](https://docs.sst.dev/constructs/Api#authorization) which can be set as a default or per route as nonen, iam, jwt or lambda.  The ApiAuthorizer acts on the ApiGateway and validates the api request assigning it an iam policy before it is processed.  If you want to offer multiple authentication methods it is not clear how this can work unless you lambda, however, I have not been able to get an Api with an ApiAuthorizer of lambda to be accepted by the ApiAttachmentProps expected when attaching the api to the auth stack.

Each endpoint function is therefore wrapped in a withAuthAndErrorHandling() function.  This is not ideal as the lambda function is fired up even if the request is not valid, whereas I suspect the ApiAuthorizer is a higherlevel authorization that limits access to the ApiGateway itself - idk.

## Implementation

### API  

SST provides the ApiHandler wrapper to the AWS APIGateway using this wrapper you can get access to the useSession.  jwtDecode will decode the token but it cannot validate the signature, you would need to do this retreiving the public ket from AWS System Manager, which is why we need useSession instead.  When useSession returns the decoded token we are told it has done a full signtature validation as well.

So we can wrap our main apiendpoints in our ApiHandler(withAuthAndErrorHandling(main)) handler wrapper and validate access to the api as required.  This validation soley uses useSession and the auth-token cookie.

### Frontend

How do we get authorization to the frontend?  The cookie is httponly, secure with a Domain set specifically to the api's subdomain so although the auth-token can authenticate the frontend requests, we cannot read the token in the frontend.  We could possibly host the api and frontend on the same subdomain allowing both frontend and api to share access to the auth-token cookie.  Alternatively, we create a /session endpoint to read the token.  Token issued at time are in the token payload and can be read, but expires at time is not readable (you can see it in the browser inspector though).  The advantage of using a /session endpoint is that it allows us to set the token so we can refresh it and by setting the token we can then know the issued at time and expiry time and we can implement a refresh policy.  The /session endpoint sets the new token and returns a response with the expiry time.

So in the frontend we could hit the /session endpoint at every request and interaction or we could make a local copy of the claimed user credentials like name, id, email and any role etc along with the expiry time and place it in a svelte store.  Every time we call it we can check the expiry time and time to live and see if we need to refresh it.  

Using hooks.server.ts in the root we can implement a simple protected roots policy that checks the users session credentials against a local svelte store at every route request.  When the time to live of the local credentials are near expiry it can send a fetch request to /session which will validate the auth-token and refresh it.  In the starter we have set the initial expiry time to 1 hour and the time to live before refresh is 30 minutes.

Finally, rather than allow free access to the session local store we have encapsulated it in a SessionManager class with the methods getSession and logout.  getSession will return the local store credentials unless ttl indicates a refresh is required in which case it will hit the /session endoint which will validate the auth-token in the request and reset it if valid for another 1 hour.

Logout is a simple, the local store is deleted and the /logout endpoint expires the auth-token before redirecting to the /login page.  

### Flow

#### Session Refresh  

Let me take you on a journey - its a round trip!

![Flow](Auth%20Flows-Session%20Refresh.drawio.png)

- Each task is compartmentalised maintaining a suitable separation of concerns.
- We let errors bubble up to the point where they can be handled.  We could centralise api error handling in the authzHandler wrapper, never releasing an error to a requesting page, but that might limit our ability to respond appropriately to errors.  So errors bubble up to the requestor.
- The flow diagram demonstrates a route request being checked by .hookes with the request being passed up as far as necessary to validate the session and permit the request.  Once the page is called it makes a call for data and there is a second flow demonstrating that.
- **.hooks** handles redirects and provides route gatekeeping.  It also handles errors from SessionManager such as directing the user to /login if there is no valid session.
- **SessionManager** It holds the user data in a private svelte store within SessionManager and it is the session source of truth in the frontend. 
  - getSession() is used by .hooks, it checks for ttl and initiates a token refresh if necessary, it returns errors for .hooks to handle.  Returns a session object which includes:  
    - userType
    - issued at,  
    - expiry,  
    - isValid,  
    - user record,
  - Session() dose not return a response it is an internal function call so we bubble any error and status back up through the returned object which can then be handled as required.
  
  ```typescript  
  { SessionType | null | { error, status } }
  ```

  - syncSession() just returns session object or null - no need for error handling so use it anywhere in the frontend.
  - logout() destroys the local store and calls /logout.
- **authzHandler()** handles api authroization and error trapping.  It returns errors.  In the case of the /seesion refresh api it just does 500 errors.
- **useSession()** validates the tokens presented and decodes them returning the claims.
- **/session api** endpoint get user data and refreshes the token cookie with a new expiry time.  
- **/logout api** endpoint expires the auth-token.

#### API Call

![Api Call](Auth%20Flows-Api%20Call.drawio.png)  

- The Api call flow is very similar except:
  - There is no .hooks.server.ts involvement
  - There is no SessionManager involvement
  - authzHandler validates authorization based on the auth-token and useSession() and does basic error trapping prior to call the api.
  - useSession() validates the authToken and returns claims.
  - It is left up to the requesting page to handle any necessary redirects and errors.

### Artifacts

Frontend authorization, SessionManager.ts SessionManager

- getInstance  
  initiates sessionManager as a singleton instance.
- getSession  
 If local store is empty fetches /session which resets auth-tokrn expiry, then creates and populates local svelte store with a validated claims and associated user details.  Otherwise, checks the expiry time to live from the local store and refreshes token as necssary from /session. Then returns session, claims and user data.
- getSessionSync
  an alternative to getSession that just looks in the local store and does not need to manage errors and redirects - suitable for use in components
- logout
 deletes local session store and expires auth-token by fetching /logout

Example:

```typescript

import SessionManager from '$lib/classes/SessionManager';
const sessionManager = SessionManager.getInstance();
const session = sessionManager.getSession();
const session = sessionManager.logout();
```

API authorization
Endpoint handlers wrapped in a withAuthAndErrorHandling handler
Uses sst useSession to validate auth-token presented on the fetch request.
Implements other common error handling.
import { withAuthAndErrorHandling } from '@pwa-grouper/core/authHandler';
import { RoleType } from '@pwa-grouper/core/types/role';
authHandler.ts withAuthAndErrorHandling

const main = async () => {
    ...
}
export const handler = ApiHandler(withAuthAndErrorHandling(main, [RoleType.ADMIN]));


GET /session : /packages/functions/src/session/expireToken.ts
Validates auth-token presented onn the fetch request with sst useSession
Checks te session user type is not public
Resets auth-token with Expires set to 1 hr from now.

GET /logout  : /packages/functions/src/session/refreshToken.ts
Expires auth-token
