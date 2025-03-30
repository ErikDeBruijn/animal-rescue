// game-controls.js
// Bevat de besturing voor het spel

// Input state
const keys = {};

// Gamepad state
let gamepads = {};
let gamepadConnected = false;
const gamepadDeadzone = 0.2; // Deadzone voor analoge sticks
let frameCount = 0; // Voor periodieke debug logging

// Gamepad mapping voor standaard controllers (Xbox/PlayStation-stijl)
const gamepadMapping = {
    player1: {
        // Standaard mapping
        buttons: {
            // A/X knop wordt gebruikt om te springen
            0: ['up', 'w', ' '], // A/X knop direct koppelen aan "up"/"w" en spatie voor springen
            // B/O knop voor kat klauwen en vuurspuwen (X)
            1: ['c', 'ControlLeft', ' ', 'x', 'X'], // B/O knop is voor kattenklauwen, vuurspuwen en spatie-functies
            // X/Square knop (graven)
            2: ['digPlayer1', 'AltLeft', 'x', 'X'], // Zowel de digPlayer1 actie als AltLeft (voor mol graven) en vuurspuwen
            // Y/Triangle knop (dieren wisselen)
            3: ['switchPlayer1', 'ShiftLeft'], // Zowel switchPlayer1 als ShiftLeft (voor dieren wisselen)
            // LB/L1 voor dieren wisselen
            4: ['switchPlayer1', 'ShiftLeft'],
            // RB/R1 voor graven/klauwen/vuurspuwen
            5: ['digPlayer1', 'AltLeft', 'c', 'ControlLeft', 'x', 'X'],
            // LT/L2 voor snel omlaag
            6: ['down', 's'],
            // RT/R2 voor springen
            7: ['up', 'w', ' ']
        },
        axes: {
            // Links/rechts op linker stick
            0: { negative: ['left', 'a'], positive: ['right', 'd'] },
            // Op/neer op linker stick
            1: { negative: ['up', 'w'], positive: ['down', 's'] }
        }
    },
    player2: {
        // Standaard mapping
        buttons: {
            // A/X knop wordt gebruikt om te springen
            0: ['up', 'ArrowUp'], // A/X knop direct koppelen aan "up"/"ArrowUp"
            // B/O knop voor kat klauwen (rechter Ctrl) en vuurspuwen (Z)
            1: ['ControlRight', 'z', 'Z'],
            // X/Square knop (graven)
            2: ['digPlayer2', 'AltRight', 'z', 'Z'], // Zowel de digPlayer2 actie als AltRight (voor mol graven) en vuurspuwen
            // Y/Triangle knop (dieren wisselen)
            3: ['switchPlayer2', 'ShiftRight'], // Zowel switchPlayer2 als ShiftRight (voor dieren wisselen)
            // LB/L1 voor dieren wisselen
            4: ['switchPlayer2', 'ShiftRight'],
            // RB/R1 voor graven/klauwen/vuurspuwen
            5: ['digPlayer2', 'AltRight', 'ControlRight', 'z', 'Z'],
            // LT/L2 voor snel omlaag
            6: ['down', 'ArrowDown'],
            // RT/R2 voor springen
            7: ['up', 'ArrowUp']
        },
        axes: {
            // D-pad op de meeste controllers
            0: { negative: ['left', 'ArrowLeft'], positive: ['right', 'ArrowRight'] },
            1: { negative: ['up', 'ArrowUp'], positive: ['down', 'ArrowDown'] }
        }
    }
};

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
            d: keys['d'],
            
            // Gamepad info
            gamepadConnected: gamepadConnected,
            gamepads: Object.keys(gamepads)
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

