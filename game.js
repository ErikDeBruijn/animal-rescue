// Dieren Redders - Een samenwerkingsspel met dieren
// Gemaakt voor een ouder en kind om samen te spelen

// Canvas en context worden in gameCore gezet

// Spelconstanten en state laden
document.addEventListener('DOMContentLoaded', function() {
    // Controleer eerst of alle benodigde objecten beschikbaar zijn
    initializeGameWhenReady();
});

// Functie die controleert of alle benodigde game componenten geladen zijn
function initializeGameWhenReady() {
    if (!window.gameEntities || !window.gameCore || !window.gameControls || !window.gameRendering || !window.gameCharacters) {
        // Als nog niet alle componenten geladen zijn, wacht dan 100ms en probeer opnieuw
        // Geen console.log meer om spamming te voorkomen
        setTimeout(initializeGameWhenReady, 100);
        return;
    }
    
    // Nu alle componenten geladen zijn, initialiseer het spel
    console.log("Alle game componenten zijn geladen, initialiseren...");
    
    // Canvas referenties koppelen aan gameCore
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    gameCore.canvas = canvas;
    gameCore.ctx = ctx;
    gameCore.GROUND_LEVEL = canvas.height - 50;
    
    // Zorg dat de gamestate altijd aanwezig is
    if (!gameCore.gameState) {
        gameCore.gameState = {
            running: true,
            gameOver: false,
            puppySaved: false,
            message: ""
        };
    }
    
    // Levels inladen
    window.levels = getLevels(gameCore.GROUND_LEVEL);
    
    // Maak loadLevel globaal beschikbaar
    window.loadLevel = loadLevel;
    
    // Level functions instellen
    gameCore.nextLevel = nextLevel;
    gameCore.resetCurrentLevel = resetCurrentLevel;
    
    // Dispatch een event dat levels geladen zijn
    window.dispatchEvent(new Event('levelsLoaded'));
    
    // Besturing opzetten
    gameControls.setupInputListeners();
    
    // Initialiseer het spel
    init();
}

// Initialiseer het spel
function init() {
    // Bepaal het startlevel
    window.currentLevel = gameCore.getStartLevel();
    loadLevel(window.currentLevel);

    // Zorg dat de canvasgrootte goed is
    // Dit wordt hier gedaan omdat we nu de level info hebben
    resizeGameArea();
    
    // Start de game loop
    gameLoop();
    
    // Toon beschikbare dieren in UI
    updateAvailableAnimalsUI();
}

// Update het scherm formaat
function resizeGameArea() {
    // Dit kan later gebruikt worden voor responsive spel weergave
}

// Laad een level
function loadLevel(levelIndex) {
    // Stel het huidige level in
    gameCore.currentLevel = levelIndex;
    
    // Reset level voltooide status
    gameCore.levelCompleted = false;
    gameCore.gameState.puppySaved = false;
    gameCore.gameState.message = "";
    gameCore.gameState.gameOver = false;
    
    // We behouden de score tussen levels, dus reset niet tenzij de URL expliciet veranderd is
    // (bijvoorbeeld als de gebruiker een nieuw spel start)

    // Update de URL met het huidige level voor delen en refreshen
    window.location.hash = `level=${levelIndex}`;
    
    // Update de editor link
    gameCore.updateEditorLink();

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

    // Controleer of gameControls.controls bestaat
    if (!gameControls.controls) {
        console.error("gameControls.controls is undefined! Definieer dit in game-controls.js");
        // Definieer een standaard controls object om errors te voorkomen
        gameControls.controls = {
            player1: { up: "w", down: "s", left: "a", right: "d" },
            player2: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }
        };
    }
    
    // Maak spelers aan met hun controls en begindiertypes
    // Bij één diersoort is er maar 1 speler
    
    // Extra check voor player1 controls
    if (!gameControls.controls.player1) {
        console.error("gameControls.controls.player1 is undefined!");
        gameControls.controls.player1 = { up: "w", down: "s", left: "a", right: "d" };
    }
    
    window.player1 = new gameEntities.Player(
        startPositions[0].x, startPositions[0].y, 
        gameControls.controls.player1, "Speler 1", player1Animal
    );
    
    // Als er meer dan 1 diersoort beschikbaar is, maak speler 2 aan
    if (allowedAnimals.length > 1) {
        // Nog een extra check voor het geval gameControls.controls.player2 niet bestaat
        if (!gameControls.controls.player2) {
            console.error("gameControls.controls.player2 is undefined!");
            gameControls.controls.player2 = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
        }
        
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

    // De globale speler variabelen zijn nu al ingesteld bij het aanmaken hierboven
    // (window.player1 en window.player2)

    // Reset levens en andere statussen voor beide spelers
    window.player1.resetLives();
    window.player2.resetLives();
    
    // Toon het level en speler info
    const levelElement = document.getElementById('current-level');
    if (levelElement) {
        levelElement.textContent = `Level ${levelIndex + 1}: ${level.name}`;
    } else {
        console.warn("Element met ID 'current-level' niet gevonden in de DOM.");
    }
    showPlayerInfo();
    
    // Update beschikbare dieren UI
    updateAvailableAnimalsUI();
}

