# Huisdieren Redders 🐿️🐢🦄🐱

Een leuk platform-puzzelspel voor een ouder en kind om samen te spelen! In dit spel werken verschillende dieren samen om puzzels op te lossen, een puppy te redden en uitdagingen te overwinnen.

## Speel Online

Je kunt het spel online spelen via [GitHub Pages](https://erikdebruijn.github.io/animal-rescue/).

## Het Spel

In Huisdieren Redders bestuur je samen met je kind verschillende dieren om levels te voltooien. Het spel bevat drie speltypen:

1. **Platformer**: Het hoofdspel waarin je met verschillende dieren puzzels oplost en uitdagingen overwint
2. **Memory Spel**: Een geheugenspel waarin je kaarten moet matchen
3. **Wereldkaart**: Een overzicht van beschikbare levels en speltypen waartussen je kunt navigeren

### Wereldkaart

Via de wereldkaart kun je navigeren tussen verschillende speltypes en levels:
- Voltooide levels worden blauw weergegeven
- Beschikbare levels zijn groen
- Het huidige level is oranje
- Vergrendelde levels zijn grijs

Je kunt naar de wereldkaart gaan door op het kaart-icoontje (🗺️) te klikken in het hoofdspel. De kaart houdt je voortgang automatisch bij in de browser.

### Speelbare Dieren

Elk dier heeft zijn eigen vaardigheden:

- **Eekhoorn** 🐿️: Kan hoog springen en in bomen klimmen
- **Schildpad** 🐢: Kan zwemmen door water (let op het zuurstofniveau!)
- **Eenhoorn** 🦄: Kan vliegen (met omhoog-toets) en op wolkenplatforms staan
- **Kat** 🐱: Kan klauwen gebruiken voor aanvallen en heeft soepele bewegingen
- **Mol** 🦔: Kan graven door muren en de grond (met speciale-kracht-knop)

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

Voor ontwikkelaars is er een uitgebreide ontwikkelaarsdocumentatie beschikbaar in [DEVELOPMENT.md](DEVELOPMENT.md).

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
- **Loopbanden**: Platforms die spelers automatisch naar links of rechts bewegen.
- **Spikes**: Gevaarlijke vallen die alle dieren moeten vermijden.
- **Lasers**: Dodelijke horizontale stralen die niemand kan passeren.
- **Leeuwen**: Gevaarlijke vijanden die het op jullie puppy hebben gemunt.
- **Draken**: Vuurspuwende vijanden! Pas op voor hun vlammen.
- **Piranha's**: Gevaarlijke vissen die in water zwemmen. Ze achtervolgen je agressief zodra je in het water komt, dus probeer ze te vermijden! Piranha's die uit het water raken floppen hulpeloos op hun rug en kunnen geen schade meer aanrichten.
- **Pepers**: Verzamel deze om tijdelijk vuur te kunnen spuwen en vijanden te verslaan.
- **Zandlopers**: Activeren slow-motion voor alle vijanden en andere spelers, behalve jou!
- **Puppy**: Red de puppy voordat je de ster verzamelt!
- **Sterren**: Verzamel de ster om het level te voltooien (nadat je de puppy hebt gered) en scoor 50 punten per ster.
- **Wereldkaart**: Navigeer tussen verschillende levels en speltypen via de kaart (🗺️ icoon).

## Geluidseffecten

Dieren Redders bevat nu geluidseffecten! Plaats de volgende bestanden in de `sounds/` map:

- **jump.mp3**: Geluid bij springen
- **splash.mp3**: Geluid bij water
- **collect.mp3**: Geluid bij verzamelen van items
- **puppy.mp3**: Geluid bij redden van puppy
- **claw.mp3**: Geluid bij gebruik van klauwen (kat)
- **dig.mp3**: Geluid bij graven (mol)
- **bounce.mp3**: Geluid bij gebruik van trampolines
- **fire.mp3**: Geluid bij vuurspuwen
- **game-over.mp3**: Geluid bij game over

Je kunt het geluid aan/uit zetten met de knop rechtsboven in het spel.

## Tip voor Ouders

Dit spel is ontworpen om samen te spelen en samenwerking te stimuleren. Praat met je kind over strategieën en wissel tussen de verschillende dieren om puzzels op te lossen. Bespreek welk dier geschikt is voor welke uitdaging en waarom!

Via de wereldkaart kun je ook verschillende speltypen kiezen, zodat het kind kan variëren tussen verschillende speelstijlen.

---

Gemaakt met HTML5, JavaScript en Canvas 🌟