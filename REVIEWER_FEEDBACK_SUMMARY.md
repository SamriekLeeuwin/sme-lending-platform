# Korte samenvatting feedback

Ik begrijp uit de feedback vooral dat mijn grootste gat niet de Lambda-code is, maar de infra eromheen. In de README lijkt het alsof alles met CDK reproduceerbaar is, maar in de CDK-stack staat nu vooral de submit Lambda. De tabellen, event bus, rules, DLQ's, alarms en veel security/backup dingen moeten dus nog echt in code komen.

De belangrijkste punten die ik moet oppakken:

- Infra in CDK zetten, niet handmatig in AWS laten staan.
- Regio naar Europa zetten en env/account niet laten afhangen van mijn terminal.
- DynamoDB tabellen beschermen met backup, retain en point-in-time recovery.
- Events kleiner maken: niet de hele aanvraag meesturen, maar vooral `applicationId`.
- Outbox/idempotency regelen voordat meerdere services hetzelfde event verwerken.
- Credit scoring testen, want de score-weging lijkt nu fout waardoor alles HIGH kan worden.
- Bedragen later als centen opslaan, niet als gewone JavaScript numbers.
- EventBridge handlers moeten bij echte fouten throwen, geen `statusCode: 400` teruggeven.
- Logging, tracing, DLQ's en alarms toevoegen zodat fouten niet stil verdwijnen.
- README duidelijker maken: wat is al gebouwd en wat is alleen nog ontwerp.

Mijn volgorde wordt: eerst de functionele bugs en tests, daarna CDK infra compleet maken, daarna betrouwbaarheid met DLQ/outbox/idempotency, en daarna compliance/audit dingen zoals bewaartermijnen en logging.