// Toon de spelerinfo
function showPlayerInfo() {
    const player1Info = document.getElementById('player1-animal');
    const player2Info = document.getElementById('player2-animal');
    
    // Zorg ervoor dat we de speler UI functies alleen aanroepen als de spelers bestaan
    if (window.player1) {
        window.player1.updatePlayerInfoUI();
    }
    
    if (window.player2) {
        window.player2.updatePlayerInfoUI();
    }

    // Maak de infovakjes zichtbaar als ze nog verborgen zijn
    const playerInfoContainer = document.querySelector('.player-info');
    if (playerInfoContainer) {
        playerInfoContainer.style.display = 'flex';
    } else {
        console.warn("Element met class 'player-info' niet gevonden in de DOM.");
    }
    
    // Update de score weergave
    updateScoreDisplay();
}

// Update de score weergave in de UI
function updateScoreDisplay() {
    const scoreElement = document.getElementById('game-score');
    if (scoreElement) {
        scoreElement.textContent = `Score: ${gameCore.gameState.score}`;
    }
}

// Maak updateScoreDisplay globaal beschikbaar zodat andere modules het kunnen gebruiken
window.updateScoreDisplay = updateScoreDisplay;

// Update UI om de beschikbare dieren voor het huidige level te tonen
function updateAvailableAnimalsUI() {
    const currentLevelData = window.levels[gameCore.currentLevel];
    const allowedAnimals = currentLevelData.allowedAnimals || ["SQUIRREL", "TURTLE", "UNICORN"];
    
    // Update player info first
    const player2Info = document.getElementById('player2-info');
    if (player2Info) {
        // Toon of verberg speler 2 informatie gebaseerd op aantal toegestane dieren
        if (allowedAnimals.length > 1) {
            player2Info.style.display = 'block';
        } else {
            player2Info.style.display = 'none';
        }
    }
    
    // Maak container voor beschikbare dieren als deze nog niet bestaat
    let animalsContainer = document.getElementById('available-animals');
    if (!animalsContainer) {
        animalsContainer = document.createElement('div');
        animalsContainer.id = 'available-animals';
        animalsContainer.classList.add('available-animals');
        
        const playerInfoContainer = document.querySelector('.player-info');
        if (playerInfoContainer) {
            playerInfoContainer.appendChild(animalsContainer);
        } else {
            console.warn("Element met class 'player-info' niet gevonden in de DOM. Kan beschikbare dieren UI niet toevoegen.");
            return; // Stop de functie als we de container niet kunnen vinden
        }
        
        // Voeg titel toe
        const title = document.createElement('div');
        title.classList.add('animals-title');
        title.textContent = 'Beschikbare dieren:';
        animalsContainer.appendChild(title);
    } else {
        // Leeg de container
        while (animalsContainer.lastChild) {
            animalsContainer.removeChild(animalsContainer.lastChild);
        }
        
        // Voeg titel toe
        const title = document.createElement('div');
        title.classList.add('animals-title');
        title.textContent = 'Beschikbare dieren:';
        animalsContainer.appendChild(title);
    }
    
    // Voeg elk toegestaan dier toe met emoji en naam
    allowedAnimals.forEach(animalType => {
        const animal = gameCore.animalTypes[animalType];
        const animalElement = document.createElement('div');
        animalElement.classList.add('animal-icon');
        
        // Kies emoji op basis van diertype
        let animalEmoji;
        switch(animalType) {
            case "SQUIRREL": animalEmoji = "🐿️"; break;
            case "TURTLE": animalEmoji = "🐢"; break;
            case "UNICORN": animalEmoji = "🦄"; break;
            case "CAT": animalEmoji = "🐱"; break;
        }
        
        animalElement.textContent = `${animalEmoji} ${animal.name}`;
        animalsContainer.appendChild(animalElement);
    });
    
    // Voeg instructietekst toe voor speler-modus
    const modeText = document.createElement('div');
    modeText.classList.add('game-mode-info');
    
    if (allowedAnimals.length > 1) {
        modeText.textContent = "Modus: 2 spelers (verschillende dieren)";
    } else {
        modeText.textContent = "Modus: 1 speler (1 dier beschikbaar)";
    }
    
    animalsContainer.appendChild(modeText);
}

// Naar volgend level gaan
function nextLevel() {
    gameCore.currentLevel++;
    if (gameCore.currentLevel >= window.levels.length) {
        gameCore.currentLevel = 0; // Terug naar eerste level of eindscherm tonen
    }
    
    // Laad het volgende level
    loadLevel(gameCore.currentLevel);
}

