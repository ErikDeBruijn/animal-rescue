// game-characters.js
// Contains all character related rendering functions

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
        drawSquirrel(player);
    } else if (player.animalType === "TURTLE") {
        drawTurtle(player);
    } else if (player.animalType === "UNICORN") {
        drawUnicorn(player);
    } else if (player.animalType === "CAT") {
        drawCat(player);
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
        drawFireBreath(player);
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
            drawLion(enemy);
        } else if (enemy.type === "DRAGON") {
            drawDragon(enemy);
        }
        
        // Draw burning effect if the enemy is being hit by fire
        if (enemy.burningEffect) {
            drawBurningEffect(enemy);
            
            // Decrease burning timer
            if (enemy.burningTimer !== undefined) {
                enemy.burningTimer--;
            }
        }
    });
}

// Function to draw burning effect on enemies
function drawBurningEffect(enemy) {
    const time = Date.now() / 50; // Fast animation
    
    // Create flames on the enemy
    for (let i = 0; i < 10; i++) {
        const flameX = enemy.x + Math.random() * enemy.width;
        const flameY = enemy.y + Math.random() * enemy.height * 0.8;
        const flameHeight = 10 + Math.random() * 15;
        const flameWidth = 5 + Math.random() * 8;
        
        // Gradient for the flame
        const gradient = gameCore.ctx.createLinearGradient(
            flameX, flameY + flameHeight,
            flameX, flameY - flameHeight
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)'); // Red base
        gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.8)'); // Orange middle
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0.4)'); // Yellow tip
        
        gameCore.ctx.fillStyle = gradient;
        
        // Draw flame shape (triangle with curved top)
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(flameX - flameWidth/2, flameY + flameHeight/4);
        
        // Left side
        gameCore.ctx.quadraticCurveTo(
            flameX - flameWidth/4,
            flameY - flameHeight/2,
            flameX,
            flameY - flameHeight/2 + Math.sin(time + i) * 3
        );
        
        // Right side
        gameCore.ctx.quadraticCurveTo(
            flameX + flameWidth/4,
            flameY - flameHeight/2,
            flameX + flameWidth/2,
            flameY + flameHeight/4
        );
        
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
    }
    
    // Flash effect
    if (enemy.burningTimer > 10) {
        gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        gameCore.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

// Draw a lion
function drawLion(lion) {
    // Determine direction based on movement
    const facingLeft = lion.direction === -1;
    
    // Body (gold color)
    gameCore.ctx.fillStyle = '#DAA520'; // Gold color
    gameCore.ctx.fillRect(lion.x, lion.y, lion.width, lion.height);
    
    // Mane (darker gold) - position depends on direction
    gameCore.ctx.fillStyle = '#B8860B'; // Dark gold
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Mane left
        gameCore.ctx.arc(lion.x + lion.width * 0.3, lion.y + lion.height * 0.4, 
                lion.width * 0.4, 0, Math.PI * 2);
    } else {
        // Mane right (default)
        gameCore.ctx.arc(lion.x + lion.width * 0.7, lion.y + lion.height * 0.4, 
                lion.width * 0.4, 0, Math.PI * 2);
    }
    
    gameCore.ctx.fill();
    
    // Eyes and Nose - position depends on direction
    gameCore.ctx.fillStyle = 'black';
    
    if (facingLeft) {
        // Eye left
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.2, lion.y + lion.height * 0.3, 
                lion.width * 0.06, 0, Math.PI * 2);
        gameCore.ctx.fill();
        
        // Nose left
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.1, lion.y + lion.height * 0.4, 
                lion.width * 0.05, 0, Math.PI * 2);
        gameCore.ctx.fill();
    } else {
        // Eye right (default)
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.8, lion.y + lion.height * 0.3, 
                lion.width * 0.06, 0, Math.PI * 2);
        gameCore.ctx.fill();
        
        // Nose right (default)
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.9, lion.y + lion.height * 0.4, 
                lion.width * 0.05, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
    
    // Tail - position depends on direction
    gameCore.ctx.fillStyle = '#DAA520';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Tail right
        gameCore.ctx.moveTo(lion.x + lion.width, lion.y + lion.height * 0.7);
        gameCore.ctx.quadraticCurveTo(
            lion.x + lion.width + lion.width * 0.2, lion.y + lion.height, 
            lion.x + lion.width + lion.width * 0.3, lion.y + lion.height * 0.5
        );
        gameCore.ctx.quadraticCurveTo(
            lion.x + lion.width + lion.width * 0.3, lion.y + lion.height * 0.2, 
            lion.x + lion.width, lion.y + lion.height * 0.4
        );
    } else {
        // Tail left (default)
        gameCore.ctx.moveTo(lion.x, lion.y + lion.height * 0.7);
        gameCore.ctx.quadraticCurveTo(
            lion.x - lion.width * 0.2, lion.y + lion.height, 
            lion.x - lion.width * 0.3, lion.y + lion.height * 0.5
        );
        gameCore.ctx.quadraticCurveTo(
            lion.x - lion.width * 0.3, lion.y + lion.height * 0.2, 
            lion.x, lion.y + lion.height * 0.4
        );
    }
    
    gameCore.ctx.fill();
    
    // Legs - position depends on direction
    gameCore.ctx.fillStyle = '#DAA520';
    
    if (facingLeft) {
        // Legs mirrored
        // Front leg left
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.3, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
        // Back leg right
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.8, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
    } else {
        // Legs default
        // Front leg right
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.7, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
        // Back leg left
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.2, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
    }
}

