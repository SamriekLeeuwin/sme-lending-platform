
// import means: "bring code from another file/package into this file".
// These two classes come from the AWS SDK package for EventBridge.
// EventBridgeClient = the object that can talk to EventBridge.
// PutEventsCommand = the request shape for sending events to EventBridge.
import {
    EventBridgeClient,
    PutEventsCommand,
} from '@aws-sdk/client-eventbridge';

// randomUUID is a Node.js function that creates a unique id.
// We use it so every loan application gets its own applicationId.
import { randomUUID } from 'crypto';

// These imports start with ./, so they come from files in this same folder.
// SubmitApplicationInput describes the data we expect from the user.
// SubmitApplicationData describes the data after our system adds id/status/time.
import {
    SubmitApplicationData,
    SubmitApplicationInput,
} from './submit-application.types';

// This function checks whether the input has all required fields and valid numbers.
import { validateSubmitApplicationInput } from './validate-submit-application';

// const means this variable cannot be reassigned later.
// new means: create a new object from this class.
// EventBridgeClient({}) creates the AWS SDK client.
// The empty object {} means: "use default AWS settings".
// Inside Lambda, those defaults come from the runtime:
// - region comes from AWS
// - credentials come from the Lambda execution role
const eventBridgeClient = new EventBridgeClient({});

// process.env is where Lambda environment variables live.
// EVENT_BUS_NAME is set by CDK in cdk/lib/sme-lending-stack.ts.
// ?? means "use the value on the left, unless it is null or undefined".
// So if EVENT_BUS_NAME exists, use that.
// Otherwise fall back to 'sme-lending-event-bus'.
const eventBusName = process.env.EVENT_BUS_NAME ?? 'sme-lending-event-bus';

// export means other files/AWS Lambda can use this function.
// Lambda looks for a function named handler because our CDK handler is index.handler.
// async means this function can await slow work, like a network call to AWS.
// event is the input Lambda receives when it is triggered.
// { body?: string } is a TypeScript type:
// - body is optional because of the ? symbol
// - if body exists, it should be a string
export const handler = async (event: { body?: string }) => {
    // const input: SubmitApplicationInput means:
    // "create a variable named input and tell TypeScript it should match SubmitApplicationInput".
    //
    // event.body ? A : B is a ternary operator:
    // - if event.body exists, run A
    // - otherwise run B
    //
    // JSON.parse(event.body) turns a JSON string into a JavaScript object.
    // Example:
    // '{"applicantName":"Jan"}' becomes { applicantName: 'Jan' }.
    const input: SubmitApplicationInput = event.body
        ? JSON.parse(event.body)
        : event.body;

    // Run our validation function before doing anything important.
    // This protects the workflow from bad data.
    // If the user forgot required fields, we should not publish an EventBridge event.
    const validation = validateSubmitApplicationInput(input);

    // if means: only run this block when the condition is true.
    // ! means "not".
    // So !validation.isValid means "if validation is not valid".
    if (!validation.isValid) {
        // return stops the function and sends this object back to the caller.
        // statusCode: 400 means "Bad Request".
        // JSON.stringify turns a JavaScript object into a JSON string.
        return {
            statusCode: 400,
            body: JSON.stringify({ errors: validation.errors }),
        };
    }

    // This object becomes the official loan application inside our system.
    //
    // ...input is the spread operator.
    // It copies all fields from input into this new object.
    //
    // Then we add system-generated fields:
    // - applicationId: unique id made by our backend
    // - createdAt: current timestamp
    // - status: first lifecycle state
    const application: SubmitApplicationData = {
        ...input,
        applicationId: randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'SUBMITTED',
    };

    // Here we create the EventBridge request, but we have not sent it yet.
    //
    // new PutEventsCommand({...}) means:
    // "build an instruction for AWS EventBridge to put one or more events on a bus".
    //
    // Entries is an array, shown by [].
    // We send one event now, but EventBridge supports multiple entries at once.
    const command = new PutEventsCommand({
        Entries: [
            {
                // EventBusName tells AWS which EventBridge bus receives the event.
                EventBusName: eventBusName,

                // Source names the service that created the event.
                // Later, EventBridge rules can filter on this value.
                Source: 'sme-lending.submit-application',

                // DetailType names what happened.
                // This is the business event: a loan application was submitted.
                DetailType: 'LoanApplicationSubmitted',

                // Detail is the payload of the event.
                // EventBridge requires Detail to be a string containing valid JSON.
                // That is why we use JSON.stringify(application).
                Detail: JSON.stringify(application),
            },
        ],
    });

    // await means: pause this function until the Promise finishes.
    // eventBridgeClient.send(command) is the actual network call to AWS.
    //
    // If IAM permission is missing, this line fails.
    // CDK gives the Lambda permission with eventBus.grantPutEventsTo(...).
    await eventBridgeClient.send(command);

    // If we reach this point, validation passed and the event was published.
    // statusCode: 200 means "OK".
    // The caller gets the application immediately.
    // The next services, like credit scoring, will run later through EventBridge.
    return {
        statusCode: 200,
        body: JSON.stringify(application),
    };
};
