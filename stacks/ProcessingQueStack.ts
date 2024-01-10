import { Queue, StackContext, use } from "sst/constructs";

export function ProcessingQueStack({ stack, app }: StackContext ) {

  const entityFetchQueue = new Queue(stack, "EntityFetchQueue", {
    // Queue configurations
    consumer:{
      function: {
        handler: "packages/function/src/queueHandlers/entityFetchQueue.main", 
        environment: {
          STAGE: app.stage,
        },
      }
    },
  });
      
  const lsoaFetchQueue = new Queue(stack, "LsoaFetchQueue", {
    // Queue configurations
    consumer: "packages/function/src/queueHandlers/lsoaFetchQueue.main",
  });
        
  return {  
      entityFetchQueue,
      lsoaFetchQueue
  };
}