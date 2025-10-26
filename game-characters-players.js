// game-characters-players.js
// Contains rendering functions for playable characters

// Draw the squirrel
function drawSquirrel(player) {
    // Determine direction based on player's facingRight property
    const facingLeft = !player.facingRight;
    
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

// Draw the turtle
function drawTurtle(player) {
    // Determine direction based on player's facingRight property
    const facingLeft = !player.facingRight;
    
    // Check if the turtle is underwater 
    // and only then subtract oxygen
    if (player.oxygenLevel !== undefined && player.isUnderwater) {
        // Decrease oxygen more slowly (4x slower than originally)
        player.oxygenLevel = Math.max(0, player.oxygenLevel - 0.25);
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

// Draw the unicorn
function drawUnicorn(player) {
    // Determine direction based on player's facingRight property
    const facingLeft = !player.facingRight;
    
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
    // Determine direction based on player's facingRight property
    const facingLeft = !player.facingRight;
    
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
        // Use dark gray for claws to match the cat's color
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
        
        // Add rotating slashing lines to better visualize the attack
        const time = Date.now() / 50; // Fast rotation - more aggressive
        
        // Add multiple rotating slash lines for better attack visualization
        gameCore.ctx.strokeStyle = 'rgba(120, 120, 120, 0.85)';
        gameCore.ctx.lineWidth = 3;
        
        // Draw 8 rotating lines to create a more aggressive slashing effect
        for (let i = 0; i < 8; i++) {
            // Base angle with fast rotation
            const baseAngle = time + (i * Math.PI / 4); 
            
            // Add some oscillation for more dynamic movement
            const angle = baseAngle + Math.sin(time * 2) * 0.2;
            
            // Make radius pulsate slightly
            const radiusPulse = Math.sin(time * 3) * 0.15;
            const innerRadius = player.width * (0.4 + radiusPulse);
            const outerRadius = player.width * (1.1 + radiusPulse);
            
            const startX = player.x + player.width/2 + Math.cos(angle) * innerRadius;
            const startY = player.y + player.height/2 + Math.sin(angle) * innerRadius;
            const endX = player.x + player.width/2 + Math.cos(angle) * outerRadius;
            const endY = player.y + player.height/2 + Math.sin(angle) * outerRadius;
            
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(startX, startY);
            gameCore.ctx.lineTo(endX, endY);
            gameCore.ctx.stroke();
        }
        
        // Add a slashing circle to connect the lines
        gameCore.ctx.strokeStyle = 'rgba(120, 120, 120, 0.4)';
        gameCore.ctx.lineWidth = 1;
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width * 1.0, // Larger radius for visibility
            0, Math.PI * 2
        );
        gameCore.ctx.stroke();
        
        // Check if there are any enemies in the current level
        const currentLevelData = gameCore.currentLevel;
        const enemies = currentLevelData.enemies || [];
        
        // Only show blood effects if there are enemies being hit
        let enemyHit = false;
        
        // Detect if any enemies are within the claw attack radius
        for (let enemy of enemies) {
            // Calculate distance from cat center to enemy center
            const catCenterX = player.x + player.width/2;
            const catCenterY = player.y + player.height/2;
            const enemyCenterX = enemy.x + enemy.width/2;
            const enemyCenterY = enemy.y + enemy.height/2;
            
            const distance = Math.sqrt(
                Math.pow(catCenterX - enemyCenterX, 2) + 
                Math.pow(catCenterY - enemyCenterY, 2)
            );
            
            // If enemy is within attack range and not already affected
            if (distance < player.width * 1.2 && !enemy.clawEffect) {
                enemyHit = true;
                break;
            }
        }
        
        // Only show blood effects if an enemy is being hit
        if (enemyHit) {
            // Blood splatter effect coming from edges of attack radius
            for (let i = 0; i < 8; i++) {
                // Calculate a random position at the edge of the attack radius
                const angle = Math.random() * Math.PI * 2;
                const distance = player.width * (0.9 + Math.random() * 0.2);
                
                const splatterX = player.x + player.width/2 + Math.cos(angle) * distance;
                const splatterY = player.y + player.height/2 + Math.sin(angle) * distance;
                const splatterSize = 2 + Math.random() * 3;
                
                // Draw blood splatter
                gameCore.ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(splatterX, splatterY, splatterSize, 0, Math.PI * 2);
                gameCore.ctx.fill();
                
                // Draw small blood streaks from the splatters
                const streakLength = 5 + Math.random() * 8;
                const streakEndX = splatterX + Math.cos(angle) * streakLength;
                const streakEndY = splatterY + Math.sin(angle) * streakLength;
                
                gameCore.ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
                gameCore.ctx.lineWidth = 1 + Math.random();
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(splatterX, splatterY);
                gameCore.ctx.lineTo(streakEndX, streakEndY);
                gameCore.ctx.stroke();
            }
        }
        
        // Text above cat showing it's using claws
        gameCore.ctx.fillStyle = 'white';
        gameCore.ctx.font = 'bold 14px Arial';
        gameCore.ctx.textAlign = 'center';
        gameCore.ctx.strokeStyle = 'black';
        gameCore.ctx.lineWidth = 2;
        
        // Draw text with outline for better visibility
        gameCore.ctx.strokeText('SLASH!', player.x + player.width/2, player.y - 15);
        gameCore.ctx.fillText('SLASH!', player.x + player.width/2, player.y - 15);
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

// Draw the mole
function drawMole(player) {
    // Determine direction based on player's facingRight property
    const facingLeft = !player.facingRight;
    
    // Body (dark brown)
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Snout (lighter brown)
    gameCore.ctx.fillStyle = "#8B6C42";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Snout left
        gameCore.ctx.arc(
            player.x + player.width * 0.2, 
            player.y + player.height * 0.4, 
            player.width * 0.18, 
            0, Math.PI * 2
        );
    } else {
        // Snout right
        gameCore.ctx.arc(
            player.x + player.width * 0.8, 
            player.y + player.height * 0.4, 
            player.width * 0.18, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Nose (pink)
    gameCore.ctx.fillStyle = "#FF9E9E";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        gameCore.ctx.arc(
            player.x + player.width * 0.1, 
            player.y + player.height * 0.4, 
            player.width * 0.07, 
            0, Math.PI * 2
        );
    } else {
        gameCore.ctx.arc(
            player.x + player.width * 0.9, 
            player.y + player.height * 0.4, 
            player.width * 0.07, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Eyes (small black dots)
    gameCore.ctx.fillStyle = "black";
    
    if (facingLeft) {
        // Left eye
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            player.x + player.width * 0.3, 
            player.y + player.height * 0.25, 
            player.width * 0.06, 
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
    } else {
        // Right eye
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            player.x + player.width * 0.7, 
            player.y + player.height * 0.25, 
            player.width * 0.06, 
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
    }
    
    // Paws/feet - drawn before digging animation so claws appear on top
    gameCore.ctx.fillStyle = "#614126"; // Darker brown for paws
    
    if (facingLeft) {
        // Front paw left
        gameCore.ctx.fillRect(
            player.x + player.width * 0.1, 
            player.y + player.height * 0.7, 
            player.width * 0.2, 
            player.height * 0.3
        );
        // Back paw right
        gameCore.ctx.fillRect(
            player.x + player.width * 0.7, 
            player.y + player.height * 0.7, 
            player.width * 0.2, 
            player.height * 0.3
        );
    } else {
        // Front paw right
        gameCore.ctx.fillRect(
            player.x + player.width * 0.7, 
            player.y + player.height * 0.7, 
            player.width * 0.2, 
            player.height * 0.3
        );
        // Back paw left
        gameCore.ctx.fillRect(
            player.x + player.width * 0.1, 
            player.y + player.height * 0.7, 
            player.width * 0.2, 
            player.height * 0.3
        );
    }
    
    // Draw digging energy meter
    if (typeof player.drawDiggingEnergyMeter === 'function') {
        player.drawDiggingEnergyMeter();
    }
    
    // Enhanced digging animation
    if (player.showDigParticles || player.isDigging) {
        const time = Date.now() / 50; // Faster animation
        
        // Digging dirt particles - more dynamic and faster
        gameCore.ctx.fillStyle = "#8B4513"; // Dirt color
        
        // More particles for a more impressive effect
        const particleCount = 12;
        const digDirectionX = facingLeft ? -1 : 1;
        
        // Calculate digging center point
        let digCenterX = facingLeft ? player.x : player.x + player.width;
        let digCenterY = player.y + player.height * 0.6;
        
        // If in the middle of digging through something, adjust the particle position
        if (player.diggingProgress > 0 && player.diggingTarget) {
            // Make particles come from the digging point
            const progress = player.diggingProgress / 100;
            
            // Adjust center based on how far into the wall/ground the mole is
            digCenterX = player.x + (facingLeft ? 0 : player.width);
            
            // Draw cracking effect in the target wall/ground
            if (player.diggingTarget) {
                if (player.diggingTarget.type === "GROUND") {
                    // Ground cracks
                    gameCore.ctx.strokeStyle = "#5D4037";
                    gameCore.ctx.lineWidth = 1.5;
                    
                    for (let i = 0; i < 5; i++) {
                        const crackLength = 8 + progress * 10;
                        const startX = player.x + player.width/2 + (Math.random() - 0.5) * player.width * 0.3;
                        const startY = player.y + player.height - 2;
                        
                        gameCore.ctx.beginPath();
                        gameCore.ctx.moveTo(startX, startY);
                        
                        // Create a jagged crack going downward
                        let currentX = startX;
                        let currentY = startY;
                        
                        for (let j = 0; j < 3; j++) {
                            currentX += (Math.random() - 0.5) * 4;
                            currentY += crackLength/3;
                            gameCore.ctx.lineTo(currentX, currentY);
                        }
                        
                        gameCore.ctx.stroke();
                    }
                } else {
                    // Wall cracks (horizontal)
                    gameCore.ctx.strokeStyle = "#5D4037";
                    gameCore.ctx.lineWidth = 1.5;
                    
                    const wallX = facingLeft ? 
                        player.diggingTarget.x + player.diggingTarget.width - 2 : 
                        player.diggingTarget.x + 2;
                    
                    for (let i = 0; i < 5; i++) {
                        const crackLength = 8 + progress * 12;
                        const startY = player.y + player.height/2 + (Math.random() - 0.5) * player.height * 0.3;
                        
                        gameCore.ctx.beginPath();
                        gameCore.ctx.moveTo(wallX, startY);
                        
                        // Create a jagged crack in the direction of digging
                        let currentX = wallX;
                        let currentY = startY;
                        
                        for (let j = 0; j < 3; j++) {
                            currentX += digDirectionX * crackLength/3;
                            currentY += (Math.random() - 0.5) * 4;
                            gameCore.ctx.lineTo(currentX, currentY);
                        }
                        
                        gameCore.ctx.stroke();
                    }
                }
            }
        }
        
        // Dirt particles
        for (let i = 0; i < particleCount; i++) {
            // Calculate dynamic angle based on digging direction
            let baseAngle;
            if (facingLeft) {
                baseAngle = Math.PI + Math.PI/4 - Math.PI/2 * Math.random(); // Left-oriented spread
            } else {
                baseAngle = Math.PI/4 - Math.PI/2 * Math.random(); // Right-oriented spread
            }
            
            // Make particles shoot out from center point in a cone shape
            const angle = baseAngle + Math.sin(time / 10 + i) * 0.2;
            
            // Particle distance varies based on animation frame
            const maxDistance = 20 + Math.sin(time / 20 + i * 0.7) * 8;
            const distance = Math.random() * maxDistance;
            
            // Calculate particle position
            const x = digCenterX + Math.cos(angle) * distance;
            const y = digCenterY + Math.sin(angle) * distance * 0.7; // Slightly flattened vertically
            
            // Vary particle size for more natural look
            const size = 1 + Math.random() * 3 + Math.sin(time / 15 + i) * 0.5;
            
            // Draw the dirt particle
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(x, y, size, 0, Math.PI * 2);
            gameCore.ctx.fill();
        }
        
        // Draw digging claws - improved animation
        gameCore.ctx.fillStyle = "#555555"; // Dark grey for claws
        
        // Calculate claw angle based on digging motion
        const clawTime = time / 3; // Faster claw movement
        const clawCount = 3; // Number of claws
        
        for (let i = 0; i < clawCount; i++) {
            // Base position for this claw
            const baseY = player.y + player.height * (0.5 + i * 0.15);
            
            // Calculate oscillating movement for digging animation
            const oscillation = Math.sin(clawTime + i * 1.2) * 5;
            const extensionFactor = 0.8 + 0.2 * Math.abs(Math.sin(clawTime + i * 0.7));
            
            if (facingLeft) {
                // Claws on left side with rotation and oscillation
                gameCore.ctx.save();
                
                // Translate to base of claw for rotation
                gameCore.ctx.translate(player.x, baseY);
                
                // Rotate claw based on oscillation
                const rotationAngle = (Math.PI/6) * Math.sin(clawTime + i * 0.9);
                gameCore.ctx.rotate(rotationAngle);
                
                // Draw the claw
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(0, 0); // Base of claw at paw
                gameCore.ctx.lineTo(-player.width * 0.25 * extensionFactor, -oscillation/2);
                gameCore.ctx.lineTo(-player.width * 0.3 * extensionFactor, -oscillation/4);
                gameCore.ctx.lineTo(-player.width * 0.22 * extensionFactor, 0);
                gameCore.ctx.closePath();
                gameCore.ctx.fill();
                
                gameCore.ctx.restore();
            } else {
                // Claws on right side with rotation and oscillation
                gameCore.ctx.save();
                
                // Translate to base of claw for rotation
                gameCore.ctx.translate(player.x + player.width, baseY);
                
                // Rotate claw based on oscillation
                const rotationAngle = -(Math.PI/6) * Math.sin(clawTime + i * 0.9);
                gameCore.ctx.rotate(rotationAngle);
                
                // Draw the claw
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(0, 0); // Base of claw at paw
                gameCore.ctx.lineTo(player.width * 0.25 * extensionFactor, -oscillation/2);
                gameCore.ctx.lineTo(player.width * 0.3 * extensionFactor, -oscillation/4);
                gameCore.ctx.lineTo(player.width * 0.22 * extensionFactor, 0);
                gameCore.ctx.closePath();
                gameCore.ctx.fill();
                
                gameCore.ctx.restore();
            }
        }
        
        // Show digging action text with animation
        gameCore.ctx.fillStyle = '#8B4513';
        gameCore.ctx.font = 'bold 16px Arial';
        gameCore.ctx.textAlign = 'center';
        gameCore.ctx.strokeStyle = 'white';
        gameCore.ctx.lineWidth = 3;
        
        // Text position with slight bounce
        const textY = player.y - 20 + Math.sin(time / 10) * 2;
        
        // Text content depends on digging progress
        let digText = 'DIG!';
        if (player.diggingProgress > 0) {
            // Show progress in text
            if (player.diggingProgress > 75) {
                digText = 'ALMOST!';
            } else if (player.diggingProgress > 40) {
                digText = 'DIGGING!';
            } else {
                digText = 'DIG!';
            }
        }
        
        gameCore.ctx.strokeText(digText, player.x + player.width/2, textY);
        gameCore.ctx.fillText(digText, player.x + player.width/2, textY);
    }
}

// Export the player render functions
window.gameCharactersPlayers = {
    drawSquirrel,
    drawTurtle,
    drawUnicorn,
    drawCat,
    drawMole,
    drawFireBreath
};