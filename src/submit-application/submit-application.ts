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

const client = new DynamoDBClient({ region: "us-east-1" });
const eventBridgeClient = new EventBridgeClient({});

const eventBusName = process.env.EVENT_BUS_NAME ?? "sme-lending-event-bus";

export const handler = async (event: { body?: string }) => {
  // TODO: Voeg hier extra foutafhandeling toe voor een ongeldige JSON-body.
  // Denk na over wat er moet gebeuren als er geen body aanwezig is of als de body geen geldig object is.
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
    applicationId: globalThis.crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "SUBMITTED",
  };

  // TODO: Bepaal later of je de aangemaakte aanvraag ook wilt bewaren in een database.
  const command = new PutEventsCommand({
    Entries: [
      {
        EventBusName: eventBusName,

        Source: "sme-lending.submit-application",

        DetailType: "LoanApplicationSubmitted",

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
