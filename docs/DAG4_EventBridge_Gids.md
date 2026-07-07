# 📚 DAG 4: EventBridge - Volledige Stappenplan & Concepten

**Status:** In Progress  
**Duur:** ~2-3 uur  
**Doel:** Event Bus opzetten zodat services asynchronoon met elkaar communiceren

---

## 📖 DEEL 1: Concepten - Waarom EventBridge?

### Het Probleem: Direct Coupling

In je loan platform moet het volgende gebeuren:

```
1. Applicant dient loan in
   ↓
2. Applicatie wordt opgeslagen (Lambda)
   ↓
3. Credit score berekenen (andere Lambda)
   ↓
4. Decision Engine draait (nog een Lambda)
   ↓
5. Notification sturen (email/SMS)
```

**Slecht Scenario (Direct Coupling):**
```
Lambda Submit
  └─→ calls Lambda CreditScore
       ├─→ calls Lambda DecisionEngine
       │    ├─→ calls Lambda Notification
       │    └─→ ❌ FAILS = hele keten stopt!
       └─→ Timing: moeten wachten (slow)
```

**Problemen:**
- Als Credit Scoring crashes → hele flow breekt
- Submit Lambda moet op 3 andere wachten → trager
- Moeilijk om nieuwe stappen toe te voegen

### De Oplossing: Event Bus (Decoupled)

```
Lambda Submit → [Event Bus] ← Event Router
                   ↓
        ┌──────────┼──────────┐
        ↓          ↓          ↓
    Lambda     Lambda    Lambda
    Credit     Decision  Notification
```

**Voordelen:**
- ✅ Submit wacht niet - stuurt event en klaar
- ✅ Als Credit Scoring fails → rest gaat door
- ✅ Makkelijk nieuwe services toevoegen
- ✅ Asynchronous = sneller responsief

---

## 🏗️ DEEL 2: Hoe EventBridge Werkt

### De 3 Componenten

#### 1. **Event Bus** (Het "Postkantoor")
Dit is het centrale verzamelpunt waar alle services events achterlaten.

```
Events die binnenkomen:
├─ LoanApplicationSubmitted
├─ CreditScoreCalculated
├─ DecisionMade
└─ NotificationSent
```

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-bus-targets.html

---

#### 2. **Rule** (De "Sorteermachine")
Een rule bepaalt welke events waar heen gaan.

**Voorbeeld:**
```json
{
  "Name": "loan-submitted-rule",
  "EventBusName": "sme-lending-event-bus",
  "EventPattern": {
    "source": ["sme-lending"],
    "detail-type": ["LoanApplicationSubmitted"]
  },
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:us-east-1:123456:function:credit-scoring",
      "RoleArn": "arn:aws:iam::123456:role/EventBridgeRole"
    }
  ]
}
```

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html

---

#### 3. **Target** (De "Bestemming")
Waar de event heen gaat: Lambda, SQS, SNS, etc.

```
Event Pattern Match → Rule finds Target → Lambda gets invoked
```

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html

---

## 📋 DEEL 3: Event Format (Structuur)

Elke event in AWS EventBridge ziet er zo uit:

```json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "detail-type": "LoanApplicationSubmitted",
  "source": "sme-lending",
  "account": "123456789012",
  "time": "2026-07-07T14:10:30Z",
  "region": "us-east-1",
  "resources": [],
  "detail": {
    "applicationId": "APP-001",
    "applicantName": "Jan Jansen",
    "loanAmount": 50000,
    "companyRevenue": 250000
  }
}
```

**Delen:**
- `source`: Je applicatie naam (altijd "sme-lending")
- `detail-type`: Event type (LoanApplicationSubmitted, CreditScoreCalculated, etc)
- `detail`: De werkelijke data
- `time`, `id`, `region`: Auto gegenereerd door AWS

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html

---

## 🛠️ DEEL 4: Stap-voor-Stap Implementatie

### VOORBEREIDING: Wat Je Nodig Hebt

Checklist:
- [ ] AWS Account access
- [ ] IAM permissions voor EventBridge
- [ ] Je bestaande "Test" Lambda (van Dag 1)
- [ ] Browser (AWS Console)

---

### STAP 1: Naar AWS Console

1. Ga naar https://console.aws.amazon.com/
2. Zoeek naar "EventBridge"
3. Klik op **EventBridge** in de zoekresultaten

