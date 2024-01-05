import {Function, Api, StackContext, use, Config } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack, app }: StackContext) {

    const { cluster } = use(StorageStack);
    
    let site_domain = '';
    let site_url = '';
    if (app.mode !== 'deploy') {
        site_domain = 'localhost:5173';
        site_url = 'http://localhost:5173';
    } else {
        site_url = `https://${app.stage}-${app.name}.${process.env.DOMAIN}`;
        site_domain = `${app.stage}-${app.name}.${process.env.DOMAIN}`;
    }

    let api_domain = '';
    if (app.mode !== 'deploy') {
        api_domain = `api.${app.stage}-${app.name}.${process.env.DOMAIN}`;
        
    } else {
        api_domain = `api.${site_domain}`;
    }
    const api_url = `https://${api_domain}`;

    // const myAuthorizerFunction = new Function(stack, "Authorizer", {
    //     handler: "packages/functions/src/authorizer.handler",
    // });

    // const jwtAudience = ["UsGRQJJz5sDfPQDs6bhQ9Oc3hNISuVif"];

    // Create a HTTP API
    const api = new Api(stack, "Api", {
        authorizers: {
            // setting authorizer here will break the ApiAuthorizer / ApiAttachmentProps in the AuthStack
            // so we use an withAuthAndErrorHandling wrapper on the endpoints instead
            // myAuthorizer: {
            //     type: "lambda",
            //     function: myAuthorizerFunction,
            //     resultsCacheTtl: "30 seconds"
            // },
            // jwt requires a jwks endpoint to be deployed with the issuer's public key
            // the /.well-known/openid-configuration route must be available BEFORE deploying the authorizer
            // myjwt: {
            //     type: "jwt",
            //     jwt: {
            //         issuer: api_url,
            //         audience: jwtAudience,
            //     },
            // },
        },
        customDomain: {
            domainName: api_domain,
            hostedZone: process.env.DOMAIN,
          },
        cors: {
            allowOrigins: [`${api_url}`, `${site_url}`],
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
            allowHeaders: ["Content-Type", "Authorization"
            , "X-Requested-With", "X-Amz-Date", "X-Amz-Security-Token", "X-Api-Key"],
            allowCredentials: true
        },
        defaults: {
            authorizer: 'none',
            function: {
                environment: {
                    SITE_URL: site_url,
                    API_URL: api_url,
                },
                bind: [cluster],
            },
        },
        routes: {
            "POST /user":        "packages/functions/src/users/update.handler",
            "GET /user/{id}":    "packages/functions/src/users/get.handler",
            "GET /users":         "packages/functions/src/users/list.handler",
            "PUT /user/{id}":    "packages/functions/src/users/update.handler",
            "DELETE /user/{id}": "packages/functions/src/users/delete.handler",

            // resets auth-token cookie to include the frontend site url
            "GET /session":         "packages/functions/src/session/refreshToken.handler",
            "GET /logout":         "packages/functions/src/session/expireToken.handler",            
            // to set authorizer to none remove the withAuthAndErrorHandling wrapper on the endpoint
            // setting authorizer: "none" will not work when default is also 'none'!
            // "GET /.well-known/openid-configuration" : {
            //         authorizer:         "none",
            //         function: {
            //           handler:          "packages/functions/src/openid.main",
            //         }     
            // },
        },
});
    
    // Show the resource info in the output
    stack.addOutputs({
        ApiEndpoint: api_url,
        SecretArn: cluster.secretArn,
        ClusterIdentifier: cluster.clusterIdentifier,
    });

    return {
        api,
        api_url
    }
}
