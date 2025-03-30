// Huisdieren Redders - Een samenwerkingsspel met dieren
// Gemaakt voor een ouder en kind om samen te spelen

// Canvas en context worden in gameCore gezet

// Spelconstanten en state laden
document.addEventListener('DOMContentLoaded', function() {
    // Controleer eerst of alle benodigde objecten beschikbaar zijn
    initializeGameWhenReady();
});

// Functie die controleert of alle benodigde game componenten geladen zijn
function initializeGameWhenReady() {
    if (!window.gameEntities || !window.gameCore || !window.gameControls || !window.gameRendering || !window.gameCharacters || !window.gameAudio) {
        // Als nog niet alle componenten geladen zijn, wacht dan 100ms en probeer opnieuw
        // Geen console.log meer om spamming te voorkomen
        setTimeout(initializeGameWhenReady, 100);
        return;
    }
    
    // Nu alle componenten geladen zijn, initialiseer het spel
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
            message: "",
            mathProblem: {
                equation: "",
                userAnswer: "",
                isCorrect: false
            }
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
    
    // Setup event listener voor numberPlatformHit event
    window.addEventListener('numberPlatformHit', handleNumberPlatformHit);
    
    // Initialiseer het spel
    init();
}

// Initialiseer het spel
function init() {
    // Laad geluidseffecten en voeg geluidsbediening toe 
    // (doen we eerst zodat de geluiden beschikbaar zijn voordat het intro scherm getoond wordt)
    gameAudio.loadGameSounds();
    gameAudio.addSoundControl();
    gameAudio.addMusicControl();
    
    // Laad de opgeslagen score uit localStorage als deze bestaat
    const savedScore = localStorage.getItem('gameScore');
    if (savedScore !== null) {
        gameCore.gameState.score = parseInt(savedScore, 10);
    }
    
    // Als het de eerste keer is dat we het spel starten (level 0 of 1), 
    // toon dan eerst het intro scherm
    if (gameCore.getStartLevel() <= 1 && !sessionStorage.getItem('introShown')) {
        showIntroScreen();
    } else {
        startGame();
    }
}

// Toon het intro scherm met feature image
function showIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    introScreen.style.display = 'flex';
    
    // Voeg event listeners toe voor knoppen
    document.querySelector('.close-intro').addEventListener('click', function() {
        introScreen.style.display = 'none';
        // Sla op dat we het intro scherm hebben getoond
        sessionStorage.setItem('introShown', 'true');
        startGame();
    });
    
    document.getElementById('start-game-button').addEventListener('click', function() {
        introScreen.style.display = 'none';
        // Sla op dat we het intro scherm hebben getoond
        sessionStorage.setItem('introShown', 'true');
        startGame();
    });
    
    // Sluit het intro scherm ook wanneer er op een willekeurige plek wordt geklikt
    introScreen.addEventListener('click', function(event) {
        if (event.target === this) {
            introScreen.style.display = 'none';
            // Sla op dat we het intro scherm hebben getoond
            sessionStorage.setItem('introShown', 'true');
            startGame();
        }
    });
}

