# Ontwikkelaarsdocumentatie

Deze documentatie is bedoeld voor ontwikkelaars die willen bijdragen aan het Huisdieren Redders spel of de code willen begrijpen.

## Development Modus Starten

Om in development modus te werken met toegang tot de level editor:

```bash
python server.py --dev
```

Of via environment variable:
```bash
DIERENREDDERS_DEV_MODE=true python server.py
```

In development mode is de level editor beschikbaar op: http://localhost:5050/editor

**Belangrijk**: Tijdens ontwikkeling hoeft de server niet handmatig herstart te worden. De server detecteert automatisch wijzigingen in de code en herlaadt de browser wanneer bestanden worden bijgewerkt.

## Level Editor

Je kunt je eigen levels maken en bewerken met de level editor (alleen beschikbaar in development mode).

- Via de server in development mode: Ga naar http://localhost:5050/editor

Wanneer je de server gebruikt, kun je levels opslaan met de "Opslaan" knop en worden deze direct in het spel beschikbaar.

Voor meer informatie over de structuur van levels, zie [LEVELS.md](LEVELS.md).

### Nieuwe features in de editor

1. Geselecteerde objecten kunnen worden verwijderd met de delete toets
2. Je kunt wisselen tussen de tools 'verplaatsen' en 'formaat' door nog een keer op hetzelfde object te klikken 
3. Er is een waarschuwing bij wisselen van level als er niet-opgeslagen wijzigingen zijn
4. Ondersteuning voor LASER platforms: plaats dodelijke laserstralen in je levels
5. Meerdere platform types: standaard, water, wolken, klimwanden, trampolines en lasers

## Codestructuur

De codebase is als volgt georganiseerd:

- `index.html` - Hoofdpagina van het spel
- `map.html` / `map.js` - Wereldkaart voor level selectie
- `game.js` - Hoofdlogica van het spel
- `game-core.js` - Kernfunctionaliteit van het spel
- `game-entities.js` - Speler, vijanden en andere game-entiteiten (gedrag)
- Character rendering modules:
  - `game-characters-core.js` - Hoofdmodule voor karakterrendering
  - `game-characters-players.js` - Functies voor het renderen van speelbare karakters
  - `game-characters-npcs.js` - Functies voor het renderen van niet-speelbare karakters
  - `game-characters-effects.js` - Functies voor het renderen van effecten
- `game-rendering.js` - Functies voor het renderen van de omgeving
- `game-controls.js` - Invoerverwerking
- `levels.js` - Leveldefinities
- `LEVELS.md` - Documentatie van level structuur
- `server.py` - Python-server voor ontwikkelingsmodus en het opslaan van levels
- `editor.html` / `editor.js` - Level-editor
- `styles.css` / `editor-styles.css` - Styling
- `test_server.py` / `test_dev_mode.py` - Geautomatiseerde tests
- `run-tests.js` - JavaScript tests voor het spelmechanisme
- `tests.js` / `tests-automated.js` - Testdefinities voor spelgedrag

## Kwaliteitschecks

Voor het bijdragen aan dit project, zorg ervoor dat alle wijzigingen voldoen aan de volgende kwaliteitscriteria:

1. **Geen syntaxfouten** - Alle JavaScript code moet syntactisch correct zijn
2. **Tests slagen** - Voer de tests uit met `node run-tests.js` om te verifiëren dat alle functionaliteit correct werkt
3. **Visuele controle** - Test het spel in de browser om te controleren of visuele elementen correct werken

### Syntax Controle Werktuigen

Dit project bevat verschillende hulpmiddelen om syntax fouten te voorkomen:

#### 1. check-syntax.js

Een JavaScript syntax checker die extra controles uitvoert die node's ingebouwde checker niet altijd detecteert:

```bash
# Controleer één JS bestand
node check-syntax.js game-entities.js

# Controleer alle JS bestanden in het project
node check-syntax.js
```

Deze checker controleert op:
- Ongelijke accolades `{}`
- Ongelijke haakjes `()`
- Ontbrekende sluithaakjes na function calls
- Andere veelvoorkomende syntax errors

#### 2. Pre-commit Hook Installeren

Installeer de pre-commit hook om syntax checks automatisch uit te voeren voordat je wijzigingen commit:

1. De hook wordt automatisch gekopieerd naar `.git/hooks/pre-commit` wanneer je de repository kloont
2. Zorg ervoor dat het script uitvoerbaar is: `chmod +x .git/hooks/pre-commit`

Wat de pre-commit hook doet:
- JavaScript syntax controle op alle gewijzigde bestanden
- Meer uitgebreide syntax controle met `check-syntax.js`
- Controleert alle JavaScript bestanden om problemen in afhankelijke bestanden te vinden
- Voert alle tests uit om te controleren of alles nog werkt

Door deze combinatie van syntax controles wordt voorkomen dat er per ongeluk code met fouten wordt gecommit die de browser niet correct kan uitvoeren.

Als je ESLint of een andere linter wilt toevoegen aan het project, installeer dan de benodigde pakketten en voeg de linting stap toe aan de pre-commit hook.

## Toevoegen van een nieuw platformtype

Wil je een nieuw platformtype toevoegen aan het spel? Volg dan deze stappen:

1. **Editor kleuren toevoegen**: Voeg een nieuwe kleur toe aan `objectColors.platform` in `editor.js`.
2. **Editor UI bijwerken**: Voeg een nieuwe optie toe aan het `platform-type` dropdown menu in `editor.html`.
3. **Rendering toevoegen**: Implementeer de tekenroutine voor het nieuwe platformtype in de `drawPlatform` functie in `game-rendering.js`.
4. **Gedrag toevoegen**: Implementeer de fysica en het gedrag van het platform in `game-entities.js`.
5. **Collision detectie toevoegen**: Voeg het nieuwe platformtype toe aan de if-statement met platformtypes in `game-entities.js` om ervoor te zorgen dat spelers niet door het platform vallen.
6. **Eigenschappen ondersteunen**: Indien nodig, voeg extra eigenschappen toe aan het platform object (zoals `speed` voor loopbanden).
7. **Export code aanpassen**: Als je extra eigenschappen hebt toegevoegd (zoals `speed`), zorg ervoor dat deze ook worden geëxporteerd in de `exportLevelCode` functie in `editor.js`.
8. **README bijwerken**: Voeg informatie over het nieuwe platformtype toe aan de README.

**Belangrijk**: Als je speciale eigenschappen toevoegt, zoals `speed` voor loopbanden, zorg er dan voor dat:
- De eigenschap consistent wordt gebruikt in de code (zelfde naam overal)
- De eigenschap correct wordt opgeslagen in het level-object
- De eigenschap wordt meegenomen in de `exportLevelCode` functie voor het opslaan naar de server

Voorbeeld: Het "Loopband" platformtype is toegevoegd om spelers automatisch naar links of rechts te bewegen, met een instelbare snelheid. De waarde kan positief (rechts) of negatief (links) zijn en bepaalt zowel de richting als snelheid waarmee spelers worden verplaatst.