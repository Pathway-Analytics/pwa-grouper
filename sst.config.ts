import { SSTConfig } from "sst";
import { StorageStack } from "./stacks/StorageStack";
import { ApiStack } from "./stacks/ApiStack";
import { FunctionStack } from "./stacks/FunctionStack";
import { FrontendStack } from "./stacks/FrontendStack";
import { AuthStack } from "./stacks/AuthStack";
import { EventBusStack } from "./stacks/EventBusStack";
import { ProcessingQueStack } from "./stacks/ProcessingQueStack";

// import { SentryStack } from "./stacks/SentryStack";
import { Tags } from "aws-cdk-lib/core";

export default {
  config(_input) {
    return {
      name: "pwa-grouper",
      region: "us-east-1",
    };
  },
  stacks(app) {
    // Add tags to all resources for easy identification
    Tags.of(app).add("stage-region", `${app.stage}-${app.region}`);
    Tags.of(app).add("Cost tracking", 'AppManagerCFNStackKey');

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
    .stack(EventBusStack)
    // .stack(ProcessingQueStack);
  }
} satisfies SSTConfig;
