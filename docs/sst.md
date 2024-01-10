# SST & SvelteKit

## SST and the Separation of Powers

install

```bash
pnpm add sst --save-exact
pnpm add -D @types/node
pnpm install
```

[SST](https://docs.sst.dev/) (Serverless Stack) is a framework designed to simplify building serverless applications on AWS. It's highly compartmentalized, featuring Constructs, Clients, and CLI tools, each serving distinct purposes.

Constructs and Clients
- [Constructs](https://docs.sst.dev/constrcuts): These are used to define and build your infrastructure on AWS CloudFormation. Constructs are typically defined in the /stacks directory and represent AWS resources like Lambda functions, API Gateway endpoints, and DynamoDB tables.
- [Clients](https://docs.sst.dev/clients): Once your infrastructure is deployed, Clients provide convenient methods to interact with these resources from your Lambda functions. Clients are typically used in the code within the /packages/functions directory.
- It's important to use Constructs and Clients in their appropriate contexts. For instance, environment variables should be accessed using Clients in Lambda functions, not Constructs.
  
## CLI Tools

- SST offers a set of [CLI tools](https://docs.sst.dev/packages/sst) for various tasks like starting a local development environment, deploying your application, and more. These tools are command-line based and integral to working with SST.

### Deployment Modes

- SST offers two primary modes of deployment: standard mode and drop-in mode.
  - **Drop-In Mode**: This mode acts as a wrapper around the AWS CDK (Cloud Development Kit), enhancing existing CDK projects with SST features.
  - **Standard Mode**: Ideal for new projects, this mode allows you to build and deploy serverless applications using SST from the ground up. It offers a more controlled and integrated experience with SST's features.
  - For existing projects, integrating SST might lean towards the drop-in mode, but the choice depends on the project's requirements and setup.
  
## Integration with SvelteKit

- When integrating SST with SvelteKit, it's crucial to understand where and how to use SST features:
  - Functions like useSession or accessing Config.MY_SECRET_KEY are intended for use in server-side contexts, specifically in Lambda functions.
  - SST deploys your SvelteKit application as a single Lambda function, encapsulating the entire app.

### Common Monorepo Structure

- A typical SST project with SvelteKit might have the following structure:

**/**   : Global configuration files.  
**/packages/core**  : Shared logic, helpers, and utilities. These are used by Lambda functions but not directly deployed.  
**/packages/frontend**  : The SvelteKit application.  
**/packages/functions** : Lambda functions, often managed by Constructs like the API.  
**/stacks** : High-level infrastructure design in code.

- It's possible to call functions or classes in **/packages/core/** from a SvelteKit route's **+page.server.ts** file, allowing for interactions with your database or other backend logic.  

## Environment Variables and Configuration in SST & SvelteKit

When building serverless applications with SST and SvelteKit, managing environment variables and configurations plays a pivotal role in both development and production environments. This management is crucial for handling sensitive data, customizing behavior across different environments, and ensuring the security and efficiency of your application.

### Environment Variables in SST:

- **Secure and Scalable:** SST provides a robust way to handle environment variables, ensuring they are securely stored and easily accessible across your serverless infrastructure.
- SST uses two different AWS tools to manage Secreats and Parameters.  Secrets are managed by AAWS Secrets Manager and Parameters are managed by AWS Systems Manager (SSM).
- To read a secret or parameter it has to be imported into the lambda function you are running, if it is SvelteKit or another higher level app it has to be imported in the app.  Some Contructs have a specific environment attribute.
- Some constructs, such as a RDS database, create their own set of secrets when they are deployed.  These can be read from within a lambda function directly from the AWS Secrets Manager using the ARN reference.
- **AWS Secrets Manager Integration:** For sensitive data like API keys or database credentials, SST can integrate with AWS Secrets Manager. This allows you to securely store and access secrets, which are then injected into your Lambda functions at runtime.
- **Environment-Specific Configurations:** SST supports defining environment-specific variables. This means you can have different configurations for development, staging, and production environments, enhancing the flexibility and control over your application's behavior.

### Creating Secrets

 - Secrets and parameters can be created in the .env direct from the command line or in the CI/CD tool of choice.  
 - Secrets are better saved into the command line, whereas params can be handled by .env and CI/CD tools.
 - Each stage will require their own set of variables.  
  
 ```typescript
 pnpm sst secrets set MY_SECRET_KEY <YOUR SECRET KEY> --stage <stage name>
 ```

### Applying environment variables in SST Stacks:  

- **Using `Config` Class:** In a stack creation:
  
  ```typescript
  import { Config } from "sst/constructs"

  ...
   export function ApiStack({ stack, app }: StackContext) {

   const MY_SECRET_KEY = new Config.Secret(stack, "MY_SECRET_KEY");
   ...
   }
  ```

or 

```typescript
const api = new Api(stack, "Api", {
  // ...
});

new SvelteKitSite(stack, "Site", {
  path: "path/to/site",
  environment: {
    API_URL: api.url,
  },
});
```

### Accessing environment variables in Lambda Functions:

- **Using `Config` Class:** In your Lambda functions (typically in `/packages/functions`), you can access environment variables using the `Config` class from `"sst/node/config"`. This class provides a convenient way to retrieve configuration values, ensuring that your Lambda functions have the necessary context to operate.
  
  ``` typescript
  // Example of accessing an environment variable in a Lambda function
  import { Config } from "sst/node/config";

  const apiKey = Config.API_KEY; // Accessing an API key
  ```

### Reading a RDS cluster set of secrets

```typescript
import { RDSData } from '@aws-sdk/client-rds-data';
import { Kysely, type Selectable } from 'kysely';
import { DataApiDialect } from 'kysely-data-api';
import { RDS } from 'sst/node/rds';
import type { Database } from './sql.generated';

export const DB = new Kysely<Database>({
	dialect: new DataApiDialect({
		mode: 'postgres',
		driver: {
			secretArn: (RDS as any).Cluster.secretArn,
			resourceArn: (RDS as any).Cluster.clusterArn,
      database: (RDS as any).Cluster.defaultDatabaseName,
			client: new RDSData({})
		}
	})
});

export type Row = {
	[Key in keyof Database]: Selectable<Database[Key]>;
};

export * as SQL from './sql';
```

## Accessing environment variables in Svelte

```typescript
import { env as privEnv } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
console.log(env.PUBLIC_API_URL);
```

## SvelteKit and Server-Side Considerations:

- Client-Side Security: It's crucial to ensure that sensitive environment variables are not exposed to the client-side in your SvelteKit application. Only public configuration values should be accessible in the frontend code.
- Server-Side Access: In SvelteKit, especially in +page.server.ts files, you can access environment variables for server-side logic. This is useful for database interactions, API calls, and other backend operations.

## Secret ARNs

- SST uses 

pnpm install -w kysely
kysely-data-api

pnpm add -w @aws-sdk/client-rds-data aws-lambda @aws-sdk/client-ses uuid

pnpm i -w --save-dev @types/node