// Draw a dragon
function drawDragon(dragon) {
    // Determine direction based on movement
    const facingLeft = dragon.direction === -1;
    
    // Body (green)
    gameCore.ctx.fillStyle = '#228B22'; // Forest green
    gameCore.ctx.fillRect(dragon.x, dragon.y, dragon.width, dragon.height);
    
    // Wings - position depends on direction
    gameCore.ctx.fillStyle = '#006400'; // Darker green
    
    if (facingLeft) {
        // Wings mirrored
        // Right wing (now left)
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.3, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.1, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Left wing (now right)
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.7, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.9, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
    } else {
        // Wings default
        // Left wing
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.3, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.1, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Right wing
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.7, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.9, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
    }
    
    // Head - position depends on direction
    gameCore.ctx.fillStyle = '#228B22';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Head left
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.2, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.2, 
            0, Math.PI * 2
        );
    } else {
        // Head right (default)
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.8, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.2, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Eyes - position depends on direction
    gameCore.ctx.fillStyle = 'red';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Eye left
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.15, 
            dragon.y + dragon.height * 0.25, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
    } else {
        // Eye right (default)
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.85, 
            dragon.y + dragon.height * 0.25, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Tail - position depends on direction
    gameCore.ctx.fillStyle = '#228B22';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Tail right
        gameCore.ctx.moveTo(dragon.x + dragon.width, dragon.y + dragon.height * 0.5);
        gameCore.ctx.quadraticCurveTo(
            dragon.x + dragon.width + dragon.width * 0.5, dragon.y + dragon.height * 0.5, 
            dragon.x + dragon.width + dragon.width * 0.3, dragon.y + dragon.height * 0.7
        );
        gameCore.ctx.quadraticCurveTo(
            dragon.x + dragon.width + dragon.width * 0.2, dragon.y + dragon.height * 0.9, 
            dragon.x + dragon.width, dragon.y + dragon.height * 0.7
        );
    } else {
        // Tail left (default)
        gameCore.ctx.moveTo(dragon.x, dragon.y + dragon.height * 0.5);
        gameCore.ctx.quadraticCurveTo(
            dragon.x - dragon.width * 0.5, dragon.y + dragon.height * 0.5, 
            dragon.x - dragon.width * 0.3, dragon.y + dragon.height * 0.7
        );
        gameCore.ctx.quadraticCurveTo(
            dragon.x - dragon.width * 0.2, dragon.y + dragon.height * 0.9, 
            dragon.x, dragon.y + dragon.height * 0.7
        );
    }
    
    gameCore.ctx.fill();
    
    // Fire (if the dragon is breathing fire)
    if (dragon.fireBreathing) {
        const time = Date.now() / 100;
        // Determine where the fire comes from based on direction
        const fireX = facingLeft ? dragon.x : dragon.x + dragon.width;
        
        // Yellow outer flame
        gameCore.ctx.fillStyle = 'yellow';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.15, 
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Orange middle flame
        gameCore.ctx.fillStyle = 'orange';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.1, 
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Red inner flame
        gameCore.ctx.fillStyle = 'red';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
    }
}

