import { StackContext, Function, use } from "sst/constructs";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Chain, Parallel, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { ApiStack } from "./ApiStack";


export function SubmissionStateMachineStack({ stack }: StackContext) {
  const api = use(ApiStack);

  const getSubmissionDate = new LambdaInvoke(stack, "getSubmissionDate", {
    lambdaFunction: new Function(stack, "getSubmissionDate-func", {
      handler: "packages/functions/src/submission/getSubmissionDate.handler",
    }),
  });

  const dataCurrencyTriggers = new LambdaInvoke(stack, "dataCurrencyTriggers", {
    lambdaFunction: new Function(stack, "dataCurrencyTriggers-func", {
      handler: "packages/functions/src/submission/dataCurrencyTriggers.handler",
    }),
  });

  const currencyInvalidCombos = new LambdaInvoke(stack, "currencyInvalidCombos", {
    lambdaFunction: new Function(stack, "currencyInvalidCombos-func", {
      handler: "packages/functions/src/submission/currencyInvalidCombos.handler",
    }),
  });

  const currencyTariffValues = new LambdaInvoke(stack, "currencyTariffValues", {
    lambdaFunction: new Function(stack, "currencyTariffValues-func", {
      handler: "packages/functions/src/submission/currencyTariffValues.handler",
    }),
  });

  const kpiCalculations = new LambdaInvoke(stack, "kpiCalculations", {
    lambdaFunction: new Function(stack, "kpiCalculations-func", {
      handler: "packages/functions/src/submission/kpiCalculations.handler",
    }),
  });

  const parallel = new Parallel(stack, "ParallelCompute");

  const stateDefinition = Chain.start(getSubmissionDate)
    .next(currencyInvalidCombos)
    .next(currencyInvalidCombos)
    .next(currencyTariffValues)
    .next(kpiCalculations)

  const stateMachineSubmission = new StateMachine(stack, "stateMachineSubmission", {
    definition: stateDefinition,
  });

  api.api.addRoutes(stack, {
    "GET /start-Submission": {
      function: {
        handler: "packages/functions/src/submission/startSubmission.handler",
        environment: {
          STATE_MACHINE: stateMachineSubmission.stateMachineArn,
        },
      },
    },
  });

  // add api endpoint to api stack
  api.api.attachPermissionsToRoute("GET /start-submission", [
    [stateMachineSubmission, "grantStartExecution"],
  ]);

}