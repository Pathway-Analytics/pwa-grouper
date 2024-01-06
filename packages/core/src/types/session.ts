import type { UserType } from './user';

export enum SessionUserType {
    PUBLIC = 'public',
    USER = 'user',
    API = 'api',
    TYPE4 = 'Type4',
    TYPE5 = 'Type5',
    // add more types as needed
}

/**
 * Session type
 * 
 * @type
 */
export type SessionType = {
    sessionUser: SessionUserType;
    iat: number;
    exp: number;
    isValid: boolean;
    user?: UserType | null;
  };


export let emptySession: SessionType = {
    sessionUser: SessionUserType.PUBLIC,
    iat: 0,
    exp: 0,
    isValid: false,
    user: null,
};

export type SessionResponseType = {
    session: SessionType,
    errMsg: string,
    status: number
}

/**
 * SessionToken type
 * 
 * @type
 */
export type SessionTokenType = {
    type: SessionUserType;
    properties: {
        userId: string;
    };
    options: {  // These are a set of predefined claims which are not mandatory but recommended, to provide a set of useful, interoperable claims. 
        //  algorithm?: Algorithm  // algorithm used to sign the token
        // mutatePayload?: boolean //
        // expiresIn?: number | string  // expires at epoch time
        // notBefore?: number // not valid before epoch time
        // jti?: string  // unique identifier for the token
        // aud?: string | string[]  // audience
        // iss?: string  // issued by a URI representing the issuer
        // sub?: string  // subject
        // nonce?: string // number used once
        // kid?: string // key id
        // header?: JwtHeader 
        // noTimestamp?: boolean  // if true, do not validate the expiration of the token
        // clockTimestamp?: number  // epoch time now in seconds
    };
    iat: number;
    exp: number;
}