// Handler voor numberPlatformHit events
function handleNumberPlatformHit(event) {
    // Haal de huidige level data op
    console.log("Game core current level:", gameCore.currentLevel);
    console.log("Game core current level index:", gameCore.currentLevelIndex);
    
    // We moeten het juiste level gebruiken op basis van de index, niet het level object
    const currentLevel = window.levels[gameCore.currentLevelIndex];
    console.log("Found current level:", currentLevel ? "yes" : "no");
    
    // Controleer of het level een mathProblem heeft
    if (!currentLevel.mathProblem || !currentLevel.mathProblem.equation || !currentLevel.mathProblem.answer) {
        return; // Geen rekenprobleem voor dit level
    }
    
    // Haal de waarde van het getroffen platform op
    const hitValue = event.detail.value;
    console.log(`Nummer platform geraakt: ${hitValue}, type: ${typeof hitValue}`);
    console.log("Event details:", JSON.stringify(event.detail));
    console.log("MathProblem status:", JSON.stringify(currentLevel.mathProblem));
    
    // Controleer of hitValue geldig is
    if (hitValue === undefined || hitValue === null) {
        console.error("Ongeldige waarde ontvangen van getroffen platform");
        return;
    }
    
    // Voeg het cijfer toe aan het gebruikersantwoord
    currentLevel.mathProblem.userAnswer = (currentLevel.mathProblem.userAnswer || "") + hitValue;
    
    // Update gamestate voor rendering
    gameCore.gameState.mathProblem.userAnswer = currentLevel.mathProblem.userAnswer;
    
    // Controleer of het antwoord compleet is (zelfde lengte als het verwachte antwoord)
    const expectedAnswer = currentLevel.mathProblem.answer;
    
    if (currentLevel.mathProblem.userAnswer.length >= expectedAnswer.length) {
        // Controleer of het antwoord correct is
        if (currentLevel.mathProblem.userAnswer === expectedAnswer) {
            // Juist antwoord
            gameCore.gameState.message = "Goed gedaan! Juist antwoord! De ster is nu zichtbaar!";
            gameCore.gameState.mathProblem.isCorrect = true;
            
            // Speel een succesgeluid
            if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                gameAudio.playSound('powerup', 0.5);
            }
            
            // Maak sterren zichtbaar
            currentLevel.collectibles.forEach(collectible => {
                collectible.visible = true;
            });
            
        } else {
            // Onjuist antwoord
            gameCore.gameState.message = "Oeps! Dat klopt niet. Probeer het opnieuw.";
            gameCore.gameState.mathProblem.isCorrect = false;
            
            // Speel een foutgeluid
            if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                gameAudio.playSound('lose-life', 0.5);
            }
            
            // Reset het gebruikersantwoord zodat de speler opnieuw kan beginnen
            currentLevel.mathProblem.userAnswer = "";
            gameCore.gameState.mathProblem.userAnswer = "";
        }
        
        // Wis het bericht na 2 seconden
        setTimeout(() => {
            if (gameCore.gameState.message === "Goed gedaan! Juist antwoord! De ster is nu zichtbaar!" || 
                gameCore.gameState.message === "Oeps! Dat klopt niet. Probeer het opnieuw.") {
                gameCore.gameState.message = "";
            }
        }, 2000);
    } else {
        // Antwoord nog niet compleet, update wat de speler tot nu toe heeft ingevoerd
        gameCore.gameState.mathProblem.userAnswer = currentLevel.mathProblem.userAnswer;
        
        // Speel een bliep geluid voor feedback
        if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
            gameAudio.playSound('blip-8-bit', 0.3);
        }
    }
}

// Start het spel na het intro scherm
function startGame() {
    // Bepaal het startlevel
    window.currentLevel = gameCore.getStartLevel();
    loadLevel(window.currentLevel);

    // Zorg dat de canvasgrootte goed is
    // Dit wordt hier gedaan omdat we nu de level info hebben
    resizeGameArea();
    
    // Laad muziek voor het huidige level
    gameAudio.loadLevelMusic(window.currentLevel);
    
    // Start de game loop
    gameLoop();
    
    // Toon beschikbare dieren in UI
    updateAvailableAnimalsUI();
}

// Update het scherm formaat
function resizeGameArea() {
    // Dit kan later gebruikt worden voor responsive spel weergave
}

// Geluidsfunctionaliteit is verplaatst naar game-audio.js

// Geluidsbediening is verplaatst naar game-audio.js

