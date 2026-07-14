
import {
    EventBridgeClient,
    PutEventsCommand,
} from '@aws-sdk/client-eventbridge';


import { randomUUID } from 'crypto';


import {
    SubmitApplicationData,
    SubmitApplicationInput,
} from './submit-application.types';


import { validateSubmitApplicationInput } from './validate-submit-application';

const eventBridgeClient = new EventBridgeClient({});

const eventBusName = process.env.EVENT_BUS_NAME ?? 'sme-lending-event-bus';

export const handler = async (event: { body?: string }) => {
   
    const input: SubmitApplicationInput = event.body
        ? JSON.parse(event.body)
        : event.body;

    const validation = validateSubmitApplicationInput(input);

    if (!validation.isValid) {
       
        return {
            statusCode: 400,
            body: JSON.stringify({ errors: validation.errors }),
        };
    }

    const application: SubmitApplicationData = {
        ...input,
        applicationId: randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'SUBMITTED',
    };

   
    const command = new PutEventsCommand({
        Entries: [
            {
               
                EventBusName: eventBusName,

               
                Source: 'sme-lending.submit-application',

                
                DetailType: 'LoanApplicationSubmitted',

                
                Detail: JSON.stringify(application),
            },
        ],
    });

    
    
    await eventBridgeClient.send(command);

    return {
        statusCode: 200,
        body: JSON.stringify(application),
    };
};
