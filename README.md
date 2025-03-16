# Dieren Redders 🐿️🐢🦄

Een leuk platform-puzzelspel voor een ouder en kind om samen te spelen! In dit spel werken verschillende dieren samen om puzzels op te lossen, een puppy te redden en uitdagingen te overwinnen.

## Het Spel

In Dieren Redders bestuur je samen met je kind verschillende dieren om levels te voltooien. Elk dier heeft zijn eigen vaardigheden:

- **Eekhoorn** 🐿️: Kan hoog springen en in bomen klimmen
- **Schildpad** 🐢: Kan zwemmen door water
- **Eenhoorn** 🦄: Kan vliegen (met omhoog-toets) en op wolkenplatforms staan

De spelers moeten samenwerken en van dier wisselen om alle uitdagingen in het level te overwinnen, de puppy te redden en sterren te verzamelen.

## Besturing

### Speler 1 (links op het toetsenbord)
- **W, A, S, D** om te bewegen
- **F** om van dier te wisselen

### Speler 2 (rechts op het toetsenbord)
- **Pijltjestoetsen** om te bewegen
- **Shift** om van dier te wisselen

## Spel Installeren & Spelen

Je kunt het spel op twee manieren spelen:
1. Open `index.html` direct in de browser
2. Start de Python server voor extra functies zoals het opslaan van zelfgemaakte levels

### Python server starten

De Python server biedt extra functionaliteit, zoals het opslaan van aangepaste levels in de level editor.

Vereisten:
- Python 3.6 of hoger
- Flask (`pip install flask`)

Starten:
```
python server.py
```

De server draait op http://10.1.1.0:5000 en accepteert verbindingen van je lokale netwerk (10.1.1.0/24).

## Level Editor

Je kunt je eigen levels maken en bewerken met de level editor. 

- Via browser: Open `editor.html`
- Via server: Ga naar http://10.1.1.0:5000/editor

Wanneer je de server gebruikt, kun je levels opslaan met de "Opslaan" knop en worden deze direct in het spel beschikbaar.

## Levels

Het spel bevat meerdere levels met toenemende moeilijkheidsgraad:

1. **Samen werken**: Een introductieniveau om de besturing te leren
2. **Klimmen en zwemmen**: Een level waar je specifieke diervaardigheden moet gebruiken
3. **Samen naar de top**: Een uitdagender level met meer vijanden en obstakels

## Speciale Elementen

- **Water**: Alleen de schildpad kan zwemmen, de andere dieren moeten een andere route vinden
- **Bomen en Klimwanden**: De eekhoorn kan klimmen, de andere dieren niet
- **Wolken**: Alleen de eenhoorn kan op wolkenplatforms staan
- **Spikes**: Gevaarlijke vallen die alle dieren moeten vermijden
- **Leeuwen en Draken**: Vijanden die het op jullie puppy hebben gemunt
- **Puppy**: Red de puppy voordat je de ster verzamelt!
- **Sterren**: Verzamel de ster om het level te voltooien (nadat je de puppy hebt gered)

## Tip voor Ouders

Dit spel is ontworpen om samen te spelen en samenwerking te stimuleren. Praat met je kind over strategieën en wissel tussen de verschillende dieren om puzzels op te lossen. Bespreek welk dier geschikt is voor welke uitdaging en waarom!

---

Gemaakt met HTML5, JavaScript en Canvas 🌟