// Laad een level
function loadLevel(levelIndex) {
    // Haal level data op
    const level = window.levels[levelIndex];
    
    // Stel het huidige level in gameCore in (zowel index als leveldata)
    gameCore.currentLevel = level;
    gameCore.currentLevelIndex = levelIndex;
    
    // Reset level voltooide status
    gameCore.levelCompleted = false;
    gameCore.gameState.puppySaved = false;
    gameCore.gameState.treeHintShown = false; // Reset de hint voor boomklimmen
    
    // Behoud het niveau voltooide bericht als we van een voltooid niveau komen
    if (gameCore.gameState.message !== "Level voltooid! Druk op Spatie voor het volgende level") {
        gameCore.gameState.message = "";
    }
    
    gameCore.gameState.gameOver = false;
    
    // Initialiseer mathProblem voor dit level
    if (level.mathProblem) {
        console.log("Level heeft een rekenprobleem:", level.mathProblem.equation, "Antwoord:", level.mathProblem.answer);
        
        // Reset userAnswer
        level.mathProblem.userAnswer = "";
        
        // Update gamestate - BELANGRIJK: sla altijd alle velden op
        gameCore.gameState.mathProblem = {
            equation: level.mathProblem.equation,
            answer: level.mathProblem.answer,
            userAnswer: "",
            isCorrect: false
        };
        
        // Verberg collectibles tot het juiste antwoord is gegeven
        if (level.collectibles) {
            level.collectibles.forEach(collectible => {
                collectible.visible = false;
            });
        }
        
        console.log("MathProblem in gamestate geïnitialiseerd:", JSON.stringify(gameCore.gameState.mathProblem));
    }
    
    // We behouden de score tussen levels, dus reset niet tenzij de URL expliciet veranderd is
    // (bijvoorbeeld als de gebruiker een nieuw spel start)

    // Update de URL met het huidige level voor delen en refreshen (1-based voor gebruiker)
    window.location.hash = `level=${levelIndex + 1}`;
    
    // Update de editor link
    gameCore.updateEditorLink();
    
    // Sla het huidige level op als het laatst gespeelde level (1-based)
    localStorage.setItem('lastPlayedLevel', (levelIndex + 1).toString());
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
    
    // Toon instructie als dit level een rekenprobleem heeft
    if (level.mathProblem && level.mathProblem.equation) {
        gameCore.gameState.message = "Los de som op door op de getallen te springen!";
        setTimeout(() => {
            if (gameCore.gameState.message === "Los de som op door op de getallen te springen!") {
                gameCore.gameState.message = "";
            }
        }, 3000);
    }
}

