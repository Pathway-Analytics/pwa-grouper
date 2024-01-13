// /packages/frontend/src/classes/SessionManager.ts
import { writable } from 'svelte/store';
import type { SessionType, SessionResponseType } from '@pwa-grouper/core/types/session';
import  { emptySession, SessionUserType as SessionUser } from '@pwa-grouper/core/types/session';
import { get } from 'svelte/store';
import { env } from "$env/dynamic/public";

// a class to handle sessions in the frontend
// setting and getting the session cookies into frontend store
// validating the session cookie for user type and expiry
// refreshing the session cookie frontend store

class SessionManager {
    // const ttlThreshold = 30 minutes in epoch time
    readonly ttlThreshold: number = 30 * 60 * 1000;

    // initial session store state...
    private  sessionStore  = writable<SessionType>({
        // set to emptySession
        ...emptySession,        
    });

    // 

    // Singleton instance
    private static instance: SessionManager;
    
    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Method to get the singleton instance
    public static getInstance(): SessionManager {
        if (!this.instance) {
            this.instance = new SessionManager();
        }
        return this.instance;
    }
    
    /**
     * returns the session cookie from the frontend store
     * if no session in the store gets a session from api/session
     * then sets the session in the store
     * Only call this method from the server side rendering
     * Only call where you want to handle the status errors (ie hooks.server.ts)
     * To just get the session from the frontend store use getSessionSync()
     *  
     * @param void
     * @returns session
     * @example
     * 
     *```typescript
     *   getSession() returns the current session object:
     *   gets session from store
     *   if no session in the store calls refreshSession()
     *   if there is a session in the store checks the ttl with ttl threshold
     *   if the ttl is less than the threshold calls refreshSession()
     *   otherwise returns the emptySession
     *   RefreshSession() returns the current session object along with a response object: 
     *   {error: string, status: number}
     *
     * */
     async getSession(): Promise<SessionResponseType> {
        console.log('1. -- getSession() :');
        let session: SessionType = emptySession;
        
        // check the localStore
        const unsubscribe = this.sessionStore.subscribe(value => {
            session = value;
        });
    
        // Ensure the subscription has a chance to update localSession
        await new Promise(resolve => setTimeout(resolve, 0));
        console.log('2. -- getSession() localStore:', JSON.stringify(session));
        // free up resources
        unsubscribe();

        console.log('3. -- getSession() localStore after unsubscribe:', JSON.stringify(session));
    
        // if no local session, check api for token, 
        if (!session) {
            console.log('4. -- getSession() !session :', JSON.stringify(session));
            let newSession: SessionResponseType = await this.refreshSession();//await this.refreshSession();
            newSession.errMsg = 'getSession checking new session: '+ newSession.errMsg
            return newSession
        }         
        // if the the local session is public 
        else if (session.sessionUser === SessionUser.PUBLIC) {
            console.log('5. -- getSession() session.sessionUser === public :', JSON.stringify(session));
            let newSession: SessionResponseType = await this.refreshSession();
            newSession.errMsg = 'getSession refreshing session: '+ newSession.errMsg
            return newSession
        } 

        // if there is a local session and ttl is near
        else if (session.exp - Date.now() < this.ttlThreshold) {
            console.log('5. -- getSession() session.exp - Date.now() < this.ttlThreshold :', JSON.stringify(session));
            let newSession: SessionResponseType = await this.refreshSession();
            newSession.errMsg = 'getSession refreshing session: '+ newSession.errMsg
            return newSession
        } 
        // local session is not expired
        else if (session.exp > Date.now()) {
            console.log('6. -- getSession() session.exp > Date.now() :', JSON.stringify(session));
            return {
                session: session,
                errMsg: 'getSession using local session: ',
                status: 200
            }
        } 
        // else return empty session
        else {
            console.log('7. -- getSession() else :', JSON.stringify(session));
            return {
                session: emptySession,
                errMsg: 'Local session expired',
                status: 401
            }
        }
     }
    
    //  an internal function to hit the /session api and return the result
    async refreshSession(token?: string): Promise<SessionResponseType>{
        console.log('1. -- getSession.refreshSession() calling :', `${env.PUBLIC_API_URL}/session`);
        // call /session api
        console.log('1.1 - -getSession.refreshSession() mode: ', env.PUBLIC_MODE);
        
        let session: SessionType = emptySession;
        let errMsg: string = '';
        let status: number = 0;
        // if we are in local mode, we need to add the auth header
        if (env.PUBLIC_MODE === 'local') {
            const authHeader = `Bearer ${token}`;
            console.log('1.2 - -getSession.refreshSession() authHeader: ', authHeader);
            const response = await fetch(`${env.PUBLIC_API_URL}/session`, {
                method: 'GET',
                headers: {
                    'Authorization': `${authHeader}`,    
                },
                credentials: 'include',
            });
            // get JSON data from response
            const session = await response.json();
            errMsg = response.statusText;
            status = response.status;
        } 

        // otherwise we can just call the api
        else {
            console.log('1.3 - -getSession.refreshSession() no authHeader: ');
            const response = await fetch(`${env.PUBLIC_API_URL}/session`, {
                method: 'GET',
                credentials: 'include',
            });
            // get JSON data from response
            const session = await response.json();
            errMsg = response.statusText;
            status = response.status;
        };

        console.log('2. -- getSession.refreshSession() :', JSON.stringify(session));

        return {
            session: session,
            errMsg: errMsg,
            status: status
        }
    }

    /**
     * returns the session cookie from the frontend store
     * if no session in the store returns empty session
     * 
     * @param void
     * @returns session
     * @example
     * 
     * ```typescript
     * import { SessionManager } from '@sst-starter3/frontend/classes/SessionManager';
     * 
     * const sessionManager = new SessionManager();
     * let session = sessionManager.getSessionSync();
     * ```
     * */
    getSessionSync(): SessionType {
        // iniitial local var sessionData state...
        let sessionData: SessionType = {
            sessionUser: SessionUser.PUBLIC,
            iat: 0,
            exp: 0,
            isValid: false,
            user: {
                id: '',
                email: '',
                firstName: '',
                lastName: '',
                picture: '',
                roles: '',
            },
        };
        
        const unsubscribe = this.sessionStore.subscribe(value => {
            sessionData = value;
        });
        unsubscribe();
        return sessionData;
    }

    /**
     * logs out the user by setting the session cookie to public
     * deletes the session cookie from the frontend store
     * calls the api/logout to delete the session cookie from the backend
     * 
     * @param void
     * @returns void
     * @example
     * ```typescript
     * import { SessionManager } from '@sst-starter3/frontend/classes/SessionManager';
     * 
     * const sessionManager = new SessionManager();
     * sessionManager.logout();
     * ```
     */
    async logout(): Promise<SessionType> {
        // Call the /api/logout endpoint
        const response = await fetch(`${env.PUBLIC_API_URL}/logout`, {
            method: 'GET', 
            credentials: 'include'
        });

        // Define an empty session
        const emptySession: SessionType = {
            sessionUser: SessionUser.PUBLIC,
            iat: 0,
            exp: 0,
            isValid: false,
            user: null
        };

        // Check if the logout was successful
        if (response.ok) {
            // Clear the session data in the frontend store
            this.sessionStore.set(emptySession);
        } else {
            // Handle any errors, if necessary
            console.error('Logout failed:', await response.text());
        }

        // refresh the current page
        return emptySession;
    }
}

export default SessionManager;