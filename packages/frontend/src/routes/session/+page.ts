import { env } from '$env/dynamic/public';
import type { PageLoad } from './$types.js'; 
import SessionManager from '$lib/classes/SessionManager';

const sessionManager =  SessionManager.getInstance();


export async function load() {
	const res = await fetch(`${env.PUBLIC_API_URL}/session`, 
        { credentials: 'include' }
        );

        const serverFetchSession = await res.json();
        // const serverGetSession = await sessionManager.getSession();
        const exportData = {
            serverFetchSession: serverFetchSession, 
            // serverGetSession: serverGetSession
        };
        return exportData;
}