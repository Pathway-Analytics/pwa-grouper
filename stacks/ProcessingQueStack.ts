import { Queue, StackContext, use } from "sst/constructs";
import { EventBusStack } from "./EventBusStack";

export function ProcessingQueStack({ stack, app }: StackContext ) {

  const { eventBus } = use(EventBusStack);

  const entityFetchQueue = new Queue(stack, "EntityFetchQueue", {
    // Queue configurations
    consumer:{
      function: {
        handler: "packages/functions/src/queueHandlers/entityFetchQueue.main",
        environment: {
          STAGE: app.stage,
        },
      }
    },
  });
      
  const lsoaFetchQueue = new Queue(stack, "LsoaFetchQueue", {
    // Queue configurations
    consumer: "packages/functions/src/queueHandlers/lsoaFetchQueue.main",
  });

  eventBus.addRules(stack, {
    "lsoaFetchQueueRule":{
      pattern: { source: [`${app.stage}-lsoaFetchQueue`] },
      targets: {
        lsoaFetchQueueTarget: lsoaFetchQueue,
      },
    },
  });

  eventBus.addRules(stack, {
    "entityFetchQueueRule":{
      pattern: { source: [`${app.stage}-entityFetchQueue`] },
      targets: {
        entityFetchQueueTarget: entityFetchQueue,
      },
    },
  });
  
  return {  
      entityFetchQueue,
      lsoaFetchQueue
  };
}