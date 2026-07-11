# EventBridge naar Lambda: hoe je event data begrijpt

Deze notitie is een korte handleiding op basis van de officiele AWS documentatie. Het doel is niet om implementatiecode te geven, maar om te begrijpen waar `event.detail` vandaan komt en waarom `credit-scoring` daaruit leest.

## 1. Wat is een EventBridge event?

Volgens de AWS EventBridge documentatie zijn events JSON objects met vaste top-level metadata velden. Belangrijke velden zijn:

- `id`: unieke event identifier
- `detail-type`: naam/type van wat er gebeurd is
- `source`: welke service/applicatie het event heeft gemaakt
- `time`: timestamp van het event
- `region`: AWS region
- `resources`: optionele betrokken AWS resources
- `detail`: de inhoudelijke event payload

Bron: https://docs.aws.amazon.com/eventbridge/latest/ref/events-structure.html

## 2. Waarom lezen we `event.detail`?

AWS beschrijft `detail` als het JSON object dat informatie over het event bevat. De service of applicatie die het event maakt, bepaalt welke data hierin staat.

Voor ons project betekent dat:

- `source` vertelt dat het event uit `submit-application` komt.
- `detail-type` vertelt dat het event een `LoanApplicationSubmitted` event is.
- `detail` bevat de aanvraagdata die credit scoring nodig heeft.

Daarom leest een Lambda die door EventBridge wordt getriggerd uit:

```text
event.detail
```

en niet uit:

```text
event.body
```

`event.body` hoort bij HTTP/API Gateway style events. `event.detail` hoort bij EventBridge events.

Bron: https://docs.aws.amazon.com/eventbridge/latest/ref/events-structure.html

## 3. Wat moet een custom event minimaal hebben?

Volgens AWS heeft een custom EventBridge event minimaal deze velden nodig:

- `detail`
- `detail-type`
- `source`

Dat past bij onze flow:

- `source`: wie publiceert het event
- `detail-type`: wat is er gebeurd
- `detail`: welke business data hoort bij dit event

Bron: https://docs.aws.amazon.com/eventbridge/latest/ref/events-structure.html

## 4. Wat doet `PutEvents`?

AWS gebruikt `PutEvents` om custom events naar EventBridge te sturen. Een `PutEvents` request kan meerdere entries bevatten. Na het ontvangen van een event geeft EventBridge ieder event een unieke ID.

Belangrijke velden in een entry zijn:

- `Source`
- `DetailType`
- `Detail`
- eventueel `Resources`
- eventueel `Time`

Voor ons project is het belangrijkste idee:

```text
submit-application publiceert een event naar EventBridge
EventBridge ontvangt dat event
EventBridge kan regels gebruiken om targets te triggeren
```

Bron: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevents.html

## 5. Wat is een EventBridge rule?

Een rule kijkt of een event past bij een event pattern. Als het event matcht, stuurt EventBridge het event door naar een target.

Voor ons project wordt het patroon conceptueel:

```text
source = sme-lending.submit-application
detail-type = LoanApplicationSubmitted
```

Als een event hierop matcht, kan EventBridge bijvoorbeeld de `credit-scoring` Lambda triggeren.

Bron: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html

## 6. Wat is een target?

Een target is de resource waar EventBridge een event naartoe stuurt wanneer een rule matcht. AWS noemt Lambda functions als een ondersteund target type.

Voor ons project:

```text
EventBridge rule matcht LoanApplicationSubmitted
EventBridge stuurt event naar credit-scoring Lambda
credit-scoring Lambda leest event.detail
```

Bron: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html

## 7. Waarom mappen naar `CreditScoringInput`?

AWS zegt dat `detail` het JSON object is met informatie over het event. Dat betekent niet dat elke Lambda alles uit `detail` moet gebruiken.

Voor clean architecture kiezen we bewust welke data credit scoring nodig heeft:

- `applicationId`
- `loanAmount`
- `loanTermMonths`
- `monthlyCashflow`
- `existingDebt`

De rest van de aanvraag, zoals email of phone number, is niet nodig voor scoring. Daarom is het goed om de volledige event detail om te zetten naar een kleiner domeinobject:

```text
SubmitApplicationData
  -> CreditScoringInput
```

Dit is geen specifieke AWS regel, maar een ontwerpkeuze die volgt uit het feit dat `detail` de volledige event payload kan bevatten.

