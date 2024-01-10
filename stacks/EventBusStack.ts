import { Config, EventBus, StackContext, use } from "sst/constructs";
import { ProcessingQueStack } from "./ProcessingQueStack";

const { entityFetchQueue, lsoaFetchQueue } = use(ProcessingQueStack);

export function EventBusStack({ stack }: StackContext) {
  const stage = stack.stage;

  const eventBus = new EventBus(stack, "DataEventBus", {
    cdk: {
      eventBus: {
        eventBusName: `${stage}-EventBus`,
      },
    },
    rules: {
      // Queue for lsoaFetch
      lsoaFetchQueueRule: {
        // events are sent to the aws accont default bus, 
        // so we need to filter on the stage to make sure
        // we only process events for this stage here
        pattern: { source: [`${stage}-lsoaFetchQueue`] },
        targets: {
          lsoaFetchQueueTarget: lsoaFetchQueue,
        },
      },
      // Queue for entityFetch
      entityFetchQueueRule: {
        pattern: { source: [`${stage}-entityFetchQueue`] },
        targets: {
          entityFetchQueueTarget: entityFetchQueue,
        },
      },
      // This will collect all the lsoa for an entity
      lsoaFetchRule: {
        pattern: { source: [`${stage}-lsoaFetch`] },
        targets: {
          lsoaFetchTarget: "packages/functions/src/fetchHandlers/lsoaFetch.main",
        },
      },
      // Thi will collect all the higher entities (e.g. local authority, region, country)
      entityFetchRule: {
        pattern: { source: [`${stage}-entitySpider`] },
        targets: {
          entityFetchTarget: "packages/functions/src/fetchHandlers/entityFetch.main",
          },
      },
      queComplete: {
        pattern: { source: [`${stage}-queComplete`] },
        targets: {
          entityFetchTarget: "packages/functions/src/fetchHandlers/cycleFetch.main",
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