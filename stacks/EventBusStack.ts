import { Config, EventBus, StackContext, use } from "sst/constructs";
import { ProcessingQueStack } from "./ProcessingQueStack";

const { entityFetchQueue, lsoaFetchQueue } = use(ProcessingQueStack);

export function EventBusStack({ stack, app }: StackContext) {
  const stage = app.stage;
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
          lsoaFetchTarget: "function/src/fetchHandlers/lsoaFetch.main",
        },
      },
      // Thi will collect all the higher entities (e.g. local authority, region, country)
      entityFetchRule: {
        pattern: { source: [`${stage}-entitySpider`] },
        targets: {
          entityFetchTarget: "function/src/fetchHandlers/entityFetch.main",
          },
      },
      queComplete: {
        pattern: { source: [`${stage}-queComplete`] },
        targets: {
          entityFetchTarget: "function/src/fetchHandlers/cycleFetch.main",
          },
      },
    },
  });

  new Config.Parameter(app, "EVENT_BUS_NAME", {value: eventBus.eventBusName});

  return { 
    eventBus
  };
}