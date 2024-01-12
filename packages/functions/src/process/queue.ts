import { 
	ApiHandler, usePathParam, useResponse
 } from 'sst/node/api';
 import { SQS } from 'aws-sdk';
import { authzHandler } from '@pwa-grouper/core/authzHandler';

// This handler queries a queue for for its details

const main = async () => {
    const sqs = new SQS();
    const queueName = usePathParam('queue');
    // check if queue name is provided
    if (!queueName) {
        return useResponse()
            .status(400)
            .header('Content-Type', 'application/json')
            .header('Access-Control-Allow-Origin', process.env.SITE_URL)
            .send({ error: 'Queue name is required' });
    }
    try {
	// returns the queue details 
    const urlResult = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    // check if queue exists
    if (!urlResult.QueueUrl) {
        return useResponse()
            .status(404)
            .header('Content-Type', 'application/json')
            .header('Access-Control-Allow-Origin', process.env.SITE_URL)
            .send({ error: 'Queue not found' });
    }
    const attributesResult = await sqs.getQueueAttributes({
        QueueUrl: urlResult.QueueUrl,
        AttributeNames: ['All']
    }).promise();

    return useResponse()
        .status(200)
        .header('Content-Type', 'application/json')
        .header('Access-Control-Allow-Origin', process.env.SITE_URL)
        .send(attributesResult.Attributes);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`Error in get queue: ${queueName}: `, error);
        return useResponse()
            .status(500)
            .header('Content-Type', 'application/json')
            .header('Access-Control-Allow-Origin', process.env.SITE_URL)
            .serialize({
                body: JSON.stringify({ message: errorMessage })
            })
    }
};

// this handler will manage all the authorisation and error handling
// note, we wrap the main handler in the withAuthAndErrorHandling wrapper
// and then wrap that in the ApiHandler wrapper - this allows us to use the
// useSession() and other useful hooks in the main handler.
export const handler = ApiHandler(authzHandler(main));