// Gamepad event listeners
function setupGamepadEventListeners() {
    // Event listeners voor gamepad connectie/disconnectie
    window.addEventListener('gamepadconnected', function(e) {
        console.log(`Gamepad verbonden: ${e.gamepad.id} op index ${e.gamepad.index}`);
        gamepads[e.gamepad.index] = e.gamepad;
        gamepadConnected = true;
        
        // Bepaal welke speler deze controller bestuurt
        const playerNum = e.gamepad.index === 0 ? 1 : (e.gamepad.index === 1 ? 2 : null);
        const playerMsg = playerNum ? ` (Speler ${playerNum})` : "";
        
        // Laat een kleine notificatie zien dat de controller is gedetecteerd
        if (window.gameCore && window.gameCore.gameState) {
            window.gameCore.gameState.message = `Gamecontroller ${e.gamepad.index} verbonden${playerMsg}: ${e.gamepad.id.split('(')[0]}`;
            setTimeout(() => {
                if (window.gameCore && window.gameCore.gameState && 
                    window.gameCore.gameState.message === `Gamecontroller ${e.gamepad.index} verbonden${playerMsg}: ${e.gamepad.id.split('(')[0]}`) {
                    window.gameCore.gameState.message = "";
                }
            }, 3000);
        }
    });

    window.addEventListener('gamepaddisconnected', function(e) {
        console.log(`Gamepad ontkoppeld: ${e.gamepad.id} op index ${e.gamepad.index}`);
        
        // Bepaal welke speler deze controller bestuurt
        const playerNum = e.gamepad.index === 0 ? 1 : (e.gamepad.index === 1 ? 2 : null);
        const playerMsg = playerNum ? ` (Speler ${playerNum})` : "";
        
        // Reset toetsen die mogelijk via de gamepad waren ingedrukt voordat we deze verwijderen
        resetGamepadKeys(e.gamepad.index);
        
        // Verwijder de gamepad uit onze lijst
        delete gamepads[e.gamepad.index];
        
        // Check of er nog andere gamepads verbonden zijn
        gamepadConnected = Object.keys(gamepads).length > 0;
        
        // Laat een kleine notificatie zien dat de controller is ontkoppeld
        if (window.gameCore && window.gameCore.gameState) {
            window.gameCore.gameState.message = `Gamecontroller ${e.gamepad.index}${playerMsg} ontkoppeld`;
            setTimeout(() => {
                if (window.gameCore && window.gameCore.gameState && 
                    window.gameCore.gameState.message === `Gamecontroller ${e.gamepad.index}${playerMsg} ontkoppeld`) {
                    window.gameCore.gameState.message = "";
                }
            }, 3000);
        }
    });
}

// Reset alle toetsen die door een specifieke gamepad waren ingedrukt
function resetGamepadKeys(gamepadIndex) {
    // BELANGRIJK: Elke gamepad bestuurt slechts 1 speler
    // Bepaal welke speler bij deze gamepad hoort (gamepad 0 = player1, gamepad 1 = player2)
    const playerNum = gamepadIndex === 0 ? 1 : (gamepadIndex === 1 ? 2 : null);
    
    // Log reset actie
    if (gameCore && gameCore.gameState && gameCore.gameState.debugLevel >= 1) {
        console.log(`Resetting gamepad keys for controller ${gamepadIndex} (player ${playerNum})`);
    }
    
    // Als deze gamepad aan geen speler is toegewezen, doe niets
    if (playerNum === null) return;
    
    // Reset alleen de toetsen voor de specifieke speler die aan deze gamepad is gekoppeld
    if (playerNum === 1) {
        // Voor speler 1, reset alleen WASD en andere speler 1 specifieke toetsen
        keys['a'] = keys['d'] = keys['w'] = keys['s'] = false;
        keys['left'] = keys['right'] = keys['up'] = keys['down'] = false; // Reset shared directional actions too
        keys['switchPlayer1'] = keys['digPlayer1'] = false;
        keys['ShiftLeft'] = keys['AltLeft'] = false;
        keys['c'] = keys['C'] = keys['ControlLeft'] = false; // Kattenklauwen
        keys['x'] = keys['X'] = false; // Vuurspuwen
        
        // Reset de toetsen waarnaar de gamepad ook verwijst volgens controls.player1
        if (controls && controls.player1) {
            const p1Controls = controls.player1;
            Object.values(p1Controls).forEach(key => {
                keys[key] = false;
            });
        }
        
        // Reset spatiebalk alleen als dit de eerste controller is
        // (omdat spatiebalk algemene functionaliteit is die door speler 1 wordt bediend)
        if (gamepadIndex === 0) {
            keys[' '] = false;
        }
    } else if (playerNum === 2) {
        // Voor speler 2, reset alleen pijltjestoetsen en andere speler 2 specifieke toetsen
        keys['ArrowLeft'] = keys['ArrowRight'] = keys['ArrowUp'] = keys['ArrowDown'] = false;
        keys['left'] = keys['right'] = keys['up'] = keys['down'] = false; // Reset shared directional actions too
        keys['switchPlayer2'] = keys['digPlayer2'] = false;
        keys['ShiftRight'] = keys['AltRight'] = false;
        keys['ControlRight'] = false; // Kattenklauwen
        keys['z'] = keys['Z'] = false; // Vuurspuwen
        
        // Reset de toetsen waarnaar de gamepad ook verwijst volgens controls.player2
        if (controls && controls.player2) {
            const p2Controls = controls.player2;
            Object.values(p2Controls).forEach(key => {
                keys[key] = false;
            });
        }
    }
}

