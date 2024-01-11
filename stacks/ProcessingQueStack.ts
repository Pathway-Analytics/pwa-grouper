import { Queue, StackContext, use } from "sst/constructs";
import { EventBusStack } from "./EventBusStack";

export function ProcessingQueStack({ stack, app }: StackContext ) {

  const { eventBus } = use(EventBusStack);

  const queueEntityFetchQueue = new Queue(stack, "EntityFetchQueue", {
    // Queue configurations
    consumer:{
      function: {
        handler: "packages/functions/src/adminAreaSpider/fetchChildrenHandler.main",
        environment: {
          STAGE: app.stage,
        },
      }
    },
  });
  
  eventBus.addRules(stack, {
    "eventEntityFetchQueue":{
      pattern: { source: [`eventEntityFetchQueue`] },
      targets: {
        queueEntityFetchQueueTarget: queueEntityFetchQueue,
      },
    },
  });

  const ErrorQueue = new Queue(stack, "ErrorQueue", {
    // currently dead letter queue 
    // Queue configurations
    // consumer:{
    //   function: {
    //     handler: "packages/functions/src/adminAreaSpider/fetchChildrenHandler.main",
    //     environment: {
    //       STAGE: app.stage,
    //     },
    //   }
    // },
  });

  eventBus.addRules(stack, {
    "eventErrorQueue":{
      pattern: { source: [`eventErrorQueue`] },
      targets: {
        queueEntityFetchQueueTarget: ErrorQueue,
      },
    },
  });


  return {  
    queueEntityFetchQueue
  };
}