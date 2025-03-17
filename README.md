# Dieren Redders 🐿️🐢🦄🐱

Een leuk platform-puzzelspel voor een ouder en kind om samen te spelen! In dit spel werken verschillende dieren samen om puzzels op te lossen, een puppy te redden en uitdagingen te overwinnen.

## Speel Online

Je kunt het spel online spelen via [GitHub Pages](https://erikdebruijn.github.io/animal-rescue/).

## Het Spel

In Dieren Redders bestuur je samen met je kind verschillende dieren om levels te voltooien. Elk dier heeft zijn eigen vaardigheden:

- **Eekhoorn** 🐿️: Kan hoog springen en in bomen klimmen
- **Schildpad** 🐢: Kan zwemmen door water (let op het zuurstofniveau!)
- **Eenhoorn** 🦄: Kan vliegen (met omhoog-toets) en op wolkenplatforms staan
- **Kat** 🐱: Kan klauwen gebruiken voor aanvallen en heeft soepele bewegingen

De spelers moeten samenwerken en van dier wisselen om alle uitdagingen in het level te overwinnen, de puppy te redden en sterren te verzamelen. Sommige dieren hebben speciale krachten zoals vuurspuwen, die ze kunnen gebruiken tegen vijanden.

## Besturing

### Speler 1 (links op het toetsenbord)
- **W, A, S, D** om te bewegen
- **F** om van dier te wisselen
- **G** om speciale kracht te gebruiken (bijv. vuurspuwen of klauwen)

### Speler 2 (rechts op het toetsenbord)
- **Pijltjestoetsen** om te bewegen
- **Shift** om van dier te wisselen
- **Ctrl** om speciale kracht te gebruiken (bijv. vuurspuwen of klauwen)

## Spel Installeren & Spelen

Je kunt het spel op twee manieren spelen:
1. Open `index.html` direct in de browser
2. Start de Python server voor extra functies zoals het opslaan van zelfgemaakte levels

### Python server starten

De Python server biedt extra functionaliteit, zoals het opslaan van aangepaste levels in de level editor.

Vereisten:
- Python 3.6 of hoger
- Flask en andere dependencies installeren:
  ```
  pip install -r requirements.txt
  ```

#### Normale modus (zonder level editor)
```
python server.py
```

De game is beschikbaar op: http://localhost:5050

#### Development modus (met level editor)
```
python server.py --dev
```

Of via environment variable:
```
DIERENREDDERS_DEV_MODE=true python server.py
```

In development mode is de level editor beschikbaar op: http://localhost:5050/editor

## Level Editor

Je kunt je eigen levels maken en bewerken met de level editor (alleen beschikbaar in development mode).

- Via de server in development mode: Ga naar http://localhost:5050/editor

Wanneer je de server gebruikt, kun je levels opslaan met de "Opslaan" knop en worden deze direct in het spel beschikbaar.

### Nieuwe features in de editor

1. Geselecteerde objecten kunnen worden verwijderd met de delete toets
2. Je kunt wisselen tussen de tools 'verplaatsen' en 'formaat' door nog een keer op hetzelfde object te klikken 
3. Er is een waarschuwing bij wisselen van level als er niet-opgeslagen wijzigingen zijn
4. Ondersteuning voor LASER platforms: plaats dodelijke laserstralen in je levels
5. Meerdere platform types: standaard, water, wolken, klimwanden, trampolines en lasers

## Levels

Het spel bevat meerdere levels met toenemende moeilijkheidsgraad:

1. **Samen werken**: Een introductieniveau om de besturing te leren
2. **Klimmen en zwemmen**: Een level waar je specifieke diervaardigheden moet gebruiken
3. **Samen naar de top**: Een uitdagender level met meer vijanden en obstakels

## Speciale Elementen

- **Water**: Alleen de schildpad kan zwemmen, maar let op het zuurstofniveau! Schildpadden moeten af en toe boven water komen om adem te halen.
- **Bomen en Klimwanden**: De eekhoorn kan klimmen, de andere dieren niet.
- **Wolken**: Alleen de eenhoorn kan op wolkenplatforms staan.
- **Trampolines**: Springplatforms die alle dieren hoger kunnen laten springen.
- **Spikes**: Gevaarlijke vallen die alle dieren moeten vermijden.
- **Lasers**: Dodelijke horizontale stralen die niemand kan passeren.
- **Leeuwen**: Gevaarlijke vijanden die het op jullie puppy hebben gemunt.
- **Draken**: Vuurspuwende vijanden! Pas op voor hun vlammen.
- **Pepers**: Verzamel deze om tijdelijk vuur te kunnen spuwen en vijanden te verslaan.
- **Puppy**: Red de puppy voordat je de ster verzamelt!
- **Sterren**: Verzamel de ster om het level te voltooien (nadat je de puppy hebt gered) en scoor 50 punten per ster.

## Tip voor Ouders

Dit spel is ontworpen om samen te spelen en samenwerking te stimuleren. Praat met je kind over strategieën en wissel tussen de verschillende dieren om puzzels op te lossen. Bespreek welk dier geschikt is voor welke uitdaging en waarom!

## Codestructuur

De codebase is als volgt georganiseerd:

- `index.html` - Hoofdpagina van het spel
- `game.js` - Hoofdlogica van het spel
- `game-core.js` - Kernfunctionaliteit van het spel
- `game-entities.js` - Speler, vijanden en andere game-entiteiten (gedrag)
- `game-characters.js` - Functies voor het renderen van karakters
- `game-rendering.js` - Functies voor het renderen van de omgeving
- `game-controls.js` - Invoerverwerking
- `levels.js` - Leveldefinities
- `server.py` - Python-server voor ontwikkelingsmodus en het opslaan van levels
- `editor.html` / `editor.js` - Level-editor
- `styles.css` / `editor-styles.css` - Styling
- `test_server.py` / `test_dev_mode.py` - Geautomatiseerde tests

---

Gemaakt met HTML5, JavaScript en Canvas 🌟