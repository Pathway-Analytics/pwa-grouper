import AWS from "aws-sdk";

const client = new AWS.EventBridge();

export async function main(event: AWSLambda.SQSEvent) {
    for (const record of event.Records) {
      console.log('Processing record: ', record);
      // Process each record here
    }
    // trigger an event to say we are done
    await client.putEvents({
      Entries: [{
        EventBusName: process.env.EVENT_BUS_NAME,
        Source: `${process.env.STAGE}-queComplete`,
        // add in here some information about what we have done
        DetailType: 'queComplete',
        Detail: JSON.stringify({}),
      }]
    }).promise();
  }