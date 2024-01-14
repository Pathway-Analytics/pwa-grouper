import { env } from '$env/dynamic/public';
import type { PageLoad } from './$types.js'; 

export async function load() {
	const res = await fetch(`${env.PUBLIC_API_URL}/session`, 
        { credentials: 'include' }
        );
        return res.json();
}