```
┌─────────────────────────────┐
│ AWS Console                 │
│ ┌───────────────────────┐   │
│ │ [Search: EventBridge] │   │
│ └───────────────────────┘   │
│                             │
│ Services:                   │
│ ✓ EventBridge              │
│ ✓ Lambda                   │
│ ✓ DynamoDB                 │
└─────────────────────────────┘
```

**Expected Output:** Je ziet het EventBridge dashboard met "Event Buses", "Rules", etc.

---

### STAP 2: Event Bus Creëren

**Waarom:** De Event Bus is het centrale "postkantoor" waar alle events aankomen.

**Stappen:**

1. In het linker menu, klik **"Event buses"**
   ```
   Links Menu:
   ├─ Dashboard
   ├─ Event buses ← HIER
   ├─ Rules
   ├─ Dead Letter Queues
   └─ Settings
   ```

2. Klik de blauwe knop **"Create event bus"**

3. Vul in:
   - **Name:** `sme-lending-event-bus`
   - **Tags (optioneel):** `Environment: dev`, `Project: sme-lending`
   - Laat rest op default

4. Klik **"Create"**

**Expected Output:**
```
✓ Event bus 'sme-lending-event-bus' successfully created
```

Je ziet hem nu in de list.

**Waarom deze naam?** 
- Duidelijk wat het doet (sme-lending = project)
- Namespace voorkomen met andere event buses
- Pattern: `<project>-<environment>-event-bus`

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-bus-create.html

---

### STAP 3: Rule Creëren (De Filter)

**Waarom:** De rule bepaalt welke events welke services triggeren. Zonder rule gaat je event naar nul targets.

**Stappen:**

1. In het linker menu, klik **"Rules"**

2. Selecteer event bus: **sme-lending-event-bus**
   ```
   Dropdown "Select event bus" → sme-lending-event-bus
   ```

3. Klik blauwe knop **"Create rule"**

4. **Naam & Beschrijving:**
   - Name: `loan-submitted-rule`
   - Description: `Routes LoanApplicationSubmitted events to Credit Scoring Lambda`

5. **Event Source (Kies één):**
   - Selecteer: **"AWS events or EventBridge partner events"**

6. **Event Pattern (Dit is het Filtermechanisme):**
   
   Klik op **"Edit pattern"** en paste dit:

   ```json
   {
     "source": ["sme-lending"],
     "detail-type": ["LoanApplicationSubmitted"]
   }
   ```

   **Wat betekent dit?**
   - `"source": ["sme-lending"]` = alleen events van jouw applicatie
   - `"detail-type": ["LoanApplicationSubmitted"]` = alleen loan submission events
   - Dit filtert al het andere weg

   **UI Alternatief (niet-JSON):**
   Kies "Event pattern" en vul in:
   ```
   Source: sme-lending
   Detail Type: LoanApplicationSubmitted
   ```

7. Klik **"Next"**

**Expected Output:**
```
Event pattern configured:
source: ["sme-lending"]
detail-type: ["LoanApplicationSubmitted"]
```

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-eventbridge-rule-targets.html

---

### STAP 4: Target Instellen (De Bestemming)

**Waarom:** Nu moet je zeggen wat WANNEER deze event gebeurt - welke Lambda moet worden getriggerd?

**Stappen:**

1. **Select targets** pagina:
   - Klik **"Select a target"** dropdown
   - Kies: **"Lambda function"**

2. **Function selecteren:**
   - Dropdown "Function:" → zoek naar **"Test"**
   - (Dit is je Lambda van Dag 1)

3. **IAM Role (BELANGRIJK):**
   - Kies: **"Create a new role for this specific resource"**
   - EventBridge maakt automatisch een role die je Lambda mag triggeren
   - Je hoeft hier nix in te vullen!

4. **Overige instellingen (optioneel):**
   - Dead-letter queue: laat leeg (later handig voor failures)
   - Retry: default is OK (2 retries)

5. Klik **"Create rule"**

**Expected Output:**
```
✓ Rule 'loan-submitted-rule' successfully created
✓ Associated with target: Lambda function 'Test'
```

**Waarom die IAM role?**
EventBridge moet mogen Lambda aanroepen. De role geeft dat toestemming.

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-lambda-target.html

---

### STAP 5: Event Sturen (De Test)

