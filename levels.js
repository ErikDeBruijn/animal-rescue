// Dieren Redders - Level definities
// Dit bestand bevat alle level ontwerpen voor het spel

// Level ontwerpen - deze functie wordt aangeroepen nadat de canvas is gemaakt
function getLevels(GROUND_LEVEL) {    return [
        {
    name: "Samen werken",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 460, y: 375, width: 150, height: 20, type: "NORMAL"},
        {x: 389, y: 270, width: 150, height: 20, type: "NORMAL"},
        {x: 650, y: 376, width: 150, height: 20, type: "NORMAL"},
        {x: 613, y: 195, width: 30, height: 200, type: "TREE"},
        {x: 8, y: 357, width: 120, height: 40, type: "CLOUD"}
    ],
    traps: [
        {x: 494, y: 198, width: 115, height: 21, type: "SPIKES"},
        {x: 649, y: 201, width: 115, height: 21, type: "SPIKES"}
    ],
    enemies: [
        {x: 548, y: 150, width: 50, height: 40, type: "LION", patrolDistance: 100, speed: 1}
    ],
    puppy: {
        x: 611, 
        y: 165, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 32, y: 23, width: 30, height: 30}
    ]
},
        {
            name: "Klimmen en zwemmen",
            startPositions: [{x: 50, y: GROUND_LEVEL - 50}, {x: 100, y: GROUND_LEVEL - 50}],
            platforms: [
                {x: 200, y: 350, width: 100, height: 100, type: "CLIMB"},
                {x: 350, y: 300, width: 200, height: 40, type: "WATER"},
                {x: 600, y: 250, width: 150, height: 20, type: "NORMAL"},
                // Boom toevoegen die eekhoorn kan beklimmen
                {x: 500, y: GROUND_LEVEL - 180, width: 35, height: 180, type: "TREE"},
                // Wolkenpad voor de eenhoorn met meerdere wolken op verschillende hoogtes
                {x: 100, y: 200, width: 80, height: 30, type: "CLOUD"},
                {x: 220, y: 150, width: 90, height: 35, type: "CLOUD"},
                {x: 350, y: 120, width: 100, height: 40, type: "CLOUD"}
            ],
            traps: [
                {x: 400, y: GROUND_LEVEL - 20, width: 100, height: 20, type: "SPIKES"}
            ],
            enemies: [
                {x: 300, y: GROUND_LEVEL - 40, width: 50, height: 40, type: "LION", patrolDistance: 150, speed: 1.2},
                {x: 500, y: 150, width: 60, height: 50, type: "DRAGON", patrolDistance: 100, speed: 0.8}
            ],
            puppy: {
                x: 420, 
                y: GROUND_LEVEL - 25, 
                width: 30, 
                height: 25, 
                saved: false
            },
            collectibles: [
                {x: 650, y: 200, width: 30, height: 30},
                {x: 150, y: 150, width: 30, height: 30, type: "PEPPER"}
            ]
        },
        {
            name: "Samen naar de top",
            startPositions: [{x: 50, y: GROUND_LEVEL - 50}, {x: 100, y: GROUND_LEVEL - 50}],
            platforms: [
                {x: 150, y: 380, width: 100, height: 20, type: "NORMAL"},
                {x: 280, y: 330, width: 80, height: 20, type: "NORMAL"},
                {x: 400, y: 280, width: 100, height: 20, type: "NORMAL"},
                {x: 200, y: 230, width: 80, height: 20, type: "NORMAL"},
                {x: 350, y: 180, width: 80, height: 20, type: "NORMAL"},
                {x: 500, y: 180, width: 200, height: 20, type: "NORMAL"},
                {x: 320, y: GROUND_LEVEL - 40, width: 160, height: 40, type: "WATER"},
                {x: 500, y: 280, width: 30, height: 170, type: "TREE"},
                // Wolkenroute die de eenhoorn kan gebruiken om de hoogste collectible te bereiken
                {x: 60, y: 350, width: 70, height: 30, type: "CLOUD"},
                {x: 150, y: 290, width: 60, height: 25, type: "CLOUD"},
                {x: 240, y: 250, width: 60, height: 25, type: "CLOUD"},
                {x: 330, y: 120, width: 80, height: 35, type: "CLOUD"},
                {x: 450, y: 80, width: 100, height: 40, type: "CLOUD"},
                {x: 580, y: 100, width: 70, height: 30, type: "CLOUD"}
            ],
            traps: [
                {x: 200, y: GROUND_LEVEL - 20, width: 60, height: 20, type: "SPIKES"},
                {x: 450, y: 160, width: 30, height: 20, type: "SPIKES"}
            ],
            enemies: [
                {x: 300, y: GROUND_LEVEL - 40, width: 50, height: 40, type: "LION", patrolDistance: 200, speed: 1.5},
                {x: 350, y: 150, width: 60, height: 50, type: "DRAGON", patrolDistance: 150, speed: 1.2}
            ],
            puppy: {
                x: 550, 
                y: 160, 
                width: 30, 
                height: 25, 
                saved: false
            },
            collectibles: [
                {x: 650, y: 80, width: 30, height: 30}, // Verhoogd naar een positie die alleen bereikbaar is met wolken
                {x: 400, y: 250, width: 30, height: 30, type: "PEPPER"}
            ]
        },
        {
    name: "Kat in het nauw",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 414, y: 285, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 350, 
        y: 375, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 650, y: 150, width: 30, height: 30}
    ]
},
        {
    name: "Test level",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 519, y: 284, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 350, 
        y: 375, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 693, y: 230, width: 30, height: 30},
        {x: 486, y: 171, width: 30, height: 30},
        {x: 147, y: 178, width: 30, height: 30}
    ]
},
        {
    name: "Nieuw Level",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 505, y: 257, width: 100, height: 20, type: "NORMAL"}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 350, 
        y: 375, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 650, y: 150, width: 30, height: 30}
    ]
},
        {
    name: "Test level",
    startPositions: [
        {x: 50, y: 350},
        {x: 100, y: 350}
    ],
    platforms: [
        {x: 297, y: 283, width: 310, height: 20, type: "NORMAL"}
    ],
    traps: [

    ],
    enemies: [

    ],
    puppy: {
        x: 350, 
        y: 375, 
        width: 30, 
        height: 25, 
        saved: false
    },
    collectibles: [
        {x: 650, y: 150, width: 30, height: 30}
    ]
}
    ];
}