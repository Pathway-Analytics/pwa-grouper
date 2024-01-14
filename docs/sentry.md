sst bind vite dev

https://pathway-analytics.sentry.io/projects/dev-sst-sveltekit/getting-started/
pnpx @sentry/wizard@latest -i sveltekit

https://pathway-analytics.sentry.io/settings/integrations/aws_lambda/
pnpm install -w @sentry/serverless



import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Api, StackContext } from "sst/constructs";

export function SentryStack({ stack, app }: StackContext) {
    // Configure Sentry
    if (!app.local) {
        const sentry = LayerVersion.fromLayerVersionArn(
        stack,
        "SentryLayer",
        // https://docs.sentry.io/platforms/node/guides/aws-lambda/layer/
        `arn:aws:lambda:us-east-1:943013980633:layer:SentryNodeServerlessSDK:194`
        );

        stack.addDefaultFunctionLayers([sentry]);
        stack.addDefaultFunctionEnv({
        SENTRY_DSN: process.env.SENTRY_DSN || '',
        // sample rate 1.0 means 100% of events are sent to Sentry, 
        // suitable rate for production use is probably 0.1 or 0.2
        SENTRY_TRACES_SAMPLE_RATE: "1.0",
        // NODE_OPTIONS: "-r @sentry/serverless/dist/awslambda-auto",
        // NODE_OPTIONS: "-r @sentry/serverless",
        NODE_OPTIONS: "-r @sentry/serverless/build/npm/cjs/awslambda-auto"
    });
    }

  stack.addOutputs({

  });
}

// //   wrap your function handlers  
// import * as Sentry from "@sentry/serverless";
// export const handler = Sentry.AWSLambda.wrapHandler(async (event) => {
//   // ...
// });

import { SSTConfig } from "sst";
import { StorageStack } from "./stacks/StorageStack";
import { ApiStack } from "./stacks/ApiStack";
import { FunctionStack } from "./stacks/FunctionStack";
import { FrontendStack } from "./stacks/FrontendStack";
import { AuthStack } from "./stacks/AuthStack";
// import { SentryStack } from "./stacks/SentryStack";

export default {
  config(_input) {
    return {
      name: "sst-starter3",
      region: "us-east-1",
    };
  },
  stacks(app) {
    // Remove all resources when non-prod stages are removed
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }  
    app
      .stack(StorageStack)
      .stack(ApiStack)
      .stack(FunctionStack)
      .stack(FrontendStack)
      .stack(AuthStack)
      // .stack(SentryStack)
  }
} satisfies SSTConfig;


Try using Layers

https://docs.sst.dev/constructs/App#adddefaultfunctionlayers
addDefaultFunctionLayers

here's how you can deploy Sentry on your SST Lambda functions and SST SvelteKit project:

For SST Lambda functions:

Import the Lambda layer using the LayerVersion construct and set it by calling addDefaultFunctionLayers.
Set the NODE_OPTIONS, SENTRY_DSN, and SENTRY_TRACES_SAMPLE_RATE environment variables with the addDefaultFunctionEnv method.
For more information, you can read how this integration works and the SST docs.