**Waarom:** We testen of alles werkt door een nep-event te sturen.

**Stappen:**

1. In het linker menu: klik **"Send events"** (onder "Events")

2. **Event details:**

   Vul dit in:

   ```
   Event Bus: sme-lending-event-bus
   
   Source: sme-lending
   
   Detail Type: LoanApplicationSubmitted
   
   Detail (JSON):
   {
     "applicationId": "APP-TEST-001",
     "applicantName": "Jan Jansen",
     "loanAmount": 50000,
     "companyRevenue": 250000,
     "companyDebt": 75000,
     "cashflow": 12000,
     "requestedTerm": 60
   }
   ```

3. Klik **"Put event"** (blauwe knop)

**Expected Output:**
```
✓ Successfully put event(s) to EventBridge
Event ID: abcd1234-ef56-gh78-ij90-klmnopqrstuv
```

**Wat gebeurt nu:**
1. Event gaat naar `sme-lending-event-bus`
2. Rule "loan-submitted-rule" matched het (source=sme-lending ✓, detail-type=LoanApplicationSubmitted ✓)
3. Lambda "Test" wordt automatisch getriggerd
4. Lambda gets event payload in `event` parameter

**AWS Documentatie:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-send-events.html

---

### STAP 6: Verifiëren in CloudWatch Logs

**Waarom:** Controleren of je Lambda de event echt ontving.

**Stappen:**

1. Ga naar **CloudWatch** (zoeken in AWS Console)

2. Linker menu: **"Log groups"**

3. Zoek: `/aws/lambda/Test` (je lambda logs)

4. Klik erop

5. Je ziet log streams met timestamp. Klik de **neuwste** (bovenaan)

6. **Je zou moeten zien:**

```
START RequestId: abc123def456 Version: $LATEST

{
  "version": "0",
  "id": "abcd1234-ef56-gh78-ij90-klmnopqrstuv",
  "detail-type": "LoanApplicationSubmitted",
  "source": "sme-lending",
  "account": "123456789012",
  "time": "2026-07-07T14:10:30Z",
  "region": "us-east-1",
  "detail": {
    "applicationId": "APP-TEST-001",
    "applicantName": "Jan Jansen",
    ...
  }
}

END RequestId: abc123def456
REPORT Duration: 45.12 ms...
```

**Wat betekent dit?**
- `START` + `END` = Lambda draaide succesvol
- De event data = je stuurde data correct
- `Duration: 45.12 ms` = hoe snel

**AWS Documentatie:** https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html

---

## ⚠️ DEEL 5: Troubleshooting (Hulp als het niet werkt)

### ❌ Probleem: Event zit niet in Lambda logs

**Mogelijke Oorzaken:**

