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
    if (!window.gameEntities || !window.gameCore || !window.gameControls) {
        // Als nog niet alle componenten geladen zijn, wacht dan 100ms en probeer opnieuw
        console.log("Wachten tot alle game componenten geladen zijn...");
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
    
    // Level functions instellen
    gameCore.nextLevel = nextLevel;
    gameCore.resetCurrentLevel = resetCurrentLevel;
    
    // Besturing opzetten
    gameControls.setupInputListeners();
    
    // Haal het startlevel op uit de URL
    gameCore.currentLevel = gameCore.getStartLevel();
    
    // Zorg ervoor dat het level index geldig is
    if (gameCore.currentLevel >= levels.length) {
        gameCore.currentLevel = 0;
    }
    
    // Update de Level Editor link om terug te gaan naar hetzelfde level in de editor
    gameCore.updateEditorLink();
    
    // Spelers aanmaken
    window.player1 = new gameEntities.Player(
        levels[gameCore.currentLevel].startPositions[0].x, 
        levels[gameCore.currentLevel].startPositions[0].y,
        {up: 'w', left: 'a', right: 'd', down: 's', switch: 'f'},
        "Speler 1",
        "SQUIRREL"
    );
    
    window.player2 = new gameEntities.Player(
        levels[gameCore.currentLevel].startPositions[1].x, 
        levels[gameCore.currentLevel].startPositions[1].y,
        {up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', switch: 'Shift'},
        "Speler 2",
        "TURTLE"
    );
    
    // Game starten
    gameLoop();
}

// Naar volgend level gaan
function nextLevel() {
    gameCore.currentLevel++;
    if (gameCore.currentLevel >= levels.length) {
        gameCore.currentLevel = 0; // Terug naar eerste level of eindscherm tonen
    }
    
    // Reset spelers
    player1.animalType = "SQUIRREL";
    player1.updateAnimalProperties();
    player1.x = levels[gameCore.currentLevel].startPositions[0].x;
    player1.y = levels[gameCore.currentLevel].startPositions[0].y;
    // Reset levens van spelers alleen bij nieuw level, niet bij heropstarten hetzelfde level
    player1.resetLives();
    
    player2.animalType = "TURTLE";
    player2.updateAnimalProperties();
    player2.x = levels[gameCore.currentLevel].startPositions[1].x;
    player2.y = levels[gameCore.currentLevel].startPositions[1].y;
    player2.resetLives();
    
    // Reset game state
    gameCore.levelCompleted = false;
    gameCore.gameState.message = "";
    gameCore.gameState.puppySaved = false;
    gameCore.gameState.gameOver = false;
    
    // Update de URL fragment zonder de pagina opnieuw te laden
    window.location.hash = `level=${gameCore.currentLevel}`;
    
    // Update de editor link
    gameCore.updateEditorLink();
}

// Reset het huidige level (na game over door puppy verlies)
function resetCurrentLevel() {
    // Reset spelers
    player1.resetToStart();
    player2.resetToStart();
    
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
        gameEntities.updateEnemies([player1, player2]); // Geef spelers mee aan updateEnemies
        
        // Platforms tekenen
        currentLevelData.platforms.forEach(platform => {
            gameRendering.drawPlatform(platform);
        });
        
        // Valstrikken tekenen
        currentLevelData.traps.forEach(trap => {
            gameRendering.drawTrap(trap);
        });
        
        // Vijanden tekenen
        gameRendering.drawEnemies();
        
        // Puppy tekenen
        if (currentLevelData.puppy) {
            gameRendering.drawPuppy(currentLevelData.puppy);
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
        
        // Beide spelers worden lokaal bestuurd
        player1.update(player2, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        player2.update(player1, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        
        // Teken beide spelers
        gameRendering.drawPlayer(player1);
        gameRendering.drawPlayer(player2);
        
        // Game berichten
        if (gameCore.gameState.message) {
            gameCore.ctx.font = '20px Comic Sans MS';
            gameCore.ctx.fillStyle = 'black';
            gameCore.ctx.textAlign = 'center';
            gameCore.ctx.fillText(gameCore.gameState.message, gameCore.canvas.width/2, 100);
        }
        
        // Level naam (gebruiksvriendelijke 1-based nummering)
        gameCore.ctx.font = '16px Comic Sans MS';
        gameCore.ctx.fillStyle = 'black';
        gameCore.ctx.textAlign = 'left';
        gameCore.ctx.fillText("Level " + (gameCore.currentLevel + 1) + ": " + currentLevelData.name, 10, 20);
    }
    
    // Incrementeer frame telling voor debug doeleinden
    frameCount++;
    
    requestAnimationFrame(gameLoop);
}