import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class SmeLendingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // TODO: deze bus eigenlijk zelf aanmaken in CDK, nu verwacht CDK dat hij al bestaat
    const eventBus = events.EventBus.fromEventBusName(
      this,
      'SmeLendingEventBus',
      'sme-lending-event-bus',
    );

    // TODO: event bus naam later uit config halen ipv hardcoded
    // TODO: vaste functionName weghalen of env prefix gebruiken, anders kan dev/prod niet naast elkaar
    const submitApplicationFunction = new NodejsFunction(
      this,
      'SubmitApplicationFunction',
      {
        functionName: 'submit-application-cdk',
        // TODO: runtime en @types/node gelijk trekken als Lambda nieuwere Node ondersteunt
        runtime: lambda.Runtime.NODEJS_20_X,
        projectRoot: path.join(__dirname, '../..'),
        entry: path.join(
          __dirname,
          '../../src/submit-application/index.ts',
        ),
        handler: 'handler',
        timeout: Duration.seconds(10),
        // TODO: memorySize meten met Lambda Power Tuning, 128mb is misschien juist trager/duurder
        memorySize: 128,
        bundling: {
          externalModules: [],
          minify: true,
          sourceMap: true,
        },
        environment: {
          EVENT_BUS_NAME: eventBus.eventBusName,
          // TODO: later tabelnamen en idempotency table ook via env meegeven
        },
      },
    );

    eventBus.grantPutEventsTo(submitApplicationFunction);

    // TODO: credit-scoring lambda nog koppelen aan dit event
    // TODO: DynamoDB tabellen, GSI, rule, DLQ en alarms ook in CDK zetten ipv handmatig in AWS
    // TODO: logRetention, X-Ray tracing en arm64 nog aanzetten op de lambdas

    new cdk.CfnOutput(this, 'SubmitApplicationFunctionName', {
      value: submitApplicationFunction.functionName,
    });

    new cdk.CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
    });
  }
}
