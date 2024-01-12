import { 
    ApiHandler, useBody, useResponse
} from 'sst/node/api';
import { authzHandler } from '@pwa-grouper/core/authzHandler';
import { EventBridge } from 'aws-sdk';


// takes a POST request with an event trigger object
// returns success or error message

const main = async () => {
    const body = useBody();
    const eventBridge = new EventBridge();
    // trigger event with the payload in the body as params
    if (!body) {
        return useResponse()
            .status(400)
            .header('Content-Type', 'application/json')
            .send({ error: 'Body is required' });
    }

    try {
        const params = {
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME,
                    Source: 'fetchChildren',
                    DetailType: 'fetchChildren - api call',
                    Detail: JSON.stringify(body)
                }
            ]
        };
        
        await eventBridge.putEvents(params).promise();
        
        return useResponse()
            .status(200)
            .header('Content-Type', 'application/json')
            .send({ success: true });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        console.error(`Error in event trigger: ${JSON.stringify(body)}: `, error);
        return useResponse()
            .status(500)
            .header('Content-Type', 'application/json')
            .header('Access-Control-Allow-Origin', process.env.SITE_URL)
            .serialize({
                body: JSON.stringify({ message: errorMessage })
            })
            .send();
    }

}


// this handler will manage all the authorisation and error handling
// note, we wrap the main handler in the withAuthAndErrorHandling wrapper
// and then wrap that in the ApiHandler wrapper - this allows us to use the
// useSession() and other useful hooks in the main handler.
export const handler = ApiHandler(authzHandler(main));
