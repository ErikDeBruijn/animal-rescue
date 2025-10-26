// game-characters-effects.js
// Contains rendering functions for special effects

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

// Function to draw claw effect on enemies
function drawClawEffect(enemy) {
    const time = Date.now() / 50; // Fast animation
    
    // Draw scratch marks on the enemy
    gameCore.ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)'; // Brighter red claw marks
    gameCore.ctx.lineWidth = 4; // Thicker lines for visibility
    
    // Draw multiple diagonal slash lines
    for (let i = 0; i < 4; i++) { // More slashes
        // Randomize position slightly for each slash
        const startX = enemy.x + enemy.width * (0.2 + Math.random() * 0.1);
        const startY = enemy.y + enemy.height * (0.2 + i * 0.15);
        const endX = enemy.x + enemy.width * (0.8 - Math.random() * 0.1);
        const endY = enemy.y + enemy.height * (0.35 + i * 0.15);
        
        // Draw the slash line
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(startX, startY);
        gameCore.ctx.lineTo(endX, endY);
        gameCore.ctx.stroke();
    }
    
    // Draw blood splatter effects - more realistic with various drop sizes
    for (let i = 0; i < 15; i++) { // More splatters
        // Blood inside the enemy
        const splatterX = enemy.x + Math.random() * enemy.width;
        const splatterY = enemy.y + Math.random() * enemy.height;
        const splatterSize = 2 + Math.random() * 5; // Varied sizes
        
        gameCore.ctx.fillStyle = 'rgba(255, 0, 0, 0.9)'; // Deeper red, more opaque
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(splatterX, splatterY, splatterSize, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
    
    // Blood spraying outward from the enemy
    for (let i = 0; i < 12; i++) {
        // Calculate position at the edge of the enemy
        const angle = Math.random() * Math.PI * 2;
        const edgeX = enemy.x + enemy.width/2 + Math.cos(angle) * enemy.width/2;
        const edgeY = enemy.y + enemy.height/2 + Math.sin(angle) * enemy.height/2;
        
        // Create blood trail shooting outward
        const sprayLength = 10 + Math.random() * 20;
        const endX = edgeX + Math.cos(angle) * sprayLength;
        const endY = edgeY + Math.sin(angle) * sprayLength;
        
        // Draw the blood spray trail
        gameCore.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
        gameCore.ctx.lineWidth = 1 + Math.random() * 2;
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(edgeX, edgeY);
        gameCore.ctx.lineTo(endX, endY);
        gameCore.ctx.stroke();
        
        // Add a blood drop at the end of the spray
        gameCore.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(endX, endY, 2 + Math.random() * 3, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
    
    // Flash effect similar to burning effect - more prominent
    if (enemy.clawTimer > 5) {
        // Alternating white flash for visibility
        const flashIntensity = (enemy.clawTimer % 4 < 2) ? 0.5 : 0.2;
        gameCore.ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
        gameCore.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
    
    // Text above enemy showing it's being clawed - with outline for better visibility
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.strokeStyle = 'red';
    gameCore.ctx.lineWidth = 3;
    gameCore.ctx.font = 'bold 16px Arial';
    gameCore.ctx.textAlign = 'center';
    gameCore.ctx.strokeText('CLAWED!', enemy.x + enemy.width/2, enemy.y - 15);
    gameCore.ctx.fillText('CLAWED!', enemy.x + enemy.width/2, enemy.y - 15);
}

// Export the effect render functions
window.gameCharactersEffects = {
    drawBurningEffect,
    drawClawEffect
};