1. **Rule matched niet**
   - Check: source moet exact "sme-lending" zijn (geen typo's)
   - Check: detail-type moet exact "LoanApplicationSubmitted" zijn

2. **Lambda krijgt geen permission van EventBridge**
   - Go to: Lambda → Test → Permissions
   - Zoek naar "eventbridge"
   - Should exist: "events:InvokeFunction"

3. **Lambda executable maakt error**
   - Check CloudWatch logs op error messages
   - Probeer Lambda manual triggeren via Lambda Console

**Oplossing:**
```bash
# Event pattern test
AWS CLI command om event te valideren:
aws events test-event-pattern \
  --event-pattern '{"source":["sme-lending"]}' \
  --event '{"source":"sme-lending","detail-type":"LoanApplicationSubmitted"}'
```

**AWS Troubleshooting Docs:** https://docs.aws.amazon.com/eventbridge/latest/userguide/troubleshooting.html

---

### ❌ Probleem: "Rule not found" fout

**Mogelijke Oorzaken:**
- Event Bus is verkeerd geselecteerd
- Rule is in "DISABLED" state

**Oplossing:**
1. Go to: Rules → filter op event bus "sme-lending-event-bus"
2. Check state = "ENABLED"
3. Klik toggle if needed

---

### ❌ Probleem: Permission denied op Target Lambda

**Oplossing:**
1. Go to: Lambda → Test → Permissions
2. Add permission:
   ```json
   {
     "Effect": "Allow",
     "Principal": {
       "Service": "events.amazonaws.com"
     },
     "Action": "lambda:InvokeFunction",
     "Resource": "arn:aws:lambda:us-east-1:123456789012:function:Test",
     "SourceArn": "arn:aws:events:us-east-1:123456789012:rule/sme-lending-event-bus/loan-submitted-rule"
   }
   ```

**AWS Docs:** https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-lambda-permissions.html

---

## 🧪 DEEL 6: Uitgebreide Tests

### Test 1: Basis Event

```json
{
  "applicationId": "TEST-001",
  "applicantName": "Test User",
  "loanAmount": 50000
}
```

**Expected:** Lambda logs event

---

### Test 2: Event met veel data

```json
{
  "applicationId": "TEST-002",
  "applicantName": "Complex User",
  "loanAmount": 100000,
  "companyRevenue": 500000,
  "companyDebt": 150000,
  "cashflow": 50000,
  "requestedTerm": 84,
  "industry": "Technology",
  "yearsInBusiness": 5
}
```

**Expected:** Lambda handles het zonder crash

---

### Test 3: Verkeerd Event (mag niet matchen)

```
Source: sme-lending
Detail Type: WrongEventType
```

**Expected:** Lambda krijgt NIKS (rule matches niet)

Check CloudWatch of rule event received maar niet matched → ok!

---

## 📚 DEEL 7: Referenties & Links

### Officiële AWS Documentatie

| Onderwerp | Link |
|-----------|------|
| EventBridge Intro | https://docs.aws.amazon.com/eventbridge/latest/userguide/what-is-amazon-eventbridge.html |
| Event Bus maken | https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-bus-create.html |
| Rules | https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html |
| Event Patterns | https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html |
| Targets | https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html |
| Lambda als Target | https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-lambda-target.html |
| Troubleshooting | https://docs.aws.amazon.com/eventbridge/latest/userguide/troubleshooting.html |

### Architectural Docs

| Topic | Why EventBridge |
|-------|-----------------|
| Event-Driven Architecture | https://aws.amazon.com/eventbridge/ |
| Asynchronous Communication | https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/ |
| Serverless Best Practices | https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html |

---

## ✅ DEEL 8: Checklist - Controleer Dat Je Klaar Bent

Na vandaag, controleer:

- [ ] Event Bus `sme-lending-event-bus` aangemaakt
- [ ] Rule `loan-submitted-rule` aangemaakt
- [ ] Event Pattern correct: `source=sme-lending`, `detail-type=LoanApplicationSubmitted`
- [ ] Target = Lambda "Test"
- [ ] Test event verstuurd
- [ ] Lambda ontvangt event in CloudWatch logs
- [ ] Geen errors in Lambda logs
- [ ] Progress.md bijgewerkt

### Bijwerkingen Progress.md

Voeg dit toe aan progress.md:

```markdown
## Day 4: EventBridge (2026-07-07) — COMPLETED
### What I Built
- Created event bus `sme-lending-event-bus`
- Created rule `loan-submitted-rule` to filter LoanApplicationSubmitted events
- Connected Test Lambda as target
- Successfully sent test event and verified in CloudWatch logs

### What I Learned
- EventBridge = decoupled event routing (no direct Lambda-to-Lambda calls)
- Event pattern = flexible filtering based on source and detail-type
- Rule automatically invokes target (Lambda) when event matches
- Asynchronous = submitting service doesn't wait for response
- CloudWatch logs confirm event delivery to target

### Key Success Metrics
- ✅ Event Bus created and accessible
- ✅ Rule matching working (test event was routed)
- ✅ Lambda invoked automatically
- ✅ Event payload visible in logs (data integrity confirmed)
```

---

## 🚀 VOLGENDE STAP: DAG 5

Nu je event routing klaar is, ga je **API Gateway** doen:

- Applicanten kunnen loan forms indienen
- Triggert "LoanApplicationSubmitted" event
- Event bus stuurt het door naar Credit Scoring

Bouwblokken:

```
API Gateway (REST API)
    ↓ (POST /applications)
Lambda: Submit Application
    ↓ (puts event)
EventBridge (sme-lending-event-bus)
    ↓ (routes LoanApplicationSubmitted)
Lambda: Credit Scoring
```

Veel succes! 🎯

---

**Vragen? Controleer:**
1. Officiële AWS docs (koppelingen bovenaan elke sectie)
2. AWS CloudWatch logs
3. EventBridge console "Send events" tester
4. AWS Support (voor account issues)
