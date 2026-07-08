#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SmeLendingStack } from '../lib/sme-lending-stack';

const app = new cdk.App();

new SmeLendingStack(app, 'SmeLendingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});
