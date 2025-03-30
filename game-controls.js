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
            
            // Speciale actie keys
            switchPlayer1: keys['switchPlayer1'],
            switchPlayer2: keys['switchPlayer2'],
            digPlayer1: keys['digPlayer1'],
            digPlayer2: keys['digPlayer2'],
            
            // Belangrijke speciale toetsen
            space: keys[' '],
            g: keys['g'] || keys['G'],
            
            // Shift en Alt (voor dieren wisselen en graven)
            Shift: keys['Shift'],
            ShiftLeft: keys['ShiftLeft'],
            ShiftRight: keys['ShiftRight'],
            Alt: keys['Alt'],
            AltLeft: keys['AltLeft'],
            AltRight: keys['AltRight'],
            
            // Codes om te controleren of deze correct worden geregistreerd
            ShiftLeft_code: keys['ShiftLeft'],
            ShiftRight_code: keys['ShiftRight'],
            AltLeft_code: keys['AltLeft'],
            AltRight_code: keys['AltRight'],
            
            // Bewegingstoetsen
            ArrowLeft: keys['ArrowLeft'],
            ArrowRight: keys['ArrowRight'],
            ArrowUp: keys['ArrowUp'],
            ArrowDown: keys['ArrowDown'],
            w: keys['w'],
            a: keys['a'],
            s: keys['s'],
            d: keys['d']
        });
        
        // Extra debug info voor speciale toetsen
        if ((keys['AltLeft'] || keys['digPlayer1']) && window.gameCore.gameState.debugLevel >= 1) {
            console.log("🦔 Linker Alt-toets ingedrukt! Dit zou graven moeten activeren voor speler 1 als die een mol is.");
        }
        
        if ((keys['AltRight'] || keys['digPlayer2']) && window.gameCore.gameState.debugLevel >= 1) {
            console.log("🦔 Rechter Alt-toets ingedrukt! Dit zou graven moeten activeren voor speler 2 als die een mol is.");
        }
        
        if ((keys['ShiftLeft'] || keys['switchPlayer1']) && window.gameCore.gameState.debugLevel >= 1) {
            console.log("🔄 Linker Shift-toets ingedrukt! Dit zou dieren wisselen moeten activeren voor speler 1.");
        }
        
        if ((keys['ShiftRight'] || keys['switchPlayer2']) && window.gameCore.gameState.debugLevel >= 1) {
            console.log("🔄 Rechter Shift-toets ingedrukt! Dit zou dieren wisselen moeten activeren voor speler 2.");
        }
    }
}

// Vertaal toetsen naar acties
function getControlAction(key) {
    // Toetsen mappen naar acties (links, rechts, omhoog, omlaag, switch, dig)
    
    // Algemene besturing (WASD/pijltjestoetsen)
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        return 'left';
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        return 'right';
    } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        return 'up';
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        return 'down';
    } 
    
    // Specifieke besturing per speler
    // Gebruik de code eigenschap (niet key) omdat deze altijd onderscheid maakt tussen links/rechts
    else if (key === 'ShiftLeft') {
        return 'switchPlayer1'; // ALLEEN voor speler 1
    } else if (key === 'ShiftRight') {
        return 'switchPlayer2'; // ALLEEN voor speler 2
    } else if (key === 'AltLeft') {
        return 'digPlayer1'; // ALLEEN voor speler 1
    } else if (key === 'AltRight') {
        return 'digPlayer2'; // ALLEEN voor speler 2
    }
    return null;
}

// Input event listeners
function setupInputListeners() {
    window.addEventListener('keydown', function(e) {
        // Registreer de toets
        keys[e.key] = true;
        
        // Registreer ook de code (voor specifieke links/rechts onderscheid)
        keys[e.code] = true;
        
        // Voorkom dat Option/Alt toetsen browser gedrag triggeren (bijv. menu's)
        if (e.key === 'Alt' || e.key === 'AltLeft' || e.key === 'AltRight' || 
            e.code === 'AltLeft' || e.code === 'AltRight') {
            e.preventDefault();
        }
        
        // Voorkom dat Shift toetsen browser gedrag triggeren
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            e.preventDefault();
        }
        
        // Space key handling is done in the game loop
        
        // Voor WASD/pijltjes consistentie
        const action = getControlAction(e.key) || getControlAction(e.code);
        if (action) {
            // Registreer de actie
            keys[action] = true;
        }
        
        // Spatie om naar volgend level te gaan als level voltooid is
        // Deze check mag niet de normale spatiebalk functionaliteit blokkeren
        if (e.key === ' ') {
            if (gameCore.levelCompleted) {
                // Sla het voltooide level op in localStorage
                const completedLevel = gameCore.currentLevelIndex + 1;
                let completedLevels = [];
                
                // Haal bestaande voltooide levels op
                const savedLevels = localStorage.getItem('completedLevels');
                if (savedLevels) {
                    completedLevels = JSON.parse(savedLevels);
                }
                
                // Voeg het huidige level toe als het nog niet in de lijst staat
                if (!completedLevels.includes(completedLevel)) {
                    completedLevels.push(completedLevel);
                    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                }
                
                // Sla de totale score op
                localStorage.setItem('totalScore', gameCore.gameState.score.toString());
                
                // Sla het laatste gespeelde level op
                localStorage.setItem('lastPlayedLevel', completedLevel.toString());
                
                // Update de map als mapUtils beschikbaar is
                if (window.mapUtils && typeof window.mapUtils.markLevelCompleted === 'function') {
                    window.mapUtils.markLevelCompleted(completedLevel, gameCore.gameState.score);
                }
                
                // Ga naar de wereldkaart in plaats van het volgende level
                window.location.href = 'map.html';
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
        
        // Deactiveer ook de code
        keys[e.code] = false;
        
        // Voor WASD/pijltjes consistentie
        const action = getControlAction(e.key) || getControlAction(e.code);
        if (action) {
            // Zet de actie-toets op false
            keys[action] = false;

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
            }
        }
    });
}


// Definieer de controle mappings voor elke speler
const controls = {
    player1: { up: "w", down: "s", left: "a", right: "d", dig: "AltLeft", switch: "ShiftLeft" },
    player2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", dig: "AltRight", switch: "ShiftRight" }
};

// Exporteer de besturing
window.gameControls = {
    keys,
    setupInputListeners,
    getControlAction,
    debugKeyState,
    controls  // Voeg controls toe aan het geëxporteerde object
};