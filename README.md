# SME Lending Platform

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/leeuwis/sme-lending-platform)
[![AWS](https://img.shields.io/badge/AWS-serverless-orange)](https://aws.amazon.com)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)

A serverless lending platform for small and medium-sized businesses, built with AWS, TypeScript, and React.

The project covers the complete loan application flow, from application submission and credit scoring to automated decision-making and status tracking.

> **Status:** Work in progress. The architecture and core services are being built incrementally.

---

## Overview

The platform is designed around an event-driven architecture.

A business owner submits a loan application through the frontend. The application is stored immediately, after which background services process the application independently.

The current flow is:

```text
Client
  │
  ▼
API Gateway
  │
  ▼
Submit Application Lambda
  │
  ├── Store application
  │
  └── Publish event
          │
          ▼
      EventBridge
          │
          ├───────────────┬─────────────────┐
          ▼               ▼                 ▼
   Credit Scoring       KYC            Notification
      Lambda           (mock)             Lambda
          │
          ▼
   Decision Engine
          │
          ▼
    Application Status
```

The goal is to keep the individual responsibilities small and independent. Adding or changing one processing step should not require rewriting the entire application flow.

---

## Features

### Loan applications

Applicants can submit:

* Company information
* Requested loan amount
* Loan term
* Loan purpose
* Financial information

Each application receives a unique `applicationId`.

### Credit scoring

The credit scoring service calculates a score from `0-100` based on financial metrics such as:

* Revenue
* Existing debt
* Cash flow
* Requested loan amount
* Loan term

The scoring logic is intentionally kept separate from the API and decision logic.

### Automated decisions

The decision engine evaluates the application and scoring result against predefined business rules.

Possible outcomes:

```text
APPROVED
REJECTED
MANUAL_REVIEW
```

Keeping the decision rules separate makes it possible to change the approval criteria without changing the rest of the application pipeline.

### Asynchronous processing

The application submission itself is synchronous so the client receives an immediate response.

Longer-running processing happens asynchronously through events.

This allows individual services to fail or retry without blocking the original API request.

---

## Architecture

The platform uses AWS managed services instead of long-running servers.

### Request flow

```text
React
  │
  ▼
API Gateway
  │
  ▼
Lambda
  │
  ├── DynamoDB
  │
  └── EventBridge
          │
          ├── Credit Scoring
          ├── KYC
          ├── Decision Engine
          └── Notifications
```

### AWS services

| Service     | Responsibility                        |
| ----------- | ------------------------------------- |
| API Gateway | Public REST API                       |
| Lambda      | Application and business logic        |
| EventBridge | Event routing between services        |
| SQS         | Retry handling and dead-letter queues |
| DynamoDB    | Application and scoring data          |
| S3          | Frontend hosting                      |
| CloudFront  | CDN for the frontend                  |
| CloudWatch  | Logs and monitoring                   |
| X-Ray       | Distributed tracing                   |
| IAM         | Access control                        |
| CDK         | Infrastructure as Code                |

---

## Data Model

The initial data model uses separate DynamoDB tables for different concerns.

| Table               | Purpose                      | Primary Key     |
| ------------------- | ---------------------------- | --------------- |
| `loan-applications` | Loan applications and status | `applicationId` |
| `credit-scores`     | Credit scoring results       | `applicationId` |
| `idempotency-keys`  | Duplicate event protection   | `eventId`       |

### Example application

```json
{
  "applicationId": "app_01J...",
  "companyName": "Example BV",
  "requestedAmount": 50000,
  "termMonths": 36,
  "purpose": "Working capital",
  "status": "UNDER_REVIEW",
  "createdAt": "2026-08-05T10:00:00Z"
}
```

The exact schema is expected to evolve as more query patterns are introduced.

---

## Project Structure

```text
sme-lending-platform/
│
├── cdk/
│   ├── bin/
│   │   └── app.ts
│   ├── lib/
│   │   └── ...
│   └── package.json
│
├── src/
│   ├── submit-application/
│   │   └── handler.ts
│   │
│   ├── credit-scoring/
│   │   └── handler.ts
│   │
│   ├── decision-engine/
│   │   └── handler.ts
│   │
│   ├── notification/
│   │   └── handler.ts
│   │
│   └── dashboard-api/
│       └── handler.ts
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── shared/
│   ├── types/
│   └── ...
│
├── package.json
└── README.md
```

The intention is to keep infrastructure, business logic, frontend code, and shared types separate.

---

## Technology Choices

### AWS Lambda

Lambda is used for the backend services because most operations are event-driven and do not require continuously running servers.

Each Lambda has a relatively narrow responsibility.

### EventBridge

EventBridge is used to publish domain events and decouple services.

For example:

```text
LoanApplicationSubmitted
        │
        ├── Credit Scoring
        ├── KYC
        └── Notification
```

Consumers can be added without changing the service that publishes the event.

### SQS

SQS is used where additional buffering and retry handling is required.

Failed messages can be moved to a dead-letter queue instead of being lost.

### DynamoDB

DynamoDB is used for application data because the platform has predictable access patterns and does not require relational joins for its primary workflows.

Indexes are added based on actual query requirements rather than treating DynamoDB like a relational database.

### AWS CDK

All AWS infrastructure is defined using TypeScript and AWS CDK.

This keeps infrastructure changes version-controlled alongside the application code.

---

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js 20+
* npm
* AWS CLI
* AWS CDK
* An AWS account

Configure the AWS CLI:

```bash
aws configure
```

Verify the configuration:

```bash
aws sts get-caller-identity
```

### Install dependencies

Clone the repository:

```bash
git clone https://github.com/leeuwis/sme-lending-platform.git
cd sme-lending-platform
```

Install the infrastructure dependencies:

```bash
cd cdk
npm install
```

Build the project:

```bash
npm run build
```

### CDK bootstrap

If this is the first CDK deployment in your AWS account/region:

```bash
npx cdk bootstrap
```

### Deploy

```bash
npx cdk deploy
```

The deployment will provision the required AWS resources defined in the CDK stack.

> Deployment instructions are still evolving while the infrastructure is being implemented.

---

## Development

### Run tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Synthesize CloudFormation

To inspect the infrastructure generated by CDK:

```bash
npx cdk synth
```

### Review infrastructure changes

Before deploying changes:

```bash
npx cdk diff
```

This is useful for checking what AWS resources will be added, modified, or removed.

---

## Event Flow

The main domain event currently looks like:

```json
{
  "source": "sme-lending",
  "detail-type": "LoanApplicationSubmitted",
  "detail": {
    "applicationId": "app_01J..."
  }
}
```

The event does not contain the complete application payload. Consumers can use the `applicationId` to retrieve the required data.

This keeps events small and avoids coupling consumers to the full application schema.

---

## Error Handling

The system is designed to treat failures as part of the normal event-processing flow.

For asynchronous processing:

```text
EventBridge
    │
    ▼
SQS
    │
    ▼
Lambda
    │
    ├── Success
    │
    └── Failure
          │
          ▼
        Retry
          │
          ▼
      Dead Letter Queue
```

Idempotency is also being added to prevent the same event from producing duplicate side effects.

---

## Observability

Application logs use structured JSON rather than plain text.

Example:

```json
{
  "level": "INFO",
  "event": "loan_application_submitted",
  "applicationId": "app_01J...",
  "timestamp": "2026-08-05T10:00:00Z"
}
```

This makes logs easier to search and filter in CloudWatch.

Planned observability includes:

* Structured application logs
* Lambda metrics
* API metrics
* Error alarms
* Distributed tracing
* Dead-letter queue monitoring

---

## Security

Security is handled primarily through AWS IAM and API-level controls.

Current and planned controls include:

* IAM roles with least-privilege permissions
* No hard-coded AWS credentials
* API throttling
* Input validation
* Idempotency protection
* Audit logging
* Secure storage of application data

Authentication and authorization for applicant sessions are planned for a later stage.

> This project is a technical demonstration and is **not intended for processing real customer or financial data**.

---

## Roadmap

### Core platform

* [x] Initial AWS CDK project
* [x] Lambda proof of concept
* [x] Initial DynamoDB design
* [ ] EventBridge event bus
* [ ] Loan application API
* [ ] Credit scoring service
* [ ] Decision engine
* [ ] Notification service
* [ ] Dashboard API
* [ ] React frontend

### Reliability

* [ ] Idempotency
* [ ] SQS dead-letter queues
* [ ] Retry policies
* [ ] Integration tests
* [ ] Load testing
* [ ] Failure scenarios

### Security

* [ ] Authentication
* [ ] Authorization
* [ ] Request validation
* [ ] Secrets management
* [ ] Audit trail

### Infrastructure

* [ ] Complete CDK deployment
* [ ] CI/CD with GitHub Actions
* [ ] Environment separation
* [ ] Monitoring and alarms

---

## Architecture Decisions

Some of the main decisions in the project are documented here rather than hidden inside the implementation.

### Why serverless?

The workload is primarily request- and event-driven. Lambda removes the need to manage servers while allowing individual services to scale independently.

### Why events?

Loan processing consists of several independent steps. Events allow those steps to be developed and operated independently.

### Why DynamoDB?

The main workflows have well-defined access patterns and do not require complex relational queries. DynamoDB also integrates naturally with the serverless AWS architecture.

### Why CDK?

The infrastructure is part of the application and should therefore be version-controlled, reviewable, and reproducible.

---

## Current Status

This project is actively being developed.

The focus is currently on building the backend architecture first and then connecting the React frontend to the API.

The repository will evolve as more services, tests, infrastructure, and operational tooling are added.

---

## Contributing

This is currently a personal development project, but the repository is structured so that individual services can be worked on independently.

If you want to experiment with the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add or update tests
5. Open a pull request

Keep infrastructure changes and application changes isolated where possible.

---

## License

License information will be added as the project moves toward a public release.