// Update gamepad status
function updateGamepads() {
    // Navigator.getGamepads() kan null-waarden bevatten voor niet-verbonden controllers
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    
    // Increment frame counter voor debug logging
    frameCount++;
    
    // Update gamepadConnected flag op basis van het actuele aantal controllers
    gamepadConnected = Object.keys(gamepads).length > 0;
    
    if (!gps || gps.length === 0) return;
    
    // Debug logging voor gamepad status
    const showDebug = gameCore && gameCore.gameState && gameCore.gameState.debugLevel >= 1;
    
    if (showDebug && frameCount % 60 === 0) { // Log alleen elke 60 frames (ongeveer 1x per seconde)
        console.log("Active gamepads:", Object.keys(gamepads).length);
        
        // Toon actieve gamepad informatie
        if (gameCore.gameState.debugLevel >= 2) {
            for (let i = 0; i < gps.length; i++) {
                const gp = gps[i];
                if (!gp) continue;
                
                // Overzicht van actieve knoppen
                let activeButtons = [];
                for (let j = 0; j < gp.buttons.length; j++) {
                    if (gp.buttons[j] && gp.buttons[j].pressed) {
                        activeButtons.push(j);
                    }
                }
                
                // Overzicht van analoge stick waardes
                let axesValues = [];
                for (let j = 0; j < gp.axes.length; j++) {
                    if (Math.abs(gp.axes[j]) > gamepadDeadzone) {
                        axesValues.push(`${j}:${gp.axes[j].toFixed(2)}`);
                    }
                }
                
                console.log(`Gamepad ${i} (${gp.id}): Buttons [${activeButtons.join(',')}], Axes [${axesValues.join(',')}]`);
            }
            
            // Overzicht van belangrijke game-toetsen
            console.log("Important game keys:", {
                up: keys['up'], 
                down: keys['down'], 
                left: keys['left'], 
                right: keys['right'],
                space: keys[' '],
                w: keys['w'],
                a: keys['a'],
                s: keys['s'],
                d: keys['d'],
                ArrowUp: keys['ArrowUp'],
                ArrowDown: keys['ArrowDown'],
                ArrowLeft: keys['ArrowLeft'],
                ArrowRight: keys['ArrowRight']
            });
        }
    }
    
    // Verwerk elke verbonden gamepad
    for (let i = 0; i < gps.length; i++) {
        const gp = gps[i];
        
        // Controleer of gamepad echt verbonden is (soms blijven gamepads "hangen" in de navigator.getGamepads() array)
        if (!gp || !gp.connected) {
            // Als deze gamepad als verbonden werd beschouwd maar nu niet meer verbonden is,
            // zorg dat we de keys resetten en deze uit de verbonden gamepads verwijderen
            if (gamepads[i]) {
                console.log(`Gamepad ${i} disconnected: no longer active`);
                resetGamepadKeys(i);
                delete gamepads[i];
            }
            continue;
        }
        
        // Update onze lokale kopie
        gamepads[gp.index] = gp;
        
        // BELANGRIJK: Elke gamepad bestuurt maar één speler
        // Gamepad 0 (eerste controller) = speler 1
        // Gamepad 1 (tweede controller) = speler 2
        // Andere gamepads worden genegeerd
        
        // Bepaal welke speler deze gamepad bestuurt op basis van gamepad index
        const playerMapping = gp.index === 0 ? gamepadMapping.player1 : 
                             gp.index === 1 ? gamepadMapping.player2 : null;
        
        if (!playerMapping) continue;
        
        // Verwerk knoppen
        for (let j = 0; j < gp.buttons.length; j++) {
            const button = gp.buttons[j];
            const buttonActions = playerMapping.buttons[j];
            
            // Als deze knop een actie heeft toegewezen
            if (buttonActions) {
                if (Array.isArray(buttonActions)) {
                    // Als er meerdere acties zijn toegewezen, activeer ze allemaal
                    buttonActions.forEach(action => {
                        keys[action] = button.pressed;
                    });
                } else {
                    // Enkele actie
                    keys[buttonActions] = button.pressed;
                }
            }
        }
        
        // Verwerk assen (joysticks)
        for (let j = 0; j < gp.axes.length && j < 4; j++) {
            const axisValue = gp.axes[j];
            const axisMapping = playerMapping.axes[j];
            
            if (axisMapping) {
                const negativeActions = Array.isArray(axisMapping.negative) ? 
                                      axisMapping.negative : [axisMapping.negative];
                const positiveActions = Array.isArray(axisMapping.positive) ? 
                                      axisMapping.positive : [axisMapping.positive];
                
                // Negatieve waarde (links/omhoog)
                if (axisValue < -gamepadDeadzone) {
                    // Activeer alle negatieve acties
                    negativeActions.forEach(action => {
                        keys[action] = true;
                    });
                    // Deactiveer alle positieve acties
                    positiveActions.forEach(action => {
                        keys[action] = false;
                    });
                } 
                // Positieve waarde (rechts/omlaag)
                else if (axisValue > gamepadDeadzone) {
                    // Deactiveer alle negatieve acties
                    negativeActions.forEach(action => {
                        keys[action] = false;
                    });
                    // Activeer alle positieve acties
                    positiveActions.forEach(action => {
                        keys[action] = true;
                    });
                } 
                // Neutrale waarde (geen input)
                else {
                    // Deactiveer beide richtingen
                    negativeActions.forEach(action => {
                        keys[action] = false;
                    });
                    positiveActions.forEach(action => {
                        keys[action] = false;
                    });
                }
            }
        }
        
        // D-pad verwerking (meestal axes 6-7 of buttons 12-15)
        // Verschillende controllers hebben D-pad op verschillende plaatsen
        // We checken zowel knoppen als assen
        
        // Check voor D-pad als knoppen (meest voorkomend op moderne controllers)
        // Standaard indices: 12=boven, 13=beneden, 14=links, 15=rechts
        if (gp.buttons.length >= 16) {
            // Bepaal welke toetsen we moeten activeren voor deze speler
            const upKeys = i === 0 ? ['up', 'w'] : ['up', 'ArrowUp'];
            const downKeys = i === 0 ? ['down', 's'] : ['down', 'ArrowDown'];
            const leftKeys = i === 0 ? ['left', 'a'] : ['left', 'ArrowLeft'];
            const rightKeys = i === 0 ? ['right', 'd'] : ['right', 'ArrowRight'];
            
            // D-pad boven (meestal knop 12)
            if (gp.buttons[12] && gp.buttons[12].pressed) {
                upKeys.forEach(key => keys[key] = true);
            } else {
                // Reset alleen als de analoge stick niet ook gebruikt wordt
                const upAxisActive = gp.axes[1] && gp.axes[1] < -gamepadDeadzone;
                if (!upAxisActive) {
                    upKeys.forEach(key => keys[key] = false);
                }
            }
            
            // D-pad beneden (meestal knop 13)
            if (gp.buttons[13] && gp.buttons[13].pressed) {
                downKeys.forEach(key => keys[key] = true);
            } else {
                // Reset alleen als de analoge stick niet ook gebruikt wordt
                const downAxisActive = gp.axes[1] && gp.axes[1] > gamepadDeadzone;
                if (!downAxisActive) {
                    downKeys.forEach(key => keys[key] = false);
                }
            }
            
            // D-pad links (meestal knop 14)
            if (gp.buttons[14] && gp.buttons[14].pressed) {
                leftKeys.forEach(key => keys[key] = true);
            } else {
                // Reset alleen als de analoge stick niet ook gebruikt wordt
                const leftAxisActive = gp.axes[0] && gp.axes[0] < -gamepadDeadzone;
                if (!leftAxisActive) {
                    leftKeys.forEach(key => keys[key] = false);
                }
            }
            
            // D-pad rechts (meestal knop 15)
            if (gp.buttons[15] && gp.buttons[15].pressed) {
                rightKeys.forEach(key => keys[key] = true);
            } else {
                // Reset alleen als de analoge stick niet ook gebruikt wordt
                const rightAxisActive = gp.axes[0] && gp.axes[0] > gamepadDeadzone;
                if (!rightAxisActive) {
                    rightKeys.forEach(key => keys[key] = false);
                }
            }
        }
    }
}

