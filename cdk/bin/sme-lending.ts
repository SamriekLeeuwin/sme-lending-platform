#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SmeLendingStack } from '../lib/sme-lending-stack';

const app = new cdk.App();

// TODO: env later netjes uit cdk context halen, niet zomaar pakken wat in mijn terminal staat
new SmeLendingStack(app, 'SmeLendingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // TODO: default regio naar eu-west-1 zetten, us-east-1 is niet handig voor NL data
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});
