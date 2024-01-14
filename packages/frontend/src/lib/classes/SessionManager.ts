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

    private updateSessionStore(session: SessionType) {
        this.sessionStore.set(session);
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
        console.log('1. -- sessionManager.getSession()');

        let session = get(this.sessionStore);
        console.log('2. -- sessionManager.getSession() session:', JSON.stringify(session));

        console.log('3. -- sessionManager.getSession() session.sessionUser === ', session.sessionUser);
        console.log('4. -- sessionManager.getSession() session.exp - Date.now() === ', session.exp - Date.now());  
        if (!session || session.sessionUser === SessionUser.PUBLIC || session.exp - Date.now() < this.ttlThreshold) {

            console.log('5. -- sessionManager.getSession() session.sessionUser getting new session: ');
            return await this.refreshSession();

        } 

        // test for ttl
        else if (session.exp - Date.now() < this.ttlThreshold) {
            console.log('6. -- sessionManager.getSession() session.exp - Date.now() < this.ttlThreshold, remaining :', session.exp - Date.now());
            return await this.refreshSession();
        }
        
        // test for expiry
        else if (session.exp > Date.now()) {
            console.log('7. -- sessionManager.getSession() session.exp is good, using local session');
            return {
                session: session,
                errMsg: 'Using local session',
                status: 200
            };
        } 
        
        // well that's it then, it officially expired
        else {
            console.log('8. -- sessionManager.getSession() session is expired, returning empty session');
            return {
                session: emptySession,
                errMsg: 'Local session expired',
                status: 401
            };
        }
    }

    async refreshSession(token?: string): Promise<SessionResponseType> {
        console.log('9 - sessionManager.refreshSession() mode: ', env.PUBLIC_MODE);

        let session: SessionType = emptySession;
        let errMsg: string = '';
        let status: number = 0;

        // if we are in local mode, we need to add the auth header
        if (env.PUBLIC_MODE === 'local') {
            const authHeader = `Bearer ${token}`;
            console.log('10 - sessionManager.refreshSession() authHeader: ', authHeader);
            const response = await fetch(`${env.PUBLIC_API_URL}/session`, {
                method: 'GET',
                headers: {
                    Authorization: `${authHeader}`,    
                },
                credentials: 'include',
            });
        }
        // otherwise we can just hit the api
        else {
            console.log('12 - sessionManager.refreshSession() no authHeader, calling api/session: ');
            const response = await fetch(`${env.PUBLIC_API_URL}/session`, {
                method: 'GET',
                credentials: 'include',
            });
            // get JSON data from response
            status = response.status
            const data = await response.json();
            console.log('12.1 - sessionManager.refreshSession() data: ', JSON.stringify(data, null, 2));
            session = data.data.session;
            errMsg = data.message;
        };

        // if it is available we now have a session
        console.log('13. -- sessionManager.getSession.refreshSession() new session:', JSON.stringify(session, null,2));

        // update the store
        if (session.isValid) {
            console.log('14 - sessionManager.refreshSession() updating store', JSON.stringify(session, null,2));
            this.updateSessionStore(session);
        } else {
            console.log('15 - sessionManager.refreshSession() session is not valid, store set to emptySession', JSON.stringify(session, null,2));
            this.updateSessionStore(emptySession);
        }

        // return the session, 
        // and update the event.locals in the hooks.server.ts
        return {
            session: session,
            errMsg: errMsg,
            status: status
        }
    }

    //  async getSession(): Promise<SessionResponseType> {
    //     console.log('1. -- getSession() :');
    //     let session: SessionType = emptySession;
        
    //     // check the localStore
    //     const unsubscribe = this.sessionStore.subscribe(value => {
    //         session = value;
    //     });
    
    //     // Ensure the subscription has a chance to update localSession
    //     await new Promise(resolve => setTimeout(resolve, 0));
    //     console.log('2. -- getSession() localStore:', JSON.stringify(session));
    //     // free up resources
    //     unsubscribe();

    //     console.log('3. -- getSession() localStore after unsubscribe:', JSON.stringify(session));
    
    //     // if no local session, check api for token, 
    //     if (!session) {
    //         console.log('4. -- getSession() !session :', JSON.stringify(session));
    //         let newSession: SessionResponseType = await this.refreshSession();//await this.refreshSession();
    //         newSession.errMsg = 'getSession checking new session: '+ newSession.errMsg
    //         return newSession
    //     }         
    //     // if the the local session is public 
    //     else if (session.sessionUser === SessionUser.PUBLIC) {
    //         console.log('5. -- getSession() session.sessionUser === public :', JSON.stringify(session));
    //         let newSession: SessionResponseType = await this.refreshSession();
    //         newSession.errMsg = 'getSession refreshing session: '+ newSession.errMsg
    //         return newSession
    //     } 

    //     // if there is a local session and ttl is near
    //     else if (session.exp - Date.now() < this.ttlThreshold) {
    //         console.log('5. -- getSession() session.exp - Date.now() < this.ttlThreshold :', JSON.stringify(session));
    //         let newSession: SessionResponseType = await this.refreshSession();
    //         newSession.errMsg = 'getSession refreshing session: '+ newSession.errMsg
    //         return newSession
    //     } 
    //     // local session is not expired
    //     else if (session.exp > Date.now()) {
    //         console.log('6. -- getSession() session.exp > Date.now() :', JSON.stringify(session));
    //         return {
    //             session: session,
    //             errMsg: 'getSession using local session: ',
    //             status: 200
    //         }
    //     } 
    //     // else return empty session
    //     else {
    //         console.log('7. -- getSession() else :', JSON.stringify(session));
    //         return {
    //             session: emptySession,
    //             errMsg: 'Local session expired',
    //             status: 401
    //         }
    //     }
    //  }
    
    //  an internal function to hit the /session api and return the result
    // async refreshSession(token?: string): Promise<SessionResponseType>{
    //     console.log('1. -- getSession.refreshSession() calling :', `${env.PUBLIC_API_URL}/session`);
    //     // call /session api
    //     console.log('1.1 - -getSession.refreshSession() mode: ', env.PUBLIC_MODE);
        
    //     let session: SessionType = emptySession;
    //     let errMsg: string = '';
    //     let status: number = 0;
    //     // if we are in local mode, we need to add the auth header
    //     if (env.PUBLIC_MODE === 'local') {
    //         const authHeader = `Bearer ${token}`;
    //         console.log('1.2 - -getSession.refreshSession() authHeader: ', authHeader);
    //         const response = await fetch(`${env.PUBLIC_API_URL}/session`, {
    //             method: 'GET',
    //             headers: {
    //                 'Authorization': `${authHeader}`,    
    //             },
    //             credentials: 'include',
    //         });
    //         // get JSON data from response
    //         const session = await response.json();
    //         errMsg = response.statusText;
    //         status = response.status;
    //     } 

    //     // otherwise we can just call the api
    //     else {
    //         console.log('1.3 - -getSession.refreshSession() no authHeader: ');
    //         const response = await fetch(`${env.PUBLIC_API_URL}/session`, {
    //             method: 'GET',
    //             credentials: 'include',
    //         });
    //         // get JSON data from response
    //         const session = await response.json();
    //         errMsg = response.statusText;
    //         status = response.status;
    //     };

    //     console.log('2. -- getSession.refreshSession() :', JSON.stringify(session));

    //     return {
    //         session: session,
    //         errMsg: errMsg,
    //         status: status
    //     }
    // }


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