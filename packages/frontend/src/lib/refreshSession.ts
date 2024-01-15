import { env } from '$env/dynamic/public';
import { emptySession, type SessionType  } from "@pwa-grouper/core/types/session";

// return session data of SessionType
export const refreshSession = async (token?: string): Promise<{message: string, session: SessionType}> => {
  console.log('0. refreshSession() started...');
  try {
    // include credentials: 'include' to send cookies
    console.log('1. refreshSession() mode: ', env.PUBLIC_MODE);
    if (env.PUBLIC_MODE === 'local'){
      const  authHeader = {Authorization: `Bearer ${token}`};
      const res = await fetch(`${env.PUBLIC_API_URL}/session`,{
        method: 'GET',
        headers: authHeader,
        credentials: 'include',
      });
      const data: {message: string, session: SessionType} = await res.json();
      console.log('2. refreshSession() res: ', res);
      if (res.ok) {
        return data;
      }
      return data;  

    } else {
      console.log('4.refreshSession() non-local mode: ', env.PUBLIC_MODE);
      const res = await fetch(`${env.PUBLIC_API_URL}/session`,{
        method: 'GET',
        credentials: 'include',
      })
      const data: {message: string, session: SessionType} = await res.json();
      console.log('5. refreshSession() res: ', res);
      if (res.ok) {
        return data;
      }
      return data;  
    }

  }
  catch (err) {
    console.log(err);
    const data = {message: err as string, session: emptySession};
    return data;
  }
};