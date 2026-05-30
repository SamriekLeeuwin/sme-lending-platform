# Progress Log

## Day 1: AWS Lambda Hello World (2026-05-28)
### What I Built
- Created first Lambda function "Test" in AWS Console
- Tested with synchronous invocation
- Viewed CloudWatch logs

### What I Learned
- Lambda is serverless: runs only when triggered
- Synchronous = caller waits for response
- CloudWatch logs show Duration, Billed Duration, Memory Size
- Cold starts: first invocation after idle is slower

---

## Day 2: Serverless Cost Analysis (2026-05-29)
### What I Built
- Compared Lambda vs EC2 costs
- Calculated break-even points

### What I Learned
- Lambda: pay per millisecond, $0 at idle
- EC2: pay per hour, always costs money
- For spiky traffic (fintech), Lambda is cheaper
- Cold start trade-off: latency vs cost

---

## Day 3: DynamoDB Deep Dive (2026-05-30)
### What I Built
- Created `loan-applications` table with PK (applicationId) + SK (createdAt)
- Created `credit-scores` table with PK (applicationId)
- Created `idempotency-keys` table with PK (eventId) + TTL
- Added 4 realistic test items with full applicant data
- Created `index-status` GSI for efficient status filtering
- Tested Query vs Scan: Query is 14x cheaper (0.5 RCU vs 7 RCU)

### What I Learned
- Partition Key = where data lives (fast lookup)
- Sort Key = order within partition (range queries)
- GSI = alternative index for different query patterns
- Scan reads everything (expensive), Query reads specific items (cheap)
- RCU = Read Capacity Unit (billing metric)
- DynamoDB is schemaless: each item can have different fields

---

## Day 4: EventBridge (2026-05-30) — IN PROGRESS
### What I'm Building
- Event bus `sme-lending-event-bus`
- Rule `loan-submitted-rule` for LoanApplicationSubmitted events
- Connect to Test Lambda as target

### What I'm Learning
- EventBridge = central "plank" where services leave "notes" (events)
- Event bus = router that receives and delivers events
- Rule = filter: which events go to which targets?
- Target = Lambda, SQS, SNS, etc.
- Event-driven = parallel, decoupled, resilient

### Next Steps
- [ ] Create event bus
- [ ] Create rule with event pattern
- [ ] Set Test Lambda as target
- [ ] Send test event
- [ ] Verify in CloudWatch logs