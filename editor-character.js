// editor-character.js
// Character drawing functions for the editor, adapted to reuse game-rendering code when possible

// Define colors used by the editor
const editorColors = {
    enemy: {
        LION: '#DAA520', // Gold color
        DRAGON: '#FF4500', // Red-orange for dragon
    },
    puppy: '#D2B48C', // Tan color
    collectible: {
        STAR: 'gold',
        DOGFOOD: '#D2B48C', // Tan/light brown color
        PEPPER: 'red',
        HOURGLASS: '#87CEFA' // Light sky blue
    }
};

// Draw an enemy in the editor
function drawEnemy(ctx, enemy) {
    ctx.fillStyle = editorColors.enemy[enemy.type];
    
    // Draw the body
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Draw details based on enemy type
    if (enemy.type === 'LION') {
        // Lion details (eyes and nose)
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + enemy.width * 0.7, enemy.y + enemy.height * 0.2, enemy.width * 0.15, enemy.height * 0.15);
        ctx.fillRect(enemy.x + enemy.width * 0.7, enemy.y + enemy.height * 0.5, enemy.width * 0.15, enemy.height * 0.15);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + enemy.width * 0.73, enemy.y + enemy.height * 0.23, enemy.width * 0.09, enemy.height * 0.09);
        ctx.fillRect(enemy.x + enemy.width * 0.73, enemy.y + enemy.height * 0.53, enemy.width * 0.09, enemy.height * 0.09);
        
        // Nose
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width * 0.9, enemy.y + enemy.height * 0.35, enemy.width * 0.1, 0, Math.PI * 2);
        ctx.fill();
    } else if (enemy.type === 'DRAGON') {
        // Dragon details (eyes and fire)
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + enemy.width * 0.8, enemy.y + enemy.height * 0.2, enemy.width * 0.15, enemy.height * 0.1);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + enemy.width * 0.85, enemy.y + enemy.height * 0.22, enemy.width * 0.05, enemy.height * 0.06);
        
        // Fire pattern
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width, enemy.y + enemy.height * 0.3);
        ctx.lineTo(enemy.x + enemy.width + 20, enemy.y + enemy.height * 0.1);
        ctx.lineTo(enemy.x + enemy.width + 25, enemy.y + enemy.height * 0.4);
        ctx.lineTo(enemy.x + enemy.width + 15, enemy.y + enemy.height * 0.2);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height * 0.35);
        ctx.fill();
    }
    
    // Draw the patrol distance as a line
    if (enemy.patrolDistance > 0) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + enemy.patrolDistance, enemy.y + enemy.height + 5);
        ctx.stroke();
        
        // Arrows to indicate direction
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + 5, enemy.y + enemy.height + 2);
        ctx.lineTo(enemy.x + 5, enemy.y + enemy.height + 8);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.patrolDistance, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + enemy.patrolDistance - 5, enemy.y + enemy.height + 2);
        ctx.lineTo(enemy.x + enemy.patrolDistance - 5, enemy.y + enemy.height + 8);
        ctx.fill();
    }
    
    // Label with speed
    ctx.font = '10px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Speed: ${enemy.speed}`, enemy.x, enemy.y - 5);
    
    // Outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

