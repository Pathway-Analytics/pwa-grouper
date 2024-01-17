import { env } from '$env/dynamic/public';
import { emptySession, type SessionType, type SessionResponseType  } from "@pwa-grouper/core/types/session";

const isLocalMode = env.PUBLIC_MODE === 'local';
const api_session = `${env.PUBLIC_API_URL}/session`;


// return session data from the server
// always include the token on server side requests
export const refreshSession = async (token: string | null): Promise<SessionResponseType> => {
  console.log('0. refreshSession() started...');
  try {
    // include credentials: 'include' to send cookies
    console.log('1. refreshSession() mode: ', isLocalMode ? 'local' : 'deployed');
    if (token){
      console.log('2. refreshSession() Bearer Auth fetching from', api_session );
      const  authHeader = {authorization: `Bearer ${token}`};
      const res = await fetch(api_session,{
        method: 'GET',
        headers: authHeader,
        credentials: 'include',
      });
      
      const data: {message: string, session: SessionType, token: string} = await res.json();
      
      if (res.ok) {
        console.log('6. refreshSession() data: ', JSON.stringify(data, null, 2));
        data.message = 'ok';
        return data;
      }
      return data;  

    } else {
      console.log('4.refreshSession() Cookie Auth fetching from', api_session);
      const res = await fetch(api_session,{
        method: 'GET',
        credentials: 'include',
      })
      const data: {message: string, session: SessionType, token: string} =await res.json();
      // const data: {message: string, session: SessionType} = await res.json();
      // console.log('5. refreshSession() res: ', res);
      if (res.ok) {

        console.log('6. refreshSession() data: ', JSON.stringify(data, null, 2));
        data.message = 'ok';
        return data;
      }
      console.log('7. refreshSession() response had a problem, data: ', JSON.stringify(data, null, 2)); 
      data.message = 'response had a problem';
      return data;  
    }

  }
  catch (err) {
    console.log(err);
    const session: SessionType = emptySession;
    const data = {message: err as string, session, token: token || ''};
    return data;
  }
};
