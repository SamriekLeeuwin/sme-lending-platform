# SME Lending Platform

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/leeuwis/sme-lending-platform)
[![AWS](https://img.shields.io/badge/AWS-serverless-orange)](https://aws.amazon.com)
[![Node](https://img.shields.io/badge/Node-20-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)

> Cloud-native fintech platform for small business loan processing.  
> Built from scratch with AWS serverless, event-driven microservices, and modern architecture patterns.  
> Learning project — documenting the journey from zero to production over 30 days.

---

## What It Does

A platform where SME (Small & Medium Enterprise) business owners can:

1. **Submit a loan application** — Amount, term, purpose, company details
2. **Get an instant credit score** — Based on financial health metrics (revenue, debt, cashflow)
3. **Receive an automated decision** — Approved, rejected, or flagged for manual review
4. **Track application status** — Real-time dashboard showing the full lifecycle

### The Loan Application Lifecycle

```
[Applicant submits form]
         │
         ▼
[Application Stored] ←── Synchronous (immediate feedback)
         │
         ▼
[Credit Score Calculated] ←── Asynchronous (background processing)
         │
         ▼
[Decision Engine Evaluates] ←── Asynchronous (automated rules)
         │
         ▼
[Notification Sent] ←── Asynchronous (email/SMS to applicant)
```

---

## Architecture

Built on AWS with serverless services:

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React App     │────▶│ API Gateway  │────▶│  Lambda: Submit │
│  (Applicant UI) │     │   (REST API) │     │   Application   │
└─────────────────┘     └──────────────┘     └────────┬────────┘
                                                      │
                                            ┌─────────▼─────────┐
                                            │  EventBridge      │
                                            │  (Event Bus)      │
                                            └─────────┬─────────┘
                                                      │
                              ┌───────────────────────┼───────────────────────┐
                              │                       │                       │
                    ┌─────────▼─────────┐   ┌───────▼───────┐   ┌─────────────▼──────────┐
                    │ Lambda: Credit    │   │ Lambda: KYC   │   │ Lambda: Notification   │
                    │   Scoring         │   │  (mock)       │   │  (Audit + Alerts)      │
                    │                   │   │               │   │                        │
                    │ • Risk algorithm  │   │ • ID verify   │   │ • Structured logging   │
                    │ • Score 0-100     │   │ • Doc check   │   │ • Status updates       │
                    └─────────┬─────────┘   └───────────────┘   └────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Lambda: Decision │
                    │     Engine        │
                    │                   │
                    │ • Business rules  │
                    │ • Approve/Reject  │
                    └───────────────────┘
```

### Data Layer

| Table | Purpose | Key Design |
|-------|---------|------------|
| `loan-applications` | Store all applications | PK: `applicationId`, SK: `createdAt` |
| `credit-scores` | Store scoring results | PK: `applicationId` |
| `idempotency-keys` | Prevent duplicate events | PK: `eventId`, TTL: 24h |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Cloud** | AWS | Market leader, mature serverless, free tier |
| **Compute** | Lambda (Node.js 20) | Serverless, fast cold starts, JSON-native |
| **Events** | EventBridge + SQS (DLQ) | Routing, decoupled, retry on failure |
| **Database** | DynamoDB | Serverless, single-digit ms latency, auto-scale |
| **API** | API Gateway (REST) | Lambda integration, pay-per-request, throttling |
| **Frontend** | React + TypeScript + Vite | Popular, type-safe, fast build |
| **Hosting** | S3 + CloudFront | CDN, serverless, managed by CDK |
| **IaC** | AWS CDK (TypeScript) | Type-safe, testable, high-level constructs |
| **Observability** | CloudWatch Logs + X-Ray | Structured logs, distributed tracing |
| **Security** | IAM roles + API keys | Least privilege, basic protection |

---

## Progress

| Day | Topic | Status | Key Learnings |
|-----|-------|--------|---------------|
| 1 | AWS Lambda Hello World | ✅ | Serverless execution model, CloudWatch logs |
| 2 | Serverless cost analysis | ✅ | Pay-per-use vs always-on, break-even points |
| 3 | DynamoDB table design + GSI | 🔄 | PK/SK design, Query vs Scan, indexing |
| 4 | EventBridge event bus | ⏳ | Event routing, async communication |
| 5 | API Gateway REST API | ⏳ | REST design, CORS, throttling |
| 6 | Credit scoring Lambda | ⏳ | Business logic in Lambda, risk algorithms |
| 7 | Decision engine | ⏳ | Rule-based decisions, separation of concerns |
| 8 | Notification service | ⏳ | Audit logging, event-driven alerts |
| 9 | Dashboard API | ⏳ | Read patterns, GSI usage |
| 10 | Frontend React app | ⏳ | Forms, state management, API calls |
| 11 | CDK infrastructure | ⏳ | Infrastructure as Code, automated deploy |
| 12 | End-to-end testing | ⏳ | Integration testing, edge cases |
| 13-20 | Polish & features | ⏳ | Auth, idempotency, caching |
| 21-30 | Production ready | ⏳ | Monitoring, alerts, documentation |

---

## What I Learned

### Architecture Decisions
- **Serverless vs Servers:** Lambda is event-driven and pay-per-use. EC2 is always-on and requires management. For variable fintech traffic, serverless wins.
- **Event-Driven Architecture:** Services communicate via events, not direct calls. If one service fails, the others keep working. This is resilience.
- **Synchronous vs Asynchronous:** User-facing actions are synchronous (immediate feedback). Background processing is asynchronous (user doesn't wait).
- **Database Design:** DynamoDB requires upfront query pattern design. No JOINs means denormalization. GSIs are essential for efficient filtering.

### Technical Skills
- AWS Lambda execution model and cold starts
- DynamoDB PK/SK design and Global Secondary Indexes
- EventBridge event routing and retry behavior
- Structured logging with JSON for observability
- Git atomic commits and professional documentation

### Fintech Domain
- Credit scoring factors: debt-to-revenue, cashflow, loan-to-revenue, term
- Risk levels and their impact on approval decisions
- Regulatory requirements: audit trails, data residency, idempotency

---

## How to Run

> **Note:** This project is in active development. Full deployment instructions will be added as the project progresses.

### Prerequisites
- AWS Account (Free Tier)
- Node.js 20+
- AWS CLI configured (`aws configure`)
- AWS CDK installed (`npm install -g aws-cdk`)

### Quick Start (Coming Soon)
```bash
git clone https://github.com/leeuwis/sme-lending-platform.git
cd sme-lending-platform/cdk
npm install
npm run build
npm run bootstrap
npm run deploy
```

---

## Project Structure

```
sme-lending-platform/
├── cdk/                  # Infrastructure as Code (AWS CDK)
│   ├── bin/              # Entry point
│   ├── lib/              # Stack and constructs
│   └── package.json
├── src/                  # Lambda business logic
│   ├── submit-application/
│   ├── credit-scoring/
│   ├── decision-engine/
│   ├── notification/
│   └── dashboard-api/
├── frontend/             # React + TypeScript
│   ├── src/
│   └── package.json
├── shared/               # Common types and interfaces
└── README.md
```

---

## Next Steps

- [ ] Implement idempotency keys for duplicate event handling
- [ ] Add JWT authentication for applicant sessions
- [ ] Build internal admin dashboard for risk team
- [ ] Add Step Functions for complex manual review workflows
- [ ] Implement caching with ElastiCache for dashboard queries
- [ ] Load testing with Artillery/k6 to find Lambda limits
- [ ] Add CI/CD pipeline with GitHub Actions

---

## Why This Project?

Modern fintech platforms process thousands of loan applications daily. Understanding how to build such systems — serverless, event-driven, scalable — is essential for any software engineer entering the fintech space.

This project is my hands-on exploration of:
- **Cloud architecture** at scale
- **Event-driven systems** and their resilience
- **Fintech domain logic** (credit scoring, risk assessment)
- **Professional development practices** (Git, documentation, testing)

---