// Draw a puppy
function drawPuppy(puppy) {
    if (puppy.saved) return; // Don't draw the puppy if it's already saved
    
    // Adjust position with the offset for shaking (if it exists)
    const puppyX = puppy.x + (puppy.offsetX || 0);
    
    // Puppy body (light brown)
    gameCore.ctx.fillStyle = '#D2B48C'; // Tan color
    gameCore.ctx.fillRect(puppyX, puppy.y, puppy.width, puppy.height);
    
    // Puppy ears (darker brown)
    // Left ear
    gameCore.ctx.fillStyle = '#A0522D';
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(puppyX + puppy.width * 0.1, puppy.y);
    gameCore.ctx.lineTo(puppyX, puppy.y - puppy.height * 0.5);
    gameCore.ctx.lineTo(puppyX + puppy.width * 0.2, puppy.y);
    gameCore.ctx.fill();
    
    // Right ear
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(puppyX + puppy.width * 0.8, puppy.y);
    gameCore.ctx.lineTo(puppyX + puppy.width, puppy.y - puppy.height * 0.5);
    gameCore.ctx.lineTo(puppyX + puppy.width * 0.9, puppy.y);
    gameCore.ctx.fill();
    
    // Puppy eyes (big and cute)
    gameCore.ctx.fillStyle = 'black';
    // Left eye
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.3, 
        puppy.y + puppy.height * 0.3, 
        puppy.width * 0.12, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // White of the eye
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.28, 
        puppy.y + puppy.height * 0.28, 
        puppy.width * 0.04, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Right eye
    gameCore.ctx.fillStyle = 'black';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.7, 
        puppy.y + puppy.height * 0.3, 
        puppy.width * 0.12, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // White of the eye
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.68, 
        puppy.y + puppy.height * 0.28, 
        puppy.width * 0.04, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Puppy nose
    gameCore.ctx.fillStyle = 'black';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.5, 
        puppy.y + puppy.height * 0.5, 
        puppy.width * 0.1, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Puppy tail
    gameCore.ctx.fillStyle = '#D2B48C';
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(puppyX, puppy.y + puppy.height * 0.5);
    gameCore.ctx.quadraticCurveTo(
        puppyX - puppy.width * 0.3, puppy.y + puppy.height * 0.3, 
        puppyX - puppy.width * 0.2, puppy.y + puppy.height * 0.7
    );
    gameCore.ctx.quadraticCurveTo(
        puppyX - puppy.width * 0.1, puppy.y + puppy.height * 0.8, 
        puppyX, puppy.y + puppy.height * 0.6
    );
    gameCore.ctx.fill();
    
    // Draw a small SOS text bubble above the puppy to indicate it needs help
    if (!gameCore.gameState.gameOver) {
        const bubbleWidth = puppy.width * 1.2;
        const bubbleHeight = puppy.height * 0.6;
        const bubbleX = puppyX - (bubbleWidth - puppy.width) / 2;
        const bubbleY = puppy.y - bubbleHeight - 15;
        
        // Add a small trembling effect to the SOS text bubble
        const time = Date.now() / 150;
        const trembleX = Math.sin(time) * 1.5;
        const trembleY = Math.cos(time * 1.5) * 1;
        
        // Draw the text bubble
        gameCore.ctx.fillStyle = 'white';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(
            bubbleX + bubbleWidth/2 + trembleX, 
            bubbleY + bubbleHeight/2 + trembleY, 
            bubbleWidth/2, 
            bubbleHeight/2, 
            0, 0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Draw the triangle pointing to the puppy
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(bubbleX + bubbleWidth/2 - 5 + trembleX, bubbleY + bubbleHeight + trembleY);
        gameCore.ctx.lineTo(bubbleX + bubbleWidth/2 + 5 + trembleX, bubbleY + bubbleHeight + trembleY);
        gameCore.ctx.lineTo(puppyX + puppy.width/2, puppy.y);
        gameCore.ctx.fill();
        
        // Draw "Help!" in the text bubble
        gameCore.ctx.fillStyle = 'red';
        gameCore.ctx.font = '10px Arial';
        gameCore.ctx.textAlign = 'center';
        gameCore.ctx.fillText('Help!', bubbleX + bubbleWidth/2 + trembleX, bubbleY + bubbleHeight/2 + 4 + trembleY);
        
        // Animated footprints for the puppy to indicate it's moving
        const footprintTime = Date.now() / 500;
        // Only draw when sin is approximately 1 (so only occasionally)
        if (Math.sin(footprintTime) > 0.9) {
            gameCore.ctx.fillStyle = 'rgba(165, 42, 42, 0.3)'; // Dark red footprints
            // Different positions for paw prints
            const positions = [
                {x: puppyX - 10, y: puppy.y + puppy.height + 5},
                {x: puppyX - 15, y: puppy.y + puppy.height + 8},
                {x: puppyX - 20, y: puppy.y + puppy.height + 3}
            ];
            
            // Draw small paw prints
            positions.forEach(pos => {
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                gameCore.ctx.fill();
            });
        }
    }
}

function drawSquirrel(player) {
    // Determine direction based on movement
    const facingLeft = player.velX < 0;
    
    // Body
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Eyes (position depends on direction)
    gameCore.ctx.fillStyle = "white";
    if (facingLeft) {
        // Eyes left
        gameCore.ctx.fillRect(player.x + player.width * 0.15, player.y + player.height * 0.2, player.width * 0.15, player.height * 0.15);
    } else {
        // Eyes right (default)
        gameCore.ctx.fillRect(player.x + player.width * 0.7, player.y + player.height * 0.2, player.width * 0.15, player.height * 0.15);
    }
    
    // Tail (position depends on direction)
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Tail right
        gameCore.ctx.moveTo(player.x + player.width, player.y + player.height * 0.3);
        gameCore.ctx.quadraticCurveTo(
            player.x + player.width + player.width * 0.5, player.y + player.height * 0.2, 
            player.x + player.width + player.width * 0.3, player.y + player.height * 0.5
        );
        gameCore.ctx.quadraticCurveTo(
            player.x + player.width + player.width * 0.2, player.y + player.height * 0.8, 
            player.x + player.width, player.y + player.height * 0.7
        );
    } else {
        // Tail left (default)
        gameCore.ctx.moveTo(player.x, player.y + player.height * 0.3);
        gameCore.ctx.quadraticCurveTo(
            player.x - player.width * 0.5, player.y + player.height * 0.2, 
            player.x - player.width * 0.3, player.y + player.height * 0.5
        );
        gameCore.ctx.quadraticCurveTo(
            player.x - player.width * 0.2, player.y + player.height * 0.8, 
            player.x, player.y + player.height * 0.7
        );
    }
    
    gameCore.ctx.fill();
}

