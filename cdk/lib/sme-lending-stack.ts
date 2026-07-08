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

    const eventBus = events.EventBus.fromEventBusName(
      this,
      'SmeLendingEventBus',
      'sme-lending-event-bus',
    );

    const submitApplicationFunction = new NodejsFunction(
      this,
      'SubmitApplicationFunction',
      {
        functionName: 'submit-application-cdk',
        runtime: lambda.Runtime.NODEJS_20_X,
        projectRoot: path.join(__dirname, '../..'),
        entry: path.join(
          __dirname,
          '../../src/submit-application/index.ts',
        ),
        handler: 'handler',
        timeout: Duration.seconds(10),
        memorySize: 128,
        bundling: {
          externalModules: [],
          minify: true,
          sourceMap: true,
        },
        environment: {
          EVENT_BUS_NAME: eventBus.eventBusName,
        },
      },
    );

    eventBus.grantPutEventsTo(submitApplicationFunction);

    new cdk.CfnOutput(this, 'SubmitApplicationFunctionName', {
      value: submitApplicationFunction.functionName,
    });

    new cdk.CfnOutput(this, 'EventBusName', {
      value: eventBus.eventBusName,
    });
  }
}