// Input event listeners
function setupInputListeners() {
    // Keyboard event listeners
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
    
    // Gamepad event listeners
    setupGamepadEventListeners();
}


// Definieer de controle mappings voor elke speler
const controls = {
    player1: { up: "w", down: "s", left: "a", right: "d", dig: "AltLeft", switch: "ShiftLeft" },
    player2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", dig: "AltRight", switch: "ShiftRight" }
};

// Helper functie om te controleren of een gamepad A-knop wordt ingedrukt (voor spatie-functionaliteit)
function isGamepadSpacePressed() {
    if (!gamepadConnected) return false;
    
    // Haal gamepads op
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    
    // Standaard: ALLEEN controller 0 (de eerste) kan spatiebalk triggeren
    // Dit zorgt ervoor dat menu's, level-overgangen etc. alleen door player 1 worden bediend
    const gp = gps[0]; // Gebruik alleen de eerste controller
    
    if (gp) {
        // A/X knop is meestal index 0
        if (gp.buttons[0] && gp.buttons[0].pressed) {
            // Als debug level ingesteld is, toon dit
            if (gameCore && gameCore.gameState && gameCore.gameState.debugLevel >= 1) {
                console.log("Gamepad 0 (Player 1) A-knop ingedrukt - voor spatie/springen");
            }
            return true;
        }
        
        // Andere knoppen die als spatiebalk gebruiken kunnen worden
        // RT (trigger rechts) is knop 7
        if (gp.buttons[7] && gp.buttons[7].pressed) {
            if (gameCore && gameCore.gameState && gameCore.gameState.debugLevel >= 1) {
                console.log("Gamepad 0 (Player 1) RT-trigger ingedrukt - voor spatie/springen");
            }
            return true;
        }
        
        // B-knop (index 1)
        if (gp.buttons[1] && gp.buttons[1].pressed) {
            if (gameCore && gameCore.gameState && gameCore.gameState.debugLevel >= 1) {
                console.log("Gamepad 0 (Player 1) B-knop ingedrukt - voor spatie/springen");
            }
            return true;
        }
    }
    
    return false;
}

// Exporteer de besturing
window.gameControls = {
    keys,
    setupInputListeners,
    getControlAction,
    debugKeyState,
    controls,  // Voeg controls toe aan het geëxporteerde object
    updateGamepads, // Voeg de gamepad update functie toe
    isGamepadSpacePressed, // Helper functie voor spatie-equivalent van gamepad
    gamepads, // Geef toegang tot de gamepad state
    gamepadConnected, // Status of er een gamepad verbonden is
    frameCount // Gedeelde frameCount variabele voor debugging
};