// Draw a puppy in the editor
function drawPuppy(ctx, puppy) {
    // Base figure
    ctx.fillStyle = editorColors.puppy;
    ctx.fillRect(puppy.x, puppy.y, puppy.width, puppy.height);
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(puppy.x + puppy.width * 0.6, puppy.y + puppy.height * 0.25, puppy.width * 0.2, puppy.height * 0.15);
    ctx.fillRect(puppy.x + puppy.width * 0.6, puppy.y + puppy.height * 0.55, puppy.width * 0.2, puppy.height * 0.15);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(puppy.x + puppy.width * 0.65, puppy.y + puppy.height * 0.28, puppy.width * 0.1, puppy.height * 0.1);
    ctx.fillRect(puppy.x + puppy.width * 0.65, puppy.y + puppy.height * 0.58, puppy.width * 0.1, puppy.height * 0.1);
    
    // Nose
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(puppy.x + puppy.width * 0.85, puppy.y + puppy.height * 0.4, puppy.width * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Help balloon when started but not saved
    if (!puppy.saved) {
        // Help text balloon
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(puppy.x - 5, puppy.y - 20, 30, 15, 5);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText('Help!', puppy.x, puppy.y - 8);
        
        // Arrow
        ctx.beginPath();
        ctx.moveTo(puppy.x + 10, puppy.y - 5);
        ctx.lineTo(puppy.x + 15, puppy.y);
        ctx.lineTo(puppy.x + 20, puppy.y - 5);
        ctx.fill();
    }
    
    // Outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(puppy.x, puppy.y, puppy.width, puppy.height);
}

// Draw a collectible (star, pepper, dog food, or hourglass)
function drawCollectible(ctx, collectible) {
    const type = collectible.type || 'STAR'; // Default type is STAR if not specified
    
    if (type === 'DOGFOOD') {
        // Draw dog food (bone shape)
        ctx.fillStyle = editorColors.collectible.DOGFOOD;
        
        const centerX = collectible.x + collectible.width / 2;
        const centerY = collectible.y + collectible.height / 2;
        
        // Add rotation (10 degrees in radians)
        const rotationAngle = 10 * Math.PI / 180;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationAngle);
        
        // Draw the bone - first the rectangle in the middle (more elongated)
        const bodyWidth = collectible.width * 0.7;
        const bodyHeight = collectible.height * 0.2;
        ctx.fillRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
        
        // Draw the bone ends (smaller radius)
        ctx.beginPath();
        ctx.arc(-bodyWidth/2, -bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        ctx.arc(-bodyWidth/2, bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(bodyWidth/2, -bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        ctx.arc(bodyWidth/2, bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline of the bone
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
        
        // Restore the canvas transformation
        ctx.restore();
    } else if (type === 'PEPPER') {
        // Draw a pepper
        ctx.fillStyle = editorColors.collectible.PEPPER;
        
        const centerX = collectible.x + collectible.width / 2;
        const centerY = collectible.y + collectible.height / 2;
        
        // Add rotation (15 degrees in radians)
        const rotationAngle = 15 * Math.PI / 180;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationAngle);
        
        // Draw the pepper body (more elongated and pointy)
        ctx.beginPath();
        // Make the pepper more elongated by decreasing the width
        // and making it pointy at the bottom
        ctx.moveTo(0, -collectible.height / 1.8); // Top (stem)
        ctx.bezierCurveTo(
            collectible.width / 4, -collectible.height / 2,  // Control point 1
            collectible.width / 3, collectible.height / 3,   // Control point 2
            0, collectible.height / 1.8                     // Bottom point (pointy)
        );
        ctx.bezierCurveTo(
            -collectible.width / 3, collectible.height / 3,  // Control point 3
            -collectible.width / 4, -collectible.height / 2, // Control point 4
            0, -collectible.height / 1.8                    // Back to top
        );
        ctx.fill();
        
        // Draw the pepper stem
        ctx.fillStyle = '#006400'; // Dark green for stem
        ctx.beginPath();
        ctx.ellipse(0, -collectible.height / 1.8, collectible.width / 8, collectible.height / 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline of the pepper
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -collectible.height / 1.8); // Top (stem)
        ctx.bezierCurveTo(
            collectible.width / 4, -collectible.height / 2,  // Control point 1
            collectible.width / 3, collectible.height / 3,   // Control point 2
            0, collectible.height / 1.8                     // Bottom point (pointy)
        );
        ctx.bezierCurveTo(
            -collectible.width / 3, collectible.height / 3,  // Control point 3
            -collectible.width / 4, -collectible.height / 2, // Control point 4
            0, -collectible.height / 1.8                    // Back to top
        );
        ctx.stroke();
        
        // Restore the canvas transformation
        ctx.restore();
    } else if (type === 'HOURGLASS') {
        // Draw an hourglass
        const centerX = collectible.x + collectible.width/2;
        const centerY = collectible.y + collectible.height/2;
        
        // Pulsing effect for the hourglass
        const pulseTime = Date.now() / 500;
        const pulseScale = 1.0 + Math.sin(pulseTime) * 0.05;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(pulseScale, pulseScale);
        
        // Draw hourglass frame (light blue with golden frame)
        ctx.fillStyle = editorColors.collectible.HOURGLASS; // Light blue
        
        // Upper half trapezoid
        const width = collectible.width * 0.7;
        const height = collectible.height * 0.35;
        
        ctx.beginPath();
        ctx.moveTo(-width/2, -height);
        ctx.lineTo(width/2, -height);
        ctx.lineTo(width/4, 0);
        ctx.lineTo(-width/4, 0);
        ctx.closePath();
        ctx.fill();
        
        // Lower half trapezoid
        ctx.beginPath();
        ctx.moveTo(-width/4, 0);
        ctx.lineTo(width/4, 0);
        ctx.lineTo(width/2, height);
        ctx.lineTo(-width/2, height);
        ctx.closePath();
        ctx.fill();
        
        // Golden frame
        ctx.strokeStyle = '#DAA520'; // Golden frame
        ctx.lineWidth = 2;
        
        // Upper frame
        ctx.beginPath();
        ctx.moveTo(-width/2, -height);
        ctx.lineTo(width/2, -height);
        ctx.lineTo(width/4, 0);
        ctx.lineTo(-width/4, 0);
        ctx.closePath();
        ctx.stroke();
        
        // Lower frame
        ctx.beginPath();
        ctx.moveTo(-width/4, 0);
        ctx.lineTo(width/4, 0);
        ctx.lineTo(width/2, height);
        ctx.lineTo(-width/2, height);
        ctx.closePath();
        ctx.stroke();
        
        // Draw sand particles with animation
        ctx.fillStyle = '#FFD700'; // Gold color for sand
        
        // Animation for falling sand effect
        const sandLevel = Math.abs(Math.sin(pulseTime * 0.5)); // 0 to 1 value for sand level
        
        // Upper chamber (decreasing sand)
        const upperSandHeight = height * (1 - sandLevel) * 0.8;
        ctx.beginPath();
        ctx.moveTo(-width/2.2, -height + 2);
        ctx.lineTo(width/2.2, -height + 2);
        ctx.lineTo(width/4.4, -height + 2 + upperSandHeight);
        ctx.lineTo(-width/4.4, -height + 2 + upperSandHeight);
        ctx.closePath();
        ctx.fill();
        
        // Lower chamber (increasing sand)
        const lowerSandHeight = height * sandLevel * 0.8;
        ctx.beginPath();
        ctx.moveTo(-width/4.4, height - 2 - lowerSandHeight);
        ctx.lineTo(width/4.4, height - 2 - lowerSandHeight);
        ctx.lineTo(width/2.2, height - 2);
        ctx.lineTo(-width/2.2, height - 2);
        ctx.closePath();
        ctx.fill();
        
        // Draw falling sand particles
        const particleSize = 1.5;
        ctx.beginPath();
        ctx.rect(-particleSize/2, -particleSize/2 - 5 + sandLevel * 10, particleSize, particleSize);
        ctx.rect(-particleSize - 1, particleSize/2 + sandLevel * 8, particleSize, particleSize);
        ctx.rect(particleSize/2, 2 + sandLevel * 6, particleSize, particleSize);
        ctx.fill();
        
        ctx.restore();
    } else {
        // Draw a star (default type)
        ctx.fillStyle = editorColors.collectible.STAR;
        
        // Draw a 5-pointed star
        const centerX = collectible.x + collectible.width / 2;
        const centerY = collectible.y + collectible.height / 2;
        const outerRadius = collectible.width / 2;
        const innerRadius = collectible.width / 4;
        
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI * 2 * i / 10 - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Export functions
window.editorCharacters = {
    drawEnemy,
    drawPuppy,
    drawCollectible,
    editorColors
};