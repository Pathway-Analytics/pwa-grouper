import { EventBus, StackContext, use } from "sst/constructs";

export function EventBusStack({ stack, app }: StackContext) {
  const stage = stack.stage;

  const eventBus = new EventBus(stack, "DataEventBus", {
    rules: {

      // // Queue for eventEntityFetch added in ProcessingQueStack.ts

      // This will collect all children of an entitiy
      // pass in the entites to collect and the parent entity
      eventEntityFetchChildren: {
        pattern: { source: [`fetchChildren`] },
        targets: {
          FetchChildrenTarget: "packages/functions/src/adminAreaSpider/fetchChildrenHandler.main",
          },
      },
      eventStartAdminAreaSpider: {
        pattern: { 
          source: [`startAdminAreaSpider`] 
        },
        targets: {
          StartAdminAreaSpiderTarget: "packages/functions/src/adminAreaSpider/startAreaSpiderHandler.main",
          },
      },
      eventQueueComplete: {
        pattern: { source: [`queueComplete`] },
        targets: {
          QueueCompleteTarget: "packages/functions/src/fetchCompleteHandler.main",
          },
      },
    },
  });

  stack.addOutputs({
    EventBusName: eventBus.eventBusName,    
  });

  return { 
    eventBus
  };
}