// Reset het huidige level (na game over door puppy verlies)
function resetCurrentLevel() {
    // Reset spelers
    window.player1.resetToStart();
    window.player2.resetToStart();
    
    // Reset puppy
    const currentLevelData = levels[gameCore.currentLevel];
    if (currentLevelData.puppy) {
        currentLevelData.puppy.saved = false;
    }
    
    // Reset game state
    gameCore.gameState.puppySaved = false;
    gameCore.gameState.gameOver = false;
    gameCore.gameState.message = "";
    
    // Reset vijanden naar hun startposities
    if (currentLevelData.enemies) {
        currentLevelData.enemies.forEach(enemy => {
            if (enemy.startX !== undefined) {
                enemy.x = enemy.startX;
                enemy.direction = 1;
            }
        });
    }
}

// Houd frame telling bij voor debug doeleinden
let frameCount = 0;

// Game loop
function gameLoop() {
    if (gameCore.gameState.running) {
        // Canvas leegmaken
        gameCore.ctx.clearRect(0, 0, gameCore.canvas.width, gameCore.canvas.height);
        
        // Achtergrond tekenen
        gameRendering.drawBackground();
        
        // Level objecten tekenen
        const currentLevelData = levels[gameCore.currentLevel];
        
        // Update de puppy en vijanden
        gameEntities.updatePuppy();
        gameEntities.updateEnemies([window.player1, window.player2]); // Geef spelers mee aan updateEnemies
        
        // Platforms tekenen
        currentLevelData.platforms.forEach(platform => {
            gameRendering.drawPlatform(platform);
        });
        
        // Valstrikken tekenen
        currentLevelData.traps.forEach(trap => {
            gameRendering.drawTrap(trap);
        });
        
        // Vijanden tekenen
        if (typeof gameCharacters !== 'undefined' && typeof gameCharacters.drawEnemies === 'function') {
            gameCharacters.drawEnemies();
        }
        
        // Puppy tekenen
        if (currentLevelData.puppy) {
            if (typeof gameCharacters !== 'undefined' && typeof gameCharacters.drawPuppy === 'function') {
                gameCharacters.drawPuppy(currentLevelData.puppy);
            }
        }
        
        // Collectibles tekenen
        currentLevelData.collectibles.forEach(collectible => {
            gameRendering.drawCollectible(collectible);
        });
        
        // Grond tekenen
        gameRendering.drawGround();
        
        // Debug toetsenstaat periodiek
        if (frameCount % 30 === 0) {
            if (window.gameControls && gameControls.debugKeyState) {
                gameControls.debugKeyState();
            }
        }
        
        // Spelers worden lokaal bestuurd
        window.player1.update(window.player2, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        
        // Bij meer dan 1 diersoort wordt ook speler 2 bestuurd en gerenderd
        if (currentLevelData.allowedAnimals && currentLevelData.allowedAnimals.length > 1) {
            window.player2.update(window.player1, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
            // Teken speler 2
            if (typeof gameCharacters !== 'undefined' && typeof gameCharacters.drawPlayer === 'function') {
                gameCharacters.drawPlayer(window.player2);
            }
        }
        
        // Teken speler 1 (altijd)
        if (typeof gameCharacters !== 'undefined' && typeof gameCharacters.drawPlayer === 'function') {
            gameCharacters.drawPlayer(window.player1);
        }
        
        // Game berichten
        if (gameCore.gameState.message) {
            gameCore.ctx.font = '20px Comic Sans MS';
            gameCore.ctx.fillStyle = 'black';
            gameCore.ctx.textAlign = 'center';
            gameCore.ctx.fillText(gameCore.gameState.message, gameCore.canvas.width/2, 100);
        }
        
        // Teken puntenpopups als die er zijn
        if (typeof gameRendering !== 'undefined' && typeof gameRendering.drawPointsPopups === 'function') {
            gameRendering.drawPointsPopups();
        }
        
        // Level naam (gebruiksvriendelijke 1-based nummering)
        gameCore.ctx.font = '16px Comic Sans MS';
        gameCore.ctx.fillStyle = 'black';
        gameCore.ctx.textAlign = 'left';
        gameCore.ctx.fillText("Level " + (gameCore.currentLevel + 1) + ": " + currentLevelData.name, 10, 20);
    }
    
    // Incrementeer frame telling voor debug doeleinden
    frameCount++;
    
    // Debug indicator als debug mode is ingeschakeld
    if (gameCore.gameState.debugLevel >= 1) {
        gameCore.ctx.font = '14px Courier New';
        gameCore.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        gameCore.ctx.textAlign = 'right';
        gameCore.ctx.fillText("DEBUG MODE " + gameCore.gameState.debugLevel, gameCore.canvas.width - 10, 20);
        
        // Voeg melding toe over hoe keys worden gelezen
        if (frameCount % 300 === 0) { // Elke 5 seconden (bij 60fps)
            console.log("Debug mode actief (niveau " + gameCore.gameState.debugLevel + "). Activeer graven met G (speler 1) of Control (speler 2)");
        }
    }
    
    requestAnimationFrame(gameLoop);
}