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
        // Als we in multiplayer modus zijn en NIET de host, dan updaten we alleen onze lokale spelers
        // De positie-updates komen van de host via player_update events
        if (window.gameMultiplayer && gameMultiplayer.roomId && !gameMultiplayer.isHost) {
            // Toon alleen de spelers, update ze niet (om client-side prediction te voorkomen)
            // In plaats daarvan sturen we alleen inputs naar de host
        } else {
            // Als we de host zijn of in singleplayer modus, update normaal
            player1.update(player2, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
            player2.update(player1, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        }
        
        gameRendering.drawPlayer(player1);
        gameRendering.drawPlayer(player2);
        
        // Multiplayer-specifieke spelers tekenen en updaten (andere spelers in het netwerk)
        if (window.gameMultiplayer && gameMultiplayer.roomId) {
            if (gameMultiplayer.socket) {
                // Verschillende gedrag voor host vs client
                if (gameMultiplayer.isHost) {
                    // HOST SPECIFIEKE CODE
                    
                    // Verwerk remote inputs van andere spelers
                    if (gameMultiplayer.remotePlayerInputs) {
                        for (const playerId in gameMultiplayer.remotePlayerInputs) {
                            const inputData = gameMultiplayer.remotePlayerInputs[playerId];
                            
                            // Vind de remote speler object
                            const otherPlayer = gameMultiplayer.otherPlayers[playerId];
                            if (otherPlayer && otherPlayer.playerObj) {
                                // Pas de gameControls.keys aan voor deze speler
                                // We maken een tijdelijke kopie van de keys state voor deze verwerking
                                const originalKeys = {...gameControls.keys}; // Backup huidige toetsenbord staat
                                
                                // Stel tijdelijk toetsen in op basis van remote input
                                const remoteKeys = inputData.keys;
                                const playerObj = otherPlayer.playerObj;
                                
                                // Update controls voor de simulatie - toepassen van de remote inputs
                                gameControls.keys[playerObj.controls.left] = remoteKeys.left;
                                gameControls.keys[playerObj.controls.right] = remoteKeys.right;
                                gameControls.keys[playerObj.controls.up] = remoteKeys.up;
                                gameControls.keys[playerObj.controls.down] = remoteKeys.down;
                                
                                // Verwerk deze inputs in de player update
                                playerObj.update(player1, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
                                
                                // Herstel de originele toetsenbordsituatie
                                gameControls.keys = originalKeys;
                            }
                        }
                    }
                    
                    // Stuur elke 3 frames een positie-update voor ALLE spelers (ook remote)
                    if (frameCount % 3 === 0) {
                        // Stuur positie updates voor lokale spelers
                        gameMultiplayer.sendPositionUpdate(player1);
                        gameMultiplayer.sendPositionUpdate(player2);
                        
                        // Stuur ook updates voor remote spelers
                        for (const playerId in gameMultiplayer.otherPlayers) {
                            const otherPlayer = gameMultiplayer.otherPlayers[playerId];
                            if (otherPlayer.playerObj) {
                                // Gebruik de reeds berekende posities om terug te sturen naar de clients
                                gameMultiplayer.socket.emit('player_update', {
                                    player_id: playerId,
                                    position: { x: otherPlayer.playerObj.x, y: otherPlayer.playerObj.y },
                                    velocity: { x: otherPlayer.playerObj.velX, y: otherPlayer.playerObj.velY },
                                    animal_type: otherPlayer.playerObj.animalType
                                });
                            }
                        }
                    }
                    
                    // Synchroniseer game state (minder vaak)
                    if (frameCount % 15 === 0) {
                        gameMultiplayer.updateGameState();
                    }
                } else {
                    // CLIENT SPECIFIEKE CODE
                    
                    // Stuur lokale inputs naar de server voor verwerking door de host
                    if (frameCount % 2 === 0) { // Iets vaker dan positie updates voor responsive besturing
                        gameMultiplayer.sendPlayerInput(player1, gameControls.keys);
                        gameMultiplayer.sendPlayerInput(player2, gameControls.keys);
                    }
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