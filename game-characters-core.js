// game-characters-core.js
// Main controller module for character rendering that coordinates all character rendering

// Draw player method for each animal type
function drawPlayer(player) {
    // Check if the player is invulnerable
    if (player.isInvulnerable) {
        // Calculate flicker effect based on timer
        if (player.invulnerableTimer % 10 < 5) {
            // Semi-transparent effect
            gameCore.ctx.globalAlpha = 0.5;
        }
    }
    
    // Save the context for ice effect rotation if needed
    if (player.onIce && Math.abs(player.velX) > 1) {
        gameCore.ctx.save();
        
        // Wobble effect for slipping
        const wobbleAmount = Math.sin(Date.now() / 100) * 2;
        gameCore.ctx.translate(player.x + player.width/2, player.y + player.height/2);
        gameCore.ctx.rotate(wobbleAmount * Math.PI / 180);
        gameCore.ctx.translate(-(player.x + player.width/2), -(player.y + player.height/2));
    }
    
    // Draw the appropriate animal type
    if (player.animalType === "SQUIRREL") {
        window.gameCharactersPlayers.drawSquirrel(player);
    } else if (player.animalType === "TURTLE") {
        window.gameCharactersPlayers.drawTurtle(player);
    } else if (player.animalType === "UNICORN") {
        window.gameCharactersPlayers.drawUnicorn(player);
    } else if (player.animalType === "CAT") {
        window.gameCharactersPlayers.drawCat(player);
    }
    
    // Draw ice sliding effect - little motion lines behind the player
    if (player.onIce && Math.abs(player.velX) > 1) {
        // Draw small motion streaks to show sliding
        const direction = player.velX > 0 ? -1 : 1;
        gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        for (let i = 0; i < 3; i++) {
            const startX = player.x + (player.velX > 0 ? 0 : player.width);
            const startY = player.y + player.height * (0.4 + i * 0.2);
            const length = Math.min(Math.abs(player.velX) * 3, 15) * direction;
            
            gameCore.ctx.fillRect(startX, startY, length, 2);
        }
        
        // Draw some ice particles
        const particleCount = Math.floor(Math.abs(player.velX));
        for (let i = 0; i < particleCount; i++) {
            const particleX = player.x + (player.velX > 0 ? 0 : player.width) + (Math.random() * 5 - 10) * direction;
            const particleY = player.y + player.height * (0.3 + Math.random() * 0.7);
            const particleSize = Math.random() * 2 + 1;
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            gameCore.ctx.fill();
        }
        
        // Restore the context if we saved it for rotation
        gameCore.ctx.restore();
    }
    
    // Draw fire breath if player is breathing fire
    if (player.isBreathingFire) {
        window.gameCharactersPlayers.drawFireBreath(player);
    }
    
    // Reset globalAlpha if it was modified
    if (player.isInvulnerable) {
        gameCore.ctx.globalAlpha = 1.0;
    }
}

// Draw enemies
function drawEnemies() {
    if (!window.levels) return;
    const currentLevelData = window.levels[gameCore.currentLevel];
    const enemies = currentLevelData.enemies || [];
    
    enemies.forEach(enemy => {
        // Draw the appropriate enemy type
        if (enemy.type === "LION") {
            window.gameCharactersNPCs.drawLion(enemy);
        } else if (enemy.type === "DRAGON") {
            window.gameCharactersNPCs.drawDragon(enemy);
        }
        
        // Draw burning effect if the enemy is being hit by fire
        if (enemy.burningEffect) {
            window.gameCharactersEffects.drawBurningEffect(enemy);
            
            // Decrease burning timer
            if (enemy.burningTimer !== undefined) {
                enemy.burningTimer--;
            }
        }
        
        // Draw claw effect if the enemy is being hit by cat claws
        if (enemy.clawEffect) {
            window.gameCharactersEffects.drawClawEffect(enemy);
            
            // Decrease claw timer
            if (enemy.clawTimer !== undefined) {
                enemy.clawTimer--;
            }
        }
    });
}

// Draw puppy (shorthand method)
function drawPuppy(puppy) {
    window.gameCharactersNPCs.drawPuppy(puppy);
}

// Export the main render functions to maintain compatibility
window.gameCharacters = {
    // Core functions (this module)
    drawPlayer,
    drawEnemies,
    drawPuppy,
    
    // Player render functions (from players module)
    drawSquirrel: window.gameCharactersPlayers.drawSquirrel,
    drawTurtle: window.gameCharactersPlayers.drawTurtle,
    drawUnicorn: window.gameCharactersPlayers.drawUnicorn,
    drawCat: window.gameCharactersPlayers.drawCat,
    drawFireBreath: window.gameCharactersPlayers.drawFireBreath,
    
    // NPC render functions (from npcs module)
    drawLion: window.gameCharactersNPCs.drawLion,
    drawDragon: window.gameCharactersNPCs.drawDragon,
    
    // Effect render functions (from effects module)
    drawBurningEffect: window.gameCharactersEffects.drawBurningEffect,
    drawClawEffect: window.gameCharactersEffects.drawClawEffect
};