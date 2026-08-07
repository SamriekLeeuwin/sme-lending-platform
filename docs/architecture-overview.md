# Architecture overview

## Doel van het project

Dit project is een eenvoudige, serverless lending-platform voor kleine en middelgrote bedrijven. De hoofdgedachte is dat een leningaanvraag via een reeks losse onderdelen wordt verwerkt.

## Belangrijk idee

De applicatie werkt niet als één grote monoliet, maar als een event-driven systeem:

1. Een klant of gebruiker doet een aanvraag.
2. De aanvraag wordt gecontroleerd op geldigheid.
3. De aanvraag wordt verwerkt door verschillende services.
4. Elke service heeft één duidelijke verantwoordelijkheid.

## Huidige architectuur

De projectstructuur is opgebouwd rond deze onderdelen:

- Frontend: gebruikersinterface
- Submit application: neemt de aanvraag aan en valideert deze
- Credit scoring: berekent een risicopunt voor de aanvraag
- Decision engine: bepaalt of de aanvraag wordt goedgekeurd of afgewezen
- Notification: verzorgt communicatie of meldingen

## Flow van een aanvraag

Een aanvraag loopt ongeveer zo:

1. Gebruiker stuurt een leningaanvraag in.
2. De submit-service controleert of de gegevens compleet en geldig zijn.
3. Als de aanvraag geldig is, wordt een event aangemaakt.
4. Andere services luisteren naar dit event.
5. Credit scoring verwerkt de aanvraag en berekent een score.
6. De decision engine bepaalt het uiteindelijke besluit.
7. Notificaties kunnen vervolgens worden verstuurd.

## Waarom deze architectuur?

Deze aanpak is handig omdat:

- onderdelen onafhankelijk van elkaar kunnen werken
- een onderdeel kan worden aangepast zonder het hele systeem te breken
- het makkelijker is om later nieuwe functionaliteit toe te voegen

## Huidige status

Het project is nog in ontwikkeling.

De volgende onderdelen zijn zichtbaar:

- aanvraagvalidatie
- credit scoring-opzet
- event-driven verwerking

De volgende onderdelen moeten nog verder worden uitgewerkt:

- volledige persistente opslag
- koppeling tussen scoring en besluitvorming
- testen van de volledige aanvraagflow

## Visuele mental model

Het systeem kan worden gezien als:

User -> Submit Application -> Event -> Credit Scoring -> Decision Engine -> Notification

## Volgende stappen

De volgende prioriteiten zijn nu belangrijk:

1. Voltooien van de submit-aanvraagflow
2. Verder uitwerken van credit scoring
3. Koppelen van scoring aan een besluit
4. Toevoegen van opslag voor aanvragen en resultaten
5. Testen van de volledige flow end-to-end

## Samenvatting

Het project is een leerproject dat laat zien hoe een leningworkflow kan worden opgebouwd met losse, samenwerkende services in een serverless omgeving.
