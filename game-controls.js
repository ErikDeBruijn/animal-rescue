// game-controls.js
// Bevat de besturing voor het spel

// Input state
const keys = {};

// Debug functie om de huidige toetsenstaat te tonen
// Wordt alleen uitgevoerd als debug mode aan staat
function debugKeyState() {
    // Check of debug level 1 of hoger is
    if (window.gameCore && window.gameCore.gameState && window.gameCore.gameState.debugLevel >= 1) {
        console.log("Huidige toetsenstaat:", {
            // Actie keys
            left: keys['left'],
            right: keys['right'],
            up: keys['up'],
            down: keys['down'],
            switch: keys['switch'],
            
            // Belangrijke speciale toetsen
            space: keys[' '],
            g: keys['g'] || keys['G'],
            Control: keys['Control'] || keys['ControlLeft'] || keys['ControlRight'],
            
            // Bewegingstoetsen
            ArrowLeft: keys['ArrowLeft'],
            ArrowRight: keys['ArrowRight'],
            ArrowUp: keys['ArrowUp'],
            ArrowDown: keys['ArrowDown'],
            w: keys['w'],
            a: keys['a'],
            s: keys['s'],
            d: keys['d'],
            f: keys['f'],
            Shift: keys['Shift']
        });
        
        // Extra debug info voor speciale toetsen
        if ((keys['g'] || keys['G']) && window.gameCore.gameState.debugLevel >= 1) {
            console.log("🦔 G-toets ingedrukt! Dit zou graven moeten activeren voor speler 1 als die een mol is.");
        }
        
        if ((keys['Control'] || keys['ControlLeft'] || keys['ControlRight']) && window.gameCore.gameState.debugLevel >= 1) {
            console.log("🦔 Control-toets ingedrukt! Dit zou graven moeten activeren voor speler 2 als die een mol is.");
        }
    }
}

// Vertaal toetsen naar acties
function getControlAction(key) {
    // Toetsen mappen naar acties (links, rechts, omhoog, omlaag)
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        return 'left';
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        return 'right';
    } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        return 'up';
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        return 'down';
    } else if (key === 'Shift' || key === 'ShiftLeft' || key === 'ShiftRight' || key === 'f' || key === 'F') {
        return 'switch';
    }
    return null;
}

// Input event listeners
function setupInputListeners() {
    window.addEventListener('keydown', function(e) {
        // Registreer de toets
        keys[e.key] = true;
        
        // Space key handling is done in the game loop
        
        // Voor WASD/pijltjes consistentie
        const action = getControlAction(e.key);
        if (action) {
            // Registreer de actie
            keys[action] = true;
            
        }
        
        // Spatie om naar volgend level te gaan als level voltooid is
        // Deze check mag niet de normale spatiebalk functionaliteit blokkeren
        if (e.key === ' ') {
            if (gameCore.levelCompleted) {
                window.gameCore.nextLevel();
            } else if (gameCore.gameState.gameOver) {
                // Reset het huidige level
                window.gameCore.resetCurrentLevel();
            } else {
                console.log("SPACE pressed for normal gameplay use");
            }
        }
    });
    
    window.addEventListener('keyup', function(e) {
        // Deactiveer de toets
        keys[e.key] = false;
        
        // Voor WASD/pijltjes consistentie
        const action = getControlAction(e.key);
        if (action) {

            // Controleer of er geen andere toetsen voor dezelfde actie ingedrukt zijn
            // (bijv. bij zowel 'ArrowLeft' als 'a' indrukken en dan één loslaten)
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (!keys['ArrowLeft'] && !keys['a'] && !keys['A']) {
                    keys['left'] = false;
                }
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (!keys['ArrowRight'] && !keys['d'] && !keys['D']) {
                    keys['right'] = false;
                }
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                if (!keys['ArrowUp'] && !keys['w'] && !keys['W']) {
                    keys['up'] = false;
                }
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                if (!keys['ArrowDown'] && !keys['s'] && !keys['S']) {
                    keys['down'] = false;
                }
            } else if (e.key === 'Shift' || e.key === 'ShiftLeft' || e.key === 'ShiftRight' || e.key === 'f' || e.key === 'F') {
                if (!keys['Shift'] && !keys['ShiftLeft'] && !keys['ShiftRight'] && !keys['f'] && !keys['F']) {
                    keys['switch'] = false;
                }
            }
        }
    });
}


// Definieer de controle mappings voor elke speler
const controls = {
    player1: { up: "w", down: "s", left: "a", right: "d" },
    player2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }
};

// Exporteer de besturing
window.gameControls = {
    keys,
    setupInputListeners,
    getControlAction,
    debugKeyState,
    controls  // Voeg controls toe aan het geëxporteerde object
};