// Toon de spelerinfo
function showPlayerInfo() {
    const player1Info = document.getElementById('player1-animal');
    const player2Info = document.getElementById('player2-animal');
    
    // Zorg ervoor dat we de speler UI functies alleen aanroepen als de spelers bestaan
    if (window.player1) {
        window.player1.updatePlayerInfoUI();
        
        // Voeg speciale instructie toe als speler 1 een mol is
        if (window.player1.animalType === "MOLE") {
            const player1Info = document.getElementById('player1-animal');
            if (player1Info && !player1Info.querySelector('.dig-instruction')) {
                const digInstruction = document.createElement('span');
                const keySpan = document.createElement('span');
                keySpan.textContent = "G";
                keySpan.classList.add('key');
                digInstruction.textContent = " (";
                digInstruction.appendChild(keySpan);
                digInstruction.appendChild(document.createTextNode(" = graven)"));
                digInstruction.classList.add('dig-instruction');
                player1Info.appendChild(digInstruction);
            }
        }
    }
    
    if (window.player2) {
        window.player2.updatePlayerInfoUI();
        
        // Voeg speciale instructie toe als speler 2 een mol is
        if (window.player2.animalType === "MOLE") {
            const player2Info = document.getElementById('player2-animal');
            if (player2Info && !player2Info.querySelector('.dig-instruction')) {
                const digInstruction = document.createElement('span');
                const keySpan = document.createElement('span');
                keySpan.textContent = "Ctrl";
                keySpan.classList.add('key');
                digInstruction.textContent = " (";
                digInstruction.appendChild(keySpan);
                digInstruction.appendChild(document.createTextNode(" = graven)"));
                digInstruction.classList.add('dig-instruction');
                player2Info.appendChild(digInstruction);
            }
        }
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
    
    // Sla de score op in localStorage
    localStorage.setItem('gameScore', gameCore.gameState.score.toString());
}

// Maak updateScoreDisplay globaal beschikbaar zodat andere modules het kunnen gebruiken
window.updateScoreDisplay = updateScoreDisplay;

// Update UI om de beschikbare dieren voor het huidige level te tonen
function updateAvailableAnimalsUI() {
    const currentLevelData = window.levels[gameCore.currentLevelIndex];
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
    
    // Voeg elk toegestaan dier toe met alleen emoji
    allowedAnimals.forEach(animalType => {
        const animalElement = document.createElement('div');
        animalElement.classList.add('animal-icon');
        
        // Kies emoji op basis van diertype
        let animalEmoji;
        switch(animalType) {
            case "SQUIRREL": animalEmoji = "🐿️"; break;
            case "TURTLE": animalEmoji = "🐢"; break;
            case "UNICORN": animalEmoji = "🦄"; break;
            case "CAT": animalEmoji = "🐱"; break;
            case "MOLE": animalEmoji = "🦔"; break;
        }
        
        animalElement.textContent = animalEmoji;
        animalsContainer.appendChild(animalElement);
    });
    
    // Voeg instructietekst toe voor speler-modus
    const modeText = document.createElement('div');
    modeText.classList.add('game-mode-info');
    
    // Alleen basis modus tekst (1 of 2 spelers)
    let modeString = allowedAnimals.length > 1 ? 
        "Modus: 2 spelers" : 
        "Modus: 1 speler";
    
    modeText.textContent = modeString;
    animalsContainer.appendChild(modeText);
}

// Naar volgend level gaan
function nextLevel() {
    // Stop alle lopende geluidseffecten (wind, onderwater geluid, etc.)
    if (typeof gameAudio !== 'undefined') {
        if (typeof gameAudio.stopAllLoopingSounds === 'function') {
            gameAudio.stopAllLoopingSounds();
        }
    }
    
    gameCore.currentLevelIndex++;
    if (gameCore.currentLevelIndex >= window.levels.length) {
        gameCore.currentLevelIndex = 0; // Terug naar eerste level of eindscherm tonen
    }
    
    // Laad het volgende level
    loadLevel(gameCore.currentLevelIndex);
    
    // Laad muziek voor het nieuwe level
    if (typeof gameAudio !== 'undefined' && typeof gameAudio.loadLevelMusic === 'function') {
        gameAudio.loadLevelMusic(gameCore.currentLevelIndex);
    }
}

// Reset het huidige level (na game over door puppy verlies)
function resetCurrentLevel() {
    // Stop alle lopende geluidseffecten (wind, onderwater geluid, etc.)
    if (typeof gameAudio !== 'undefined') {
        if (typeof gameAudio.stopAllLoopingSounds === 'function') {
            gameAudio.stopAllLoopingSounds();
        }
    }
    
    // Reset spelers
    window.player1.resetToStart();
    window.player2.resetToStart();
    
    // Reset puppy
    const currentLevelData = gameCore.currentLevel;
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
        const currentLevelData = gameCore.currentLevel;
        
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
        
        // Collectibles tekenen (alleen als er geen rekenprobleem is of als het is opgelost)
        if (!currentLevelData.mathProblem || gameCore.gameState.mathProblem.isCorrect) {
            currentLevelData.collectibles.forEach(collectible => {
                gameRendering.drawCollectible(collectible);
            });
        }
        
        // Grond tekenen
        gameRendering.drawGround();
        
        // Debug toetsenstaat periodiek
        if (frameCount % 30 === 0) {
            if (window.gameControls && gameControls.debugKeyState) {
                gameControls.debugKeyState();
            }
        }
        
        // Update slowmotion status als actief
        if (gameCore.gameState.slowMotion) {
            // Slow motion visueel effect - blauwachtige tint op het scherm
            gameCore.ctx.fillStyle = 'rgba(100, 180, 255, 0.15)';
            gameCore.ctx.fillRect(0, 0, gameCore.canvas.width, gameCore.canvas.height);
            
            // Verminder de timer
            gameCore.gameState.slowMotionTime--;
            
            // Als timer afgelopen is, deactiveer slowmotion
            if (gameCore.gameState.slowMotionTime <= 0) {
                gameCore.gameState.slowMotion = false;
                gameCore.gameState.slowMotionPlayer = null;
                gameCore.gameState.slowMotionFactor = 1.0;
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
            // Kies tekst kleur op basis van het thema
            if (currentLevelData.theme === 'night') {
                gameCore.ctx.fillStyle = 'white'; // Witte tekst voor nachtthema
            } else {
                gameCore.ctx.fillStyle = 'black'; // Zwarte tekst voor dagthema
            }
            gameCore.ctx.textAlign = 'center';
            gameCore.ctx.fillText(gameCore.gameState.message, gameCore.canvas.width/2, 100);
        }
        
        // Toon rekenprobleem (als er een is)
        if (gameCore.gameState.mathProblem && gameCore.gameState.mathProblem.equation) {
            // Teken achtergrond voor rekensom
            const padding = 20;
            gameCore.ctx.font = 'bold 22px Comic Sans MS';
            const problemWidth = gameCore.ctx.measureText(gameCore.gameState.mathProblem.equation).width + padding * 4;
            const problemHeight = 40;
            
            gameCore.ctx.fillStyle = currentLevelData.theme === 'night' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
            gameCore.ctx.beginPath();
            gameCore.ctx.roundRect(gameCore.canvas.width/2 - problemWidth/2, 30, problemWidth, problemHeight, 5);
            gameCore.ctx.fill();
            
            // Teken kader
            gameCore.ctx.strokeStyle = currentLevelData.theme === 'night' ? '#aaa' : '#555';
            gameCore.ctx.lineWidth = 2;
            gameCore.ctx.stroke();
            
            // Bereken het aantal verwachte cijfers in het antwoord
            const expectedAnswer = currentLevelData.mathProblem.answer;
            const answerLength = expectedAnswer.length;
            
            // Maak de te tonen vergelijking met underscores voor het antwoord
            let displayEquation = gameCore.gameState.mathProblem.equation;
            
            // Maak een reeks underscores voor het antwoord
            let answerDisplay = "";
            for (let i = 0; i < answerLength; i++) {
                // Als er al een cijfer is ingevoerd op deze positie, toon dat cijfer
                if (gameCore.gameState.mathProblem.userAnswer && gameCore.gameState.mathProblem.userAnswer[i]) {
                    answerDisplay += gameCore.gameState.mathProblem.userAnswer[i];
                } else {
                    // Anders toon een underscore
                    answerDisplay += "_";
                }
            }
            
            // Toon de vergelijking
            gameCore.ctx.fillStyle = currentLevelData.theme === 'night' ? '#ffb733' : '#ff8c00';  // Oranje kleur voor de som
            gameCore.ctx.textAlign = 'center';
            gameCore.ctx.fillText(displayEquation + " " + answerDisplay, gameCore.canvas.width/2, 54);
        }
        
        // Toon altijd "Druk op spatie" als level is voltooid
        if (gameCore.levelCompleted) {
            const currentLevelData = gameCore.currentLevel;
            const isNightTheme = currentLevelData.theme === 'night';

            gameCore.ctx.font = 'bold 20px Comic Sans MS';
            // Kies tekst kleur op basis van het thema
            gameCore.ctx.fillStyle = isNightTheme ? '#80ff80' : 'green'; // Lichtere groene kleur in de nachtmodus
            gameCore.ctx.textAlign = 'center';
            
            // Teken de tekst met keySpan styling
            const message = "Druk op";
            const messageWidth = gameCore.ctx.measureText(message).width;
            const spaceWidth = gameCore.ctx.measureText(" ").width;
            const nextMessage = "om naar de kaart te gaan";
            const nextWidth = gameCore.ctx.measureText(nextMessage).width;
            
            // Bereken de startposities voor de verschillende delen
            const totalWidth = messageWidth + spaceWidth + 60 + spaceWidth + nextWidth; // 60px voor de key breedte
            const startX = gameCore.canvas.width/2 - totalWidth/2;
            
            // Teken de tekst "Druk op"
            gameCore.ctx.fillText(message, startX + messageWidth/2, 140);
            
            // Teken de spatiebalk key styling
            const keyX = startX + messageWidth + spaceWidth;
            gameCore.ctx.fillStyle = '#f5f5f5';
            gameCore.ctx.strokeStyle = isNightTheme ? '#aaa' : '#ddd'; // Donkerdere rand in nachtmodus
            gameCore.ctx.lineWidth = 1;
            gameCore.ctx.beginPath();
            gameCore.ctx.roundRect(keyX, 125, 60, 22, 4);
            gameCore.ctx.fill();
            gameCore.ctx.stroke();
            
            // Teken de "Spatie" tekst in de key
            gameCore.ctx.fillStyle = '#333';
            gameCore.ctx.font = 'bold 16px monospace';
            gameCore.ctx.fillText("Spatie", keyX + 30, 140);
            
            // Teken het vervolg van de tekst
            gameCore.ctx.fillStyle = isNightTheme ? '#80ff80' : 'green'; // Lichtere groene kleur in de nachtmodus
            gameCore.ctx.font = 'bold 20px Comic Sans MS';
            gameCore.ctx.fillText(nextMessage, keyX + 60 + spaceWidth + nextWidth/2, 140);
        }
        
        // Teken puntenpopups als die er zijn
        if (typeof gameRendering !== 'undefined' && typeof gameRendering.drawPointsPopups === 'function') {
            gameRendering.drawPointsPopups();
        }
        
        // Level naam (gebruiksvriendelijke 1-based nummering)
        gameCore.ctx.font = '16px Comic Sans MS';
        // Kies tekst kleur op basis van het thema
        if (currentLevelData.theme === 'night') {
            gameCore.ctx.fillStyle = 'white'; // Witte tekst voor nachtthema
        } else {
            gameCore.ctx.fillStyle = 'black'; // Zwarte tekst voor dagthema
        }
        gameCore.ctx.textAlign = 'left';
        gameCore.ctx.fillText("Level " + (gameCore.currentLevelIndex + 1) + ": " + currentLevelData.name, 10, 20);
    }
    
    // Incrementeer frame telling voor debug doeleinden
    frameCount++;
    
    // Debug indicator als debug mode is ingeschakeld
    if (gameCore.gameState.debugLevel >= 1) {
        gameCore.ctx.font = '14px Courier New';
        gameCore.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        gameCore.ctx.textAlign = 'right';
        gameCore.ctx.fillText("DEBUG MODE " + gameCore.gameState.debugLevel, gameCore.canvas.width - 10, 20);
        
        // Toon melding over debugging alleen de eerste keer, niet steeds opnieuw
        if (frameCount === 60) { // Ongeveer 1 seconde na start (bij 60fps)
            console.log("Debug mode actief (niveau " + gameCore.gameState.debugLevel + "). Activeer graven met G (speler 1) of Control (speler 2)");
        }
    }
    
    // Normal speed - we don't need to throttle the frame rate
    // We'll just slow down the game physics instead
    requestAnimationFrame(gameLoop);
}