## 8. Belangrijke mentale regel

```text
API Gateway / HTTP event
  -> data staat meestal in event.body

EventBridge event
  -> business data staat in event.detail
```

Voor dit project:

```text
submit-application
  -> maakt application object
  -> publiceert EventBridge event met Detail

credit-scoring
  -> ontvangt EventBridge event
  -> leest event.detail
  -> haalt alleen CreditScoringInput velden eruit
```

## 9. Waar komt `event.body` vandaan?

`event.body` komt meestal van API Gateway Lambda proxy integration.

Volgens de AWS API Gateway documentatie stuurt API Gateway bij een Lambda proxy integration de volledige HTTP request naar Lambda als een `event` object. Dat event bevat onder andere:

- `headers`
- `queryStringParameters`
- `pathParameters`
- `requestContext`
- `body`
- `isBase64Encoded`

In het AWS voorbeeld staat `body` als top-level veld in het Lambda event. Dat is de HTTP payload/body die de client naar de API stuurt.

Bron: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html

Dit betekent:

```text
HTTP client / frontend
  -> stuurt request body
API Gateway
  -> zet die body in event.body
Lambda
  -> leest event.body
```

Omdat `body` bij proxy integration een string is, moet de Lambda die body meestal parsen naar een object.

Conceptueel:

```text
event.body
  -> JSON string
  -> parse naar object
  -> valideer als SubmitApplicationInput
```

## 10. Waar komt `event.detail` vandaan?

`event.detail` komt van EventBridge.

Volgens de AWS EventBridge event structure documentatie heeft een EventBridge event een top-level veld `detail`. AWS beschrijft `detail` als het JSON object met informatie over het event.

Voor ons project:

```text
submit-application
  -> publiceert EventBridge event
  -> zet application data in Detail

EventBridge
  -> levert event aan target Lambda
  -> target Lambda ontvangt die data in event.detail
```

Dus:

```text
event.detail
  -> JSON object
  -> map naar CreditScoringInput
  -> valideer als CreditScoringInput
```

Bron: https://docs.aws.amazon.com/eventbridge/latest/ref/events-structure.html

## 11. Hoe haal je data eruit in een functie?

De beste mentale aanpak is: maak een kleine extractie- of mappingfunctie per soort event.

Waarom?

- De AWS event shape blijft aan de buitenkant van je Lambda.
- Je business logic hoeft niet steeds te weten of data uit `body` of `detail` kwam.
- Je maakt expliciet welk domeinobject je nodig hebt.

Voor API Gateway denk je conceptueel:

```text
extractSubmitApplicationInput(apiGatewayEvent)
  input: API Gateway Lambda event
  output: SubmitApplicationInput
```

Deze functie doet:

```text
pak event.body
parse JSON string
return SubmitApplicationInput vorm
```

Voor EventBridge denk je conceptueel:

```text
extractCreditScoringInput(eventBridgeEvent)
  input: EventBridge Lambda event
  output: CreditScoringInput
```

Deze functie doet:

```text
pak event.detail
map alleen benodigde velden
return CreditScoringInput vorm
```

Voor ons project is de belangrijkste vertaling:

```text
SubmitApplicationData
  -> CreditScoringInput
```

Dat betekent:

```text
volledige submitted application komt binnen via event.detail
credit-scoring kiest alleen de velden die nodig zijn
```

## 12. Waarom niet overal direct `event.body` of `event.detail` gebruiken?

Dat kan technisch wel, maar het maakt code minder schoon.

Minder schoon:

```text
handler
  -> leest event.detail
  -> pakt loanAmount
  -> pakt existingDebt
  -> berekent score
```

Schonere gedachte:

```text
handler
  -> extract/map event naar CreditScoringInput
  -> valideer CreditScoringInput
  -> bereken score met CreditScoringInput
```

Dan wordt de handler een coordinator, niet een rommelige plek waar AWS event parsing, validation en business logic door elkaar staan.

## Bronnen

- AWS EventBridge event structure: https://docs.aws.amazon.com/eventbridge/latest/ref/events-structure.html
- AWS EventBridge PutEvents: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-putevents.html
- AWS EventBridge rules: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html
- AWS EventBridge targets: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html
- AWS API Gateway Lambda proxy integration input format: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
- AWS Lambda with API Gateway event format: https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html
