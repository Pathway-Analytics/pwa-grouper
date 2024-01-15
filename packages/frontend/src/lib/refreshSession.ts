import { env } from '$env/dynamic/public';
import { emptySession, type SessionType  } from "@pwa-grouper/core/types/session";

// return session data of SessionType
export const refreshSession = async (): Promise<SessionType> => {
  try {
    const res = await fetch(`${env.PUBLIC_API_URL}/session`);
    const data: SessionType = await res.json();
    if (res.ok) {
      return data;
    }
    return data;
  }
  catch (err) {
    console.log(err);
    return emptySession;
  }
};
