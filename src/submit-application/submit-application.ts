import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  SubmitApplicationData,
  SubmitApplicationInput,
} from "./submit-application.types";

import { validateSubmitApplicationInput } from "./validate-submit-application";

// TODO: regio niet hardcoden, Lambda krijgt AWS_REGION al van AWS
const client = new DynamoDBClient({ region: "us-east-1" });
const eventBridgeClient = new EventBridgeClient({});

const eventBusName = process.env.EVENT_BUS_NAME ?? "sme-lending-event-bus";

export const handler = async (event: { body?: string }) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: ["body is required"] }),
    };
  }

  // TODO: nog fixen: als body geen goede JSON is moet hij gewoon 400 teruggeven
  const input: SubmitApplicationInput = event.body
    ? JSON.parse(event.body)
    : event.body;

  // TODO: nog checken of input wel echt een object is en niet bijv string/null/array
  const validation = validateSubmitApplicationInput(input);

  if (!validation.isValid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: validation.errors }),
    };
  }

  const application: SubmitApplicationData = {
    ...input,
    // TODO: misschien ULID/UUIDv7 gebruiken ipv randomUUID, dan is sorteren op tijd makkelijker
    applicationId: globalThis.crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "SUBMITTED",
  };

  // TODO: aanvraag nog opslaan in DynamoDB, nu wordt alleen het event verstuurd
  // TODO: eerst outbox patroon kiezen, anders krijg ik straks opslag + event als losse writes
  const command = new PutEventsCommand({
    Entries: [
      {
        EventBusName: eventBusName,

        Source: "sme-lending.submit-application",

        // TODO: event type versie geven, bijv LoanApplicationSubmitted.v1

        DetailType: "LoanApplicationSubmitted",

        // TODO: event kleiner maken, eigenlijk alleen applicationId + schemaVersion meesturen
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
