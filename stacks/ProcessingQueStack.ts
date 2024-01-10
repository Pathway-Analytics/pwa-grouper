import { Queue, StackContext } from "sst/constructs";

export function ProcessingQueStack({ stack, app }: StackContext ) {
      
        const entityFetchQueue = new Queue(stack, "EntityFetchQueue", {
          // Queue configurations
          consumer:{
            function: {
              handler: "function/src/queueHandlers/entityFetchQueue.main", 
              environment: {
                STAGE: app.stage,
              },
            }
          },
        });
        
        const lsoaFetchQueue = new Queue(stack, "LsoaFetchQueue", {
            // Queue configurations
            consumer: "function/src/queueHandlers/lsoaFetchQueue.main",
          });
          
    return {  
        entityFetchQueue,
        lsoaFetchQueue
    };
  }