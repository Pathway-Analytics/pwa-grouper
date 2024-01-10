export async function main(event: AWSLambda.SQSEvent) {
    for (const record of event.Records) {
      console.log('Processing record: ', record);
      // Process each record here
    }
  }