function drawTurtle(player) {
    // Determine direction based on movement
    const facingLeft = player.velX < 0;
    
    // Check if the turtle is underwater 
    // and only then subtract oxygen
    if (player.oxygenLevel !== undefined && player.isUnderwater) {
        // Decrease oxygen more slowly (4x slower than originally)
        player.oxygenLevel = Math.max(0, player.oxygenLevel - 0.25);
        console.log("Turtle oxygen level underwater: " + player.oxygenLevel);
    }
    
    // Draw oxygen meter above the turtle, but only if it's not 100%
    if (player.oxygenLevel !== undefined && player.oxygenLevel < player.maxOxygenLevel) {
        const meterWidth = player.width * 1.2;
        const meterHeight = 5;
        const meterX = player.x - (meterWidth - player.width) / 2;
        const meterY = player.y - 15;
        
        // Background of the meter
        gameCore.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        gameCore.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Actual oxygen
        const fillWidth = (player.oxygenLevel / player.maxOxygenLevel) * meterWidth;
        
        // Color based on oxygen level
        let meterColor;
        if (player.oxygenLevel > 70) {
            meterColor = 'rgb(0, 255, 255)'; // Cyan
        } else if (player.oxygenLevel > 30) {
            meterColor = 'rgb(0, 191, 255)'; // Deep blue
        } else {
            meterColor = 'rgb(0, 0, 255)'; // Blue
        }
        
        gameCore.ctx.fillStyle = meterColor;
        gameCore.ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
        
        // Also check for game-over condition (when oxygen is depleted)
        if (player.oxygenLevel <= 0) {
            player.loseLife();
            player.oxygenLevel = player.maxOxygenLevel * 0.3; // Reset to 30% after losing a life
        }
        
        // Check if oxygen is almost depleted (below 30%)
        if (player.oxygenLevel < 30 && !player.lowOxygenWarning) {
            gameCore.gameState.message = "The turtle needs oxygen! Swim to the surface!";
            player.lowOxygenWarning = true;
            
            // Clear message after 2 seconds
            setTimeout(() => {
                if (gameCore.gameState.message === "The turtle needs oxygen! Swim to the surface!") {
                    gameCore.gameState.message = "";
                }
            }, 2000);
        }
        
        // Draw bubble effect, but only if the turtle is underwater
        if (player.isUnderwater) {
            const time = Date.now() / 1000;
            // Draw bubbles around the turtle's head (larger and more visible bubbles)
            for (let i = 0; i < 5; i++) {
                const bubbleX = player.x + player.width * (facingLeft ? 0.2 : 0.8) + Math.sin(time * 2 + i) * 5;
                const bubbleY = player.y + player.height * 0.2 - (time * 5 + i * 10) % 30;
                const size = 3 + Math.sin(time + i) * 2; // Larger bubbles
                
                gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // More visible
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
                gameCore.ctx.fill();
            }
        }
    }
    
    // Shell
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.beginPath();
    gameCore.ctx.ellipse(
        player.x + player.width/2, 
        player.y + player.height/2, 
        player.width/2, 
        player.height/2, 
        0, 0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Shell pattern
    gameCore.ctx.fillStyle = "#006400";
    gameCore.ctx.beginPath();
    gameCore.ctx.ellipse(
        player.x + player.width/2, 
        player.y + player.height/2, 
        player.width/3, 
        player.height/3, 
        0, 0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Head (position depends on direction)
    gameCore.ctx.fillStyle = "#00804A";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Head left
        gameCore.ctx.ellipse(
            player.x + player.width * 0.2, 
            player.y + player.height * 0.3, 
            player.width * 0.25, 
            player.height * 0.25, 
            0, 0, Math.PI * 2
        );
    } else {
        // Head right (default)
        gameCore.ctx.ellipse(
            player.x + player.width * 0.8, 
            player.y + player.height * 0.3, 
            player.width * 0.25, 
            player.height * 0.25, 
            0, 0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Legs (only visible when the turtle is moving)
    if (player.velX !== 0 || player.velY !== 0) {
        gameCore.ctx.fillStyle = "#00804A";
        
        if (facingLeft) {
            // Front leg left
            gameCore.ctx.fillRect(
                player.x + player.width * 0.2, 
                player.y + player.height * 0.6, 
                player.width * 0.15, 
                player.height * 0.3
            );
            
            // Back leg right
            gameCore.ctx.fillRect(
                player.x + player.width * 0.7, 
                player.y + player.height * 0.6, 
                player.width * 0.15, 
                player.height * 0.3
            );
        } else {
            // Front leg right (default)
            gameCore.ctx.fillRect(
                player.x + player.width * 0.8, 
                player.y + player.height * 0.6, 
                player.width * 0.15, 
                player.height * 0.3
            );
            
            // Back leg left (default)
            gameCore.ctx.fillRect(
                player.x + player.width * 0.2, 
                player.y + player.height * 0.6, 
                player.width * 0.15, 
                player.height * 0.3
            );
        }
    }
}

function drawUnicorn(player) {
    // Determine direction based on movement
    const facingLeft = player.velX < 0;
    
    // Draw flying meter above the unicorn, but only if it's not 100%
    if (player.flyingPower !== undefined && player.flyingPower < player.flyingPowerMax) {
        const meterWidth = player.width * 1.2;
        const meterHeight = 5;
        const meterX = player.x - (meterWidth - player.width) / 2;
        const meterY = player.y - 15;
        
        // Background of the meter
        gameCore.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        gameCore.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Actual flying power
        const fillWidth = (player.flyingPower / player.flyingPowerMax) * meterWidth;
        
        // Color based on flying power level
        let meterColor;
        if (player.flyingPower > 70) {
            meterColor = 'rgb(0, 255, 0)'; // Green
        } else if (player.flyingPower > 30) {
            meterColor = 'rgb(255, 255, 0)'; // Yellow
        } else {
            meterColor = 'rgb(255, 0, 0)'; // Red
        }
        
        gameCore.ctx.fillStyle = meterColor;
        gameCore.ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
    }
    
    // Base body (oval)
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.beginPath();
    gameCore.ctx.ellipse(
        player.x + player.width/2, 
        player.y + player.height/2, 
        player.width/2, 
        player.height/2, 
        0, 0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Mane (rainbow colors) - position depends on direction
    const maneColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
    
    if (facingLeft) {
        // Mane on the right side
        for (let i = 0; i < 7; i++) {
            gameCore.ctx.fillStyle = maneColors[i];
            gameCore.ctx.beginPath();
            gameCore.ctx.ellipse(
                player.x + player.width * 0.7 + i * 2, 
                player.y + player.height * 0.3,
                7 - i, 
                15 - i, 
                0, 0, Math.PI * 2
            );
            gameCore.ctx.fill();
        }
    } else {
        // Mane on the left side (default)
        for (let i = 0; i < 7; i++) {
            gameCore.ctx.fillStyle = maneColors[i];
            gameCore.ctx.beginPath();
            gameCore.ctx.ellipse(
                player.x + player.width * 0.3 - i * 2, 
                player.y + player.height * 0.3,
                7 - i, 
                15 - i, 
                0, 0, Math.PI * 2
            );
            gameCore.ctx.fill();
        }
    }
    
    // Horn (golden color) - position depends on direction
    gameCore.ctx.fillStyle = "#FFD700";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Horn left
        gameCore.ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.1, player.y - player.height * 0.2);
        gameCore.ctx.lineTo(player.x + player.width * 0.2, player.y + player.height * 0.1);
    } else {
        // Horn right (default)
        gameCore.ctx.moveTo(player.x + player.width * 0.7, player.y + player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.9, player.y - player.height * 0.2);
        gameCore.ctx.lineTo(player.x + player.width * 0.8, player.y + player.height * 0.1);
    }
    
    gameCore.ctx.fill();
    
    // Legs - position depends on direction
    gameCore.ctx.fillStyle = "#E56BF7";
    
    if (facingLeft) {
        // Legs mirrored
        // Front leg left
        gameCore.ctx.fillRect(
            player.x + player.width * 0.3, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
        // Back leg right
        gameCore.ctx.fillRect(
            player.x + player.width * 0.8, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
    } else {
        // Legs default
        // Front leg right
        gameCore.ctx.fillRect(
            player.x + player.width * 0.7, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
        // Back leg left
        gameCore.ctx.fillRect(
            player.x + player.width * 0.2, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
    }
    
    // Eye - position depends on direction
    gameCore.ctx.fillStyle = "white";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Eye left
        gameCore.ctx.arc(
            player.x + player.width * 0.3, 
            player.y + player.height * 0.3, 
            player.width * 0.1, 
            0, Math.PI * 2
        );
    } else {
        // Eye right (default)
        gameCore.ctx.arc(
            player.x + player.width * 0.7, 
            player.y + player.height * 0.3, 
            player.width * 0.1, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Pupil
    gameCore.ctx.fillStyle = "black";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Pupil left
        gameCore.ctx.arc(
            player.x + player.width * 0.28, 
            player.y + player.height * 0.3, 
            player.width * 0.05, 
            0, Math.PI * 2
        );
    } else {
        // Pupil right (default)
        gameCore.ctx.arc(
            player.x + player.width * 0.72, 
            player.y + player.height * 0.3, 
            player.width * 0.05, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Flying glitters if the unicorn is flying
    if (player.flying) {
        const time = Date.now() / 100; // For animation
        for (let i = 0; i < 7; i++) {
            const angle = (time / 50 + i) % (Math.PI * 2);
            const distance = 15 + Math.sin(time / 30 + i) * 5;
            
            const x = player.x + player.width/2 + Math.cos(angle) * distance;
            const y = player.y + player.height/2 + Math.sin(angle) * distance;
            
            gameCore.ctx.fillStyle = maneColors[i % maneColors.length];
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(x, y, 2 + Math.sin(time / 20 + i) * 1, 0, Math.PI * 2);
            gameCore.ctx.fill();
        }
    }
}

// Draw the cat
function drawCat(player) {
    // Determine direction based on movement
    const facingLeft = player.velX < 0;
    
    // Body
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Head (slightly lighter gray)
    gameCore.ctx.fillStyle = '#aaaaaa';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Head left
        gameCore.ctx.arc(
            player.x + player.width * 0.3, 
            player.y + player.height * 0.3, 
            player.width * 0.25, 
            0, Math.PI * 2
        );
    } else {
        // Head right (default)
        gameCore.ctx.arc(
            player.x + player.width * 0.7, 
            player.y + player.height * 0.3, 
            player.width * 0.25, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Ears (triangular)
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Left ear
        gameCore.ctx.moveTo(player.x + player.width * 0.2, player.y + player.height * 0.15);
        gameCore.ctx.lineTo(player.x + player.width * 0.1, player.y - player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.3, player.y + player.height * 0.1);
        
        // Right ear
        gameCore.ctx.moveTo(player.x + player.width * 0.4, player.y + player.height * 0.15);
        gameCore.ctx.lineTo(player.x + player.width * 0.3, player.y - player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.5, player.y + player.height * 0.1);
    } else {
        // Right ear
        gameCore.ctx.moveTo(player.x + player.width * 0.8, player.y + player.height * 0.15);
        gameCore.ctx.lineTo(player.x + player.width * 0.9, player.y - player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.1);
        
        // Left ear
        gameCore.ctx.moveTo(player.x + player.width * 0.6, player.y + player.height * 0.15);
        gameCore.ctx.lineTo(player.x + player.width * 0.7, player.y - player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.5, player.y + player.height * 0.1);
    }
    
    gameCore.ctx.fill();
    
    // Eyes (yellow with black pupils)
    if (facingLeft) {
        // Left eye
        gameCore.ctx.fillStyle = 'yellow';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(
            player.x + player.width * 0.25, 
            player.y + player.height * 0.25, 
            player.width * 0.08, 
            player.height * 0.06, 
            0, 0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Pupil
        gameCore.ctx.fillStyle = 'black';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(
            player.x + player.width * 0.25, 
            player.y + player.height * 0.25, 
            player.width * 0.03, 
            player.height * 0.05, 
            0, 0, Math.PI * 2
        );
        gameCore.ctx.fill();
    } else {
        // Right eye
        gameCore.ctx.fillStyle = 'yellow';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(
            player.x + player.width * 0.75, 
            player.y + player.height * 0.25, 
            player.width * 0.08, 
            player.height * 0.06, 
            0, 0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Pupil
        gameCore.ctx.fillStyle = 'black';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(
            player.x + player.width * 0.75, 
            player.y + player.height * 0.25, 
            player.width * 0.03, 
            player.height * 0.05, 
            0, 0, Math.PI * 2
        );
        gameCore.ctx.fill();
    }
    
    // Snout
    gameCore.ctx.fillStyle = '#dddddd'; // Light white/gray
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        gameCore.ctx.arc(
            player.x + player.width * 0.2, 
            player.y + player.height * 0.35, 
            player.width * 0.1, 
            0, Math.PI * 2
        );
    } else {
        gameCore.ctx.arc(
            player.x + player.width * 0.8, 
            player.y + player.height * 0.35, 
            player.width * 0.1, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Nose
    gameCore.ctx.fillStyle = '#FF69B4'; // Pink for the nose
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        gameCore.ctx.arc(
            player.x + player.width * 0.15, 
            player.y + player.height * 0.32, 
            player.width * 0.03, 
            0, Math.PI * 2
        );
    } else {
        gameCore.ctx.arc(
            player.x + player.width * 0.85, 
            player.y + player.height * 0.32, 
            player.width * 0.03, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Whiskers
    gameCore.ctx.strokeStyle = 'white';
    gameCore.ctx.lineWidth = 1;
    
    if (facingLeft) {
        // Left
        for (let i = 0; i < 3; i++) {
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(player.x + player.width * 0.15, player.y + player.height * (0.32 + i * 0.03));
            gameCore.ctx.lineTo(player.x - player.width * 0.1, player.y + player.height * (0.28 + i * 0.05));
            gameCore.ctx.stroke();
        }
    } else {
        // Right
        for (let i = 0; i < 3; i++) {
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(player.x + player.width * 0.85, player.y + player.height * (0.32 + i * 0.03));
            gameCore.ctx.lineTo(player.x + player.width * 1.1, player.y + player.height * (0.28 + i * 0.05));
            gameCore.ctx.stroke();
        }
    }
    
    // Tail
    gameCore.ctx.strokeStyle = player.color;
    gameCore.ctx.lineWidth = 5;
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Tail right
        gameCore.ctx.moveTo(player.x + player.width, player.y + player.height * 0.5);
        gameCore.ctx.bezierCurveTo(
            player.x + player.width * 1.3, player.y + player.height * 0.3,
            player.x + player.width * 1.5, player.y + player.height * 0.6,
            player.x + player.width * 1.2, player.y + player.height * 0.8
        );
    } else {
        // Tail left
        gameCore.ctx.moveTo(player.x, player.y + player.height * 0.5);
        gameCore.ctx.bezierCurveTo(
            player.x - player.width * 0.3, player.y + player.height * 0.3,
            player.x - player.width * 0.5, player.y + player.height * 0.6,
            player.x - player.width * 0.2, player.y + player.height * 0.8
        );
    }
    
    gameCore.ctx.stroke();
    
    // Legs
    gameCore.ctx.fillStyle = player.color;
    
    if (facingLeft) {
        // Front leg left
        gameCore.ctx.fillRect(
            player.x + player.width * 0.25, 
            player.y + player.height * 0.7, 
            player.width * 0.15, 
            player.height * 0.3
        );
        // Back leg right
        gameCore.ctx.fillRect(
            player.x + player.width * 0.75, 
            player.y + player.height * 0.7, 
            player.width * 0.15, 
            player.height * 0.3
        );
    } else {
        // Front leg right
        gameCore.ctx.fillRect(
            player.x + player.width * 0.75, 
            player.y + player.height * 0.7, 
            player.width * 0.15, 
            player.height * 0.3
        );
        // Back leg left
        gameCore.ctx.fillRect(
            player.x + player.width * 0.25, 
            player.y + player.height * 0.7, 
            player.width * 0.15, 
            player.height * 0.3
        );
    }
    
    // Draw claws if they are active
    if (player.clawActive) {
        gameCore.ctx.fillStyle = '#444444'; // Dark gray for claws
        
        if (facingLeft) {
            // Claws left
            for (let i = 0; i < 3; i++) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(player.x + player.width * 0.25, player.y + player.height * 0.97);
                gameCore.ctx.lineTo(player.x + player.width * (0.2 - i * 0.05), player.y + player.height * 1.1);
                gameCore.ctx.lineTo(player.x + player.width * (0.25 - i * 0.05), player.y + player.height * 1.1);
                gameCore.ctx.closePath();
                gameCore.ctx.fill();
            }
        } else {
            // Claws right
            for (let i = 0; i < 3; i++) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(player.x + player.width * 0.9, player.y + player.height * 0.97);
                gameCore.ctx.lineTo(player.x + player.width * (0.95 + i * 0.05), player.y + player.height * 1.1);
                gameCore.ctx.lineTo(player.x + player.width * (1.0 + i * 0.05), player.y + player.height * 1.1);
                gameCore.ctx.closePath();
                gameCore.ctx.fill();
            }
        }
        
        // Claw effect around the cat
        gameCore.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        gameCore.ctx.lineWidth = 3;
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width * 0.8,
            0, Math.PI * 2
        );
        gameCore.ctx.stroke();
    }
}

// Function to draw fire breath for players
function drawFireBreath(player) {
    if (!player.isBreathingFire) return;
    
    const time = Date.now() / 100;
    // Determine where the fire comes from based on direction
    const facingLeft = !player.facingRight;
    const fireStartX = facingLeft ? player.x : player.x + player.width;
    const fireDirection = facingLeft ? -1 : 1;
    
    // Get intensity factor (0-100 normal, up to 150 at peak)
    const intensityFactor = player.fireBreathingIntensity / 100;
    
    // Fire length and width parameters - modified by intensity
    const baseLength = player.width * 2.0; // Base length 
    const fireLength = baseLength * intensityFactor; // Scales with intensity
    const fireWidth = player.height * 0.9 * intensityFactor; // 90% of player height, scaled
    const maxOffset = 5 * intensityFactor; // For flame flickering effect
    
    // Calculate flickering effect - more intense with higher intensity
    const flickerOffset = Math.sin(time) * maxOffset;
    const flameSpread = Math.cos(time * 0.7) * (maxOffset * 0.5);
    
    // Transparency and glow based on intensity
    const baseOpacity = Math.min(0.7, intensityFactor * 0.7);
    
    // Debug visualization of fire hitbox if needed
    if (window.debugMode) {
        // Fire hitbox for collision detection
        const fireHitbox = {
            x: facingLeft ? fireStartX - fireLength : fireStartX,
            y: player.y + player.height * 0.1,
            width: fireLength,
            height: fireWidth
        };
        
        // Debug visualization of the hitbox
        gameCore.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        gameCore.ctx.lineWidth = 2;
        gameCore.ctx.strokeRect(
            fireHitbox.x, 
            fireHitbox.y, 
            fireHitbox.width, 
            fireHitbox.height
        );
    }
    
    // Draw the flame using a cone shape (triangle with curved base)
    // Yellow outer flame
    gameCore.ctx.fillStyle = `rgba(255, 255, 0, ${baseOpacity})`;
    gameCore.ctx.beginPath();
    // Start at the mouth position
    gameCore.ctx.moveTo(fireStartX, player.y + player.height * 0.3);
    // Top point of the flame
    gameCore.ctx.quadraticCurveTo(
        fireStartX + fireDirection * (fireLength * 0.6), 
        player.y + player.height * (0.1 - intensityFactor * 0.05) + flickerOffset,
        fireStartX + fireDirection * fireLength, 
        player.y + player.height * 0.2 + flameSpread
    );
    // Bottom point of the flame
    gameCore.ctx.quadraticCurveTo(
        fireStartX + fireDirection * (fireLength * 0.6), 
        player.y + player.height * (0.5 + intensityFactor * 0.05) - flickerOffset,
        fireStartX, 
        player.y + player.height * 0.3
    );
    gameCore.ctx.closePath();
    gameCore.ctx.fill();
    
    // Orange middle flame (slightly smaller)
    gameCore.ctx.fillStyle = `rgba(255, 165, 0, ${baseOpacity + 0.1})`;
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(fireStartX, player.y + player.height * 0.3);
    gameCore.ctx.quadraticCurveTo(
        fireStartX + fireDirection * (fireLength * 0.5), 
        player.y + player.height * (0.15 - intensityFactor * 0.02) + flickerOffset,
        fireStartX + fireDirection * (fireLength * 0.85), 
        player.y + player.height * 0.25 + flameSpread * 0.8
    );
    gameCore.ctx.quadraticCurveTo(
        fireStartX + fireDirection * (fireLength * 0.5), 
        player.y + player.height * (0.45 + intensityFactor * 0.02) - flickerOffset,
        fireStartX, 
        player.y + player.height * 0.3
    );
    gameCore.ctx.closePath();
    gameCore.ctx.fill();
    
    // Red inner flame (smallest)
    gameCore.ctx.fillStyle = `rgba(255, 0, 0, ${baseOpacity + 0.2})`;
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(fireStartX, player.y + player.height * 0.3);
    gameCore.ctx.quadraticCurveTo(
        fireStartX + fireDirection * (fireLength * 0.4), 
        player.y + player.height * 0.2 + flickerOffset/2,
        fireStartX + fireDirection * (fireLength * 0.7), 
        player.y + player.height * 0.3 + flameSpread * 0.5
    );
    gameCore.ctx.quadraticCurveTo(
        fireStartX + fireDirection * (fireLength * 0.4), 
        player.y + player.height * 0.4 - flickerOffset/2,
        fireStartX, 
        player.y + player.height * 0.3
    );
    gameCore.ctx.closePath();
    gameCore.ctx.fill();
    
    // Add some fire particles for extra effect - more particles at higher intensity
    const particleCount = Math.floor(5 + intensityFactor * 5); // 5-15 particles based on intensity
    for (let i = 0; i < particleCount; i++) {
        const particleSize = (3 + Math.random() * 4) * Math.min(1.5, intensityFactor);
        // Particles stretch further with higher intensity
        const particleDistanceFactor = Math.pow(Math.random(), 0.7); // Weight toward far end
        const particleX = fireStartX + fireDirection * (particleDistanceFactor * fireLength);
        const particleY = player.y + player.height * 0.3 + (Math.random() - 0.5) * fireWidth * 0.8;
        
        // Particle color (yellow to red) - with intensity-based opacity
        const colors = [
            `rgba(255,255,0,${baseOpacity})`, 
            `rgba(255,165,0,${baseOpacity + 0.1})`, 
            `rgba(255,0,0,${baseOpacity + 0.2})`
        ];
        gameCore.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
    
    // Add an extra glow effect at high intensity
    if (intensityFactor > 1.0) {
        // Extra glow for the peak phase
        const glowIntensity = (intensityFactor - 1.0) * 0.3; // 0-0.15 range
        gameCore.ctx.fillStyle = `rgba(255, 220, 50, ${glowIntensity})`;
        gameCore.ctx.beginPath();
        
        // Large soft glow around the flame
        const glowX = fireStartX + fireDirection * (fireLength * 0.5);
        const glowY = player.y + player.height * 0.3;
        const glowRadius = fireLength * 0.7;
        
        gameCore.ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
}

// Export the render functions
window.gameCharacters = {
    drawPlayer,
    drawEnemies,
    drawLion,
    drawDragon,
    drawPuppy,
    drawSquirrel,
    drawTurtle,
    drawUnicorn,
    drawCat,
    drawFireBreath
};