# Dieren Redders Level Structuur

Dit document beschrijft de structuur van de levels in Dieren Redders, bedoeld voor ontwikkelaars en gebruikers van de level editor.

## Level Object Structuur

Elk level is gedefinieerd als een JavaScript object met de volgende structuur:

```javascript
{
    name: "Level Naam",
    allowedAnimals: ["SQUIRREL", "TURTLE", "UNICORN", "CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 300, y: 200, width: 100, height: 20, type: "NORMAL"},
        {x: 400, y: 130, width: 100, height: 20, type: "CLOUD"}
        // ...meer platforms
    ],
    traps: [
        {x: 350, y: 380, width: 40, height: 20, type: "SPIKES"}
        // ...meer vallen
    ],
    enemies: [
        {x: 400, y: 350, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1},
        {x: 600, y: 300, width: 60, height: 50, type: "DRAGON", patrolDistance: 150, speed: 0.8}
        // ...meer vijanden
    ],
    puppy: {
        x: 700, 
        y: 120, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 450, y: 150, width: 30, height: 30},                  // Standaard ster
        {x: 200, y: 200, width: 30, height: 30, type: "PEPPER"},  // Peper
        {x: 550, y: 100, width: 30, height: 30, type: "STAR"}     // Expliciet aangegeven ster
        // ...meer collectibles
    ]
}
```

## Eigenschappen

### Basis Level Informatie
- `name`: String - De naam van het level
- `allowedAnimals`: Array van strings - Welke dieren in dit level gebruikt kunnen worden. Mogelijke waarden: "SQUIRREL", "TURTLE", "UNICORN", "CAT"
- `startPositions`: Array van positie-objecten - Startposities voor beide spelers (minimaal 2 vereist)

### Platforms
Array van platform-objecten, elk met de volgende eigenschappen:
- `x`, `y`: Numeriek - Positie coördinaten
- `width`, `height`: Numeriek - Afmetingen
- `type`: String - Type platform met de volgende mogelijkheden:
  - `"NORMAL"`: Standaard platform waar alle dieren op kunnen staan
  - `"WATER"`: Water waarin alleen de schildpad kan zwemmen
  - `"TREE"`: Bomen waaraan alleen de eekhoorn kan klimmen
  - `"CLOUD"`: Wolkenplatforms waar alleen de eenhoorn op kan staan
  - `"CLIMB"`: Klimwanden waar alleen de eekhoorn op kan klimmen
  - `"TRAMPOLINE"`: Springplatforms die alle dieren hoger laten springen
  - `"LASER"`: Dodelijke horizontale laserstralen die geen enkel dier kan passeren
  - `"ICE"`: IJsplatforms met gladde oppervlakken
  - `"VERTICAL"`: Verticale muren die als obstakel dienen

### Vallen (Traps)
Array van val-objecten, elk met de volgende eigenschappen:
- `x`, `y`: Numeriek - Positie coördinaten
- `width`, `height`: Numeriek - Afmetingen
- `type`: String - Type val, momenteel alleen "SPIKES" ondersteund

### Vijanden (Enemies)
Array van vijand-objecten, elk met de volgende eigenschappen:
- `x`, `y`: Numeriek - Positie coördinaten
- `width`, `height`: Numeriek - Afmetingen
- `type`: String - Type vijand
  - `"LION"`: Leeuw die over platforms patrouileert
  - `"DRAGON"`: Draak die vuurspuwt
- `patrolDistance`: Numeriek - De afstand in pixels die de vijand patrouilleert
- `speed`: Numeriek - De snelheid waarmee de vijand beweegt

### Puppy
Het te redden puppy-object met de volgende eigenschappen:
- `x`, `y`: Numeriek - Positie coördinaten
- `width`, `height`: Numeriek - Afmetingen
- `saved`: Boolean - Altijd ingesteld op `false` in de initiële level definitie

### Verzamelobjecten (Collectibles)
Array van verzamelobjecten, elk met de volgende eigenschappen:
- `x`, `y`: Numeriek - Positie coördinaten
- `width`, `height`: Numeriek - Afmetingen
- `type`: String (optioneel) - Type verzamelobject
  - `"STAR"`: Ster (standaard)
  - `"PEPPER"`: Peper die tijdelijke vuurspuwcapaciteit geeft

## Minimale Vereisten voor Geldige Levels

Een geldig level moet minimaal de volgende elementen bevatten:
1. Een naam
2. Minstens één dier in `allowedAnimals` array
3. Twee startposities voor de spelers
4. Een puppy om te redden
5. Minstens één verzamelobject (ster)

## Gebruik in Level Editor

De level editor gebruikt deze structuur om levels te visualiseren en te bewerken. Wanneer je een level opslaat, wordt het geconverteerd naar de hierboven beschreven JavaScript object notatie en opgeslagen in het levels.js bestand.

## Voorbeeld Level

Hieronder staat een voorbeeld van een eenvoudig level:

```javascript
{
    name: "Intro Level",
    allowedAnimals: ["SQUIRREL", "TURTLE", "UNICORN", "CAT"],
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 0, y: 380, width: 800, height: 20, type: "NORMAL"},
        {x: 300, y: 250, width: 100, height: 20, type: "NORMAL"},
        {x: 500, y: 150, width: 100, height: 20, type: "CLOUD"}
    ],
    traps: [
        {x: 400, y: 380, width: 40, height: 20, type: "SPIKES"}
    ],
    enemies: [
        {x: 650, y: 340, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 750, 
        y: 350, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 300, y: 220, width: 30, height: 30},
        {x: 500, y: 120, width: 30, height: 30, type: "PEPPER"}
    ]
}
```