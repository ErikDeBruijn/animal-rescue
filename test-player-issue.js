// Test script voor het reproduceren van de TypeError
// Dit simuleert de basis game initialisatie

// Mock game componenten
window = {};
gameCore = {
    currentLevel: 0,
    getStartLevel: () => 0,
    GROUND_LEVEL: 500,
    GRAVITY: 0.5,
    MAX_FALL_SPEED: 10,
    gameState: {
        running: true,
        gameOver: false,
        puppySaved: false,
        message: ""
    },
    updateEditorLink: () => {},
    animalTypes: {
        "SQUIRREL": { name: "Eekhoorn", width: 30, height: 30, jumpPower: -15, speed: 5, color: "brown" },
        "TURTLE": { name: "Schildpad", width: 30, height: 30, jumpPower: -10, speed: 3, color: "green" },
        "UNICORN": { name: "Eenhoorn", width: 30, height: 30, jumpPower: -12, speed: 4, color: "pink" }
    }
};

gameControls = {
    setupInputListeners: () => {},
    controls: {
        player1: { up: "w", down: "s", left: "a", right: "d" },
        player2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }
    },
    keys: {}
};

gameEntities = {
    Player: class Player {
        constructor(x, y, controls, name, defaultAnimal) {
            this.x = x;
            this.y = y;
            this.controls = controls;
            this.name = name;
            this.animalType = defaultAnimal;
            this.width = 30;
            this.height = 30;
        }
        resetLives() {}
        updatePlayerInfoUI() {}
        resetToStart() {}
    }
};

gameRendering = {
    drawBackground: () => {},
    drawPlatform: () => {},
    drawTrap: () => {},
    drawEnemies: () => {},
    drawPuppy: () => {},
    drawCollectible: () => {},
    drawGround: () => {},
    drawPlayer: () => {}
};

// Mock document functions
document = {
    getElementById: () => ({
        textContent: '',
        style: { display: 'block' }
    }),
    querySelector: () => ({
        appendChild: () => {},
        style: { display: 'block' }
    }),
    createElement: () => ({
        id: '',
        classList: { add: () => {} },
        appendChild: () => {},
        textContent: ''
    })
};

// Mock level data
window.levels = [
    {
        name: "Test Level",
        startPositions: [
            { x: 100, y: 100 },
            { x: 200, y: 100 }
        ],
        platforms: [],
        traps: [],
        enemies: [],
        collectibles: [],
        puppy: null
    }
];

// Simuleer loadLevel functie - gebaseerd op de game.js code
function loadLevel(levelIndex) {
    // Stel het huidige level in
    gameCore.currentLevel = levelIndex;
    
    // Reset level voltooide status
    gameCore.levelCompleted = false;
    gameCore.gameState.puppySaved = false;
    gameCore.gameState.message = "";
    gameCore.gameState.gameOver = false;

    // Haal level data op
    const level = window.levels[levelIndex];
    const startPositions = level.startPositions;
    const allowedAnimals = level.allowedAnimals || ["SQUIRREL", "TURTLE", "UNICORN"];

    // Bepaal de dieren voor de spelers
    let player1Animal, player2Animal;
    
    // Kies het eerste beschikbare dier voor speler 1
    player1Animal = allowedAnimals[0];
    
    // Kies een ander dier voor speler 2 indien mogelijk
    if (allowedAnimals.length > 1) {
        player2Animal = allowedAnimals[1];
    } else {
        // Als er maar één diersoort beschikbaar is, krijgen beide spelers hetzelfde dier
        player2Animal = allowedAnimals[0];
    }

    // Maak spelers aan met hun controls en begindiertypes
    // Bij één diersoort is er maar 1 speler
    window.player1 = new gameEntities.Player(
        startPositions[0].x, startPositions[0].y, 
        gameControls.controls.player1, "Speler 1", player1Animal
    );
    
    // Als er meer dan 1 diersoort beschikbaar is, maak speler 2 aan
    if (allowedAnimals.length > 1) {
        window.player2 = new gameEntities.Player(
            startPositions[1].x, startPositions[1].y,
            gameControls.controls.player2, "Speler 2", player2Animal
        );
    } else {
        // Anders maken we een dummy speler die niet zichtbaar wordt gerenderd
        window.player2 = {
            x: -100, y: -100, // Buiten het scherm
            width: 0, height: 0,
            update: function() {}, // Lege update functie
            resetLives: function() {},
            updatePlayerInfoUI: function() {},
            resetToStart: function() {},
            collidesWithObject: function() { return false; }
        };
    }

    // Reset levens en andere statussen voor beide spelers
    window.player1.resetLives();
    window.player2.resetLives();
    
    // Simuleer game loop functies
    console.log("Player 1:", window.player1);
    console.log("Player 2:", window.player2);
    
    // Test gameLoop met verwijzingen naar player1 en player2
    try {
        testGameLoop();
    } catch (e) {
        console.error("Error in gameLoop:", e);
    }
}

// Een vereenvoudigde gameLoop om het probleem te testen
function testGameLoop() {
    // Test eerst met direct reference (veroorzaakt fout)
    try {
        console.log("Testing direct references (should fail):");
        player1.x += 5; // Dit zou de TypeError moeten veroorzaken
        player2.y += 5;
    } catch (e) {
        console.error("Error with direct references:", e.message);
    }
    
    // Test nu met window. reference (moet werken)
    try {
        console.log("Testing window.player references (should work):");
        window.player1.x += 5;
        window.player2.y += 5;
        console.log("Success! Updated positions - Player1 x:", window.player1.x, "Player2 y:", window.player2.y);
    } catch (e) {
        console.error("Error with window.player references:", e.message);
    }
    
    // Test gameEntities.updateEnemies functie met window.player1 en window.player2
    try {
        console.log("Testing updateEnemies with window.player references:");
        gameEntities.updateEnemies = function(players) {
            console.log("Called updateEnemies with:", players);
            if (players && players.length >= 2) {
                if (players[0] && players[0].x !== undefined) console.log("Player1 is valid");
                if (players[1] && players[1].y !== undefined) console.log("Player2 is valid");
            }
        };
        
        // Dit zou moeten werken als alle references correct zijn in game.js
        gameEntities.updateEnemies([window.player1, window.player2]);
        console.log("Success! updateEnemies executed properly");
    } catch (e) {
        console.error("Error with updateEnemies test:", e.message);
    }
}

// Start de test
console.log("Start test...");
try {
    loadLevel(0);
} catch (e) {
    console.error("Error in loadLevel:", e);
}