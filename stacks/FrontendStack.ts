import { StackContext, SvelteKitSite, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
import { StorageStack } from "./StorageStack";

export function FrontendStack({ stack, app }: StackContext) {
    const { api } = use(ApiStack);
    const { bucket, cluster } = use(StorageStack);

    // api.url has correct protocol alread (always https)
    // site.url is actually just the domain and need the protocol added
    let site_domain = '';
    let site_url = '';
    if (app.mode !== 'deploy') {
        site_domain = 'localhost:5173';
        site_url = 'http://localhost:5173';
    } else { 
        site_url = `https://${app.stage}-${app.name}.${process.env.DOMAIN}`;
        site_domain = `${app.stage}-${app.name}.${process.env.DOMAIN}`;
    }
 
    // Define our React app
    const site: SvelteKitSite = new SvelteKitSite(stack, "SvelteSite", {
        path: "packages/frontend",
        customDomain: {
            domainName: site_domain,
            hostedZone: process.env.DOMAIN ?? '',
        },
        bind:[bucket, cluster],
        // Pass in our environment variables
        environment: {
            // NO Secrets in here.... (see AuthStack for secrets)
            //https://docs.sst.dev/constructs/SvelteKitSite#environment-variables
            // only env. marked PUBLIC are available on the client side
            // clientSide: import { env } from '$env/dynamic/private';
            // clientSide: import { env } from '$env/dynamic/public';
            // const apiUrl = env.PUBLIC_APP_API_URL;

            PUBLIC_STAGE: app.stage,
            PUBLIC_AWS_API_URL: api.url,
            PUBLIC_API_URL: api.customDomainUrl || api.url,
            PUBLIC_REGION: app.region,
            PUBLIC_BUCKET: bucket.bucketName,
            PUBLIC_MODE: app.local? 'local': app.mode,

            PUBLIC_APP_NAME: process.env.APP_NAME || '',
            PUBLIC_SELF_REG: process.env.SELF_REG?.toLocaleLowerCase() || 'false',
            PUBLIC_ADMIN_USER_ROLE: process.env.ADMIN_USER_ROLE || '',
            PUBLIC_ADMIN_USER_EMAIL: process.env.ADMIN_USER_EMAIL || '',
        },
    });

    // now we have it, add the site url env. variable
    app.addDefaultFunctionEnv({
        "PUBLIC_APP_SITE_URL": site_url 
        });

    // // set CORS on API Gateway
    // console.log(`allowOrigins: [${api.customDomainUrl}, ${api.url}, http://localhost:5173]`);
    // api.setCors({
    //     // if allowCredentials: true, then no wildcards on allowOrigins, be specific!        
    //     allowOrigins: [`${api.customDomainUrl}, ${api.url},  http://localhost:5173`],
    //     // allowOrigins: ["*"],
    //     allowMethods: ["ANY"],  
    //     allowHeaders: ["*"],
    //     // to allow for cookie handling across domains
    //     allowCredentials: true
    // });

    // Show the url in the output
    stack.addOutputs({
        SiteUrl: site_url,
    });

    const region = app.region;
    
    return {
        site,
        region,
        site_url,
    };
}