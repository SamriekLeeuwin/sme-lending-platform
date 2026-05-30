# Progress Log

## Day 3: DynamoDB (2026-05-30)

### What I Built
- Created `loan-applications` table with PK (applicationId) + SK (createdAt)
- Created `credit-scores` table with PK (applicationId)
- Created `idempotency-keys` table with PK (eventId) + TTL
- Added 4 realistic test items with full applicant data
- Created `index-status` GSI for efficient status filtering
- Tested Query vs Scan: Query is 14x cheaper (0.5 RCU vs 7 RCU)

| Day | Topic | Status | Key Learnings |
|-----|-------|--------|---------------|
| 3 | DynamoDB table design + GSI |  | Query is 14x cheaper than Scan |

### What I Learned
- Partition Key = where data lives (fast lookup)
- Sort Key = order within partition (range queries)
- GSI = alternative index for different query patterns
- Scan reads everything (expensive), Query reads specific items (cheap)
- RCU = Read Capacity Unit (billing metric)

### Next Steps
- [x] Add GSI for status filtering
- [x] Test Query vs Scan with 3+ items
- [ ] Connect to Lambda for automated inserts
- [ ] Build credit scoring Lambda