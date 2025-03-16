// Dieren Redders - Een samenwerkingsspel met dieren
// Gemaakt voor een ouder en kind om samen te spelen

// Canvas en context worden in gameCore gezet

// Spelconstanten en state laden
document.addEventListener('DOMContentLoaded', function() {
    // Canvas referenties koppelen aan gameCore
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    gameCore.canvas = canvas;
    gameCore.ctx = ctx;
    gameCore.GROUND_LEVEL = canvas.height - 50;
    
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
    
    // Initialiseer de multiplayer mode
    if (typeof initMultiplayer === 'function') {
        initMultiplayer();
    }
    
    // Game starten
    gameLoop();
});

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
    
    player2.animalType = "TURTLE";
    player2.updateAnimalProperties();
    player2.x = levels[gameCore.currentLevel].startPositions[1].x;
    player2.y = levels[gameCore.currentLevel].startPositions[1].y;
    
    // Reset game state
    gameCore.levelCompleted = false;
    gameCore.gameState.message = "";
    gameCore.gameState.puppySaved = false;
    gameCore.gameState.gameOver = false;
    
    // Update de URL fragment zonder de pagina opnieuw te laden
    window.location.hash = `level=${gameCore.currentLevel}`;
    
    // Update de editor link
    gameCore.updateEditorLink();
    
    // Als we in multiplayer modus zijn en de host zijn, broadcast het nieuwe level
    if (window.gameMultiplayer && gameMultiplayer.isHost && gameMultiplayer.socket) {
        console.log("Broadcasting level change to all players:", gameCore.currentLevel);
        // Update onmiddellijk de game state om het nieuwe level te synchroniseren
        gameMultiplayer.updateGameState();
    }
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
        
        // Spelers updaten en tekenen
        player1.update(player2, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        player2.update(player1, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        
        gameRendering.drawPlayer(player1);
        gameRendering.drawPlayer(player2);
        
        // Multiplayer-specifieke spelers tekenen en updaten (andere spelers in het netwerk)
        if (window.gameMultiplayer && gameMultiplayer.roomId) {
            // Stuur onze positie naar andere spelers (voor beide lokale spelers)
            if (gameMultiplayer.socket) {
                // Stuur elke 3 frames een update (om netwerkverkeer te beperken)
                if (frameCount % 3 === 0) {
                    // Stuur updates van beide spelers om correcte synchronisatie te garanderen
                    gameMultiplayer.sendPositionUpdate(player1);
                    gameMultiplayer.sendPositionUpdate(player2);
                }
                
                // Als we de host zijn, synchroniseer de game state (minder vaak)
                if (gameMultiplayer.isHost && frameCount % 15 === 0) {
                    gameMultiplayer.updateGameState();
                }
                
                // Update de spelernamen in de UI periodiek (elke 150 frames = ongeveer elke 2.5 seconden)
                if (frameCount % 150 === 0) {
                    gameMultiplayer.updatePlayerNamesInUI();
                }
            }
            
            // Teken andere spelers
            for (const playerId in gameMultiplayer.otherPlayers) {
                const otherPlayer = gameMultiplayer.otherPlayers[playerId];
                if (otherPlayer.playerObj) {
                    // We gebruiken de bestaande renderingcode voor spelers
                    gameRendering.drawPlayer(otherPlayer.playerObj);
                } else {
                    // Maak een spelerobject voor deze speler als het nog niet bestaat
                    otherPlayer.playerObj = new gameEntities.Player(
                        otherPlayer.position.x, 
                        otherPlayer.position.y,
                        {}, // Geen controls nodig, wordt extern gestuurd
                        otherPlayer.username,
                        otherPlayer.animalType
                    );
                }
            }
        }
        
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
        
        // Toon multiplayer indicator als we in een multiplayer sessie zijn
        if (window.gameMultiplayer && gameMultiplayer.roomId) {
            gameCore.ctx.font = '16px Comic Sans MS';
            gameCore.ctx.fillStyle = 'green';
            gameCore.ctx.textAlign = 'right';
            gameCore.ctx.fillText("Multiplayer", gameCore.canvas.width - 10, 20);
        }
    }
    
    // Houd frame telling bij voor multiplayer updates
    if (typeof frameCount === 'undefined') {
        frameCount = 0;
    }
    frameCount++;
    
    requestAnimationFrame(gameLoop);
}