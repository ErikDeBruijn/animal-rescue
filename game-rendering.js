// game-rendering.js
// Contains all environment and game world rendering functions

// Collectible object rendering
function drawCollectible(collectible) {
    if (collectible.type === "PEPPER") {
        // Draw a pepper
        const centerX = collectible.x + collectible.width/2;
        const centerY = collectible.y + collectible.height/2;
        
        // Add rotation (15 degrees in radians)
        const rotationAngle = 15 * Math.PI / 180;
        gameCore.ctx.save();
        gameCore.ctx.translate(centerX, centerY);
        gameCore.ctx.rotate(rotationAngle);
        
        // Draw the pepper body (more elongated and pointy)
        gameCore.ctx.fillStyle = 'red';
        gameCore.ctx.beginPath();
        // Make the pepper more elongated by decreasing the width
        // and making it pointy at the bottom
        gameCore.ctx.moveTo(0, -collectible.height / 1.8); // Top (stem)
        gameCore.ctx.bezierCurveTo(
            collectible.width / 4, -collectible.height / 2,  // Control point 1
            collectible.width / 3, collectible.height / 3,   // Control point 2
            0, collectible.height / 1.8                     // Bottom point (pointy)
        );
        gameCore.ctx.bezierCurveTo(
            -collectible.width / 3, collectible.height / 3,  // Control point 3
            -collectible.width / 4, -collectible.height / 2, // Control point 4
            0, -collectible.height / 1.8                    // Back to top
        );
        gameCore.ctx.fill();
        
        // Draw the pepper stem
        gameCore.ctx.fillStyle = 'green';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(0, -collectible.height / 1.8, collectible.width / 8, collectible.height / 12, 0, 0, Math.PI * 2);
        gameCore.ctx.fill();
        
        // Highlight (to make it look shiny)
        gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(
            -collectible.width/6, 
            -collectible.height/6, 
            collectible.width/8, 
            collectible.height/10, 
            0, 0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Restore the canvas transformation
        gameCore.ctx.restore();
    } else {
        // Default: Draw a star (original code)
        gameCore.ctx.fillStyle = 'gold';
        
        // Draw the star
        const centerX = collectible.x + collectible.width/2;
        const centerY = collectible.y + collectible.height/2;
        const spikes = 5;
        const outerRadius = collectible.width/2;
        const innerRadius = collectible.width/4;
        
        gameCore.ctx.beginPath();
        for(let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI * i / spikes - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            if (i === 0) {
                gameCore.ctx.moveTo(x, y);
            } else {
                gameCore.ctx.lineTo(x, y);
            }
        }
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Sparkle effect
        gameCore.ctx.fillStyle = 'white';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(centerX - collectible.width/5, centerY - collectible.height/5, 
                collectible.width/10, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
}

// Trap rendering
function drawTrap(trap) {
    if (trap.type === "SPIKES") {
        gameCore.ctx.fillStyle = '#888';
        
        // Base of the spikes
        gameCore.ctx.fillRect(trap.x, trap.y + trap.height - 5, trap.width, 5);
        
        // Draw the points
        gameCore.ctx.fillStyle = '#555';
        const spikeWidth = 8;
        const numSpikes = Math.floor(trap.width / spikeWidth);
        
        for (let i = 0; i < numSpikes; i++) {
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(trap.x + i * spikeWidth, trap.y + trap.height - 5);
            gameCore.ctx.lineTo(trap.x + i * spikeWidth + spikeWidth/2, trap.y);
            gameCore.ctx.lineTo(trap.x + i * spikeWidth + spikeWidth, trap.y + trap.height - 5);
            gameCore.ctx.fill();
        }
    }
}

// Platform rendering
function drawPlatform(platform) {
    switch(platform.type) {
        case "TREADMILL":
            // Base treadmill color - dark gray for the main belt
            gameCore.ctx.fillStyle = '#444444'; 
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Animation time and direction
            const treadTime = Date.now() / 150; // Animation speed
            const treadDirection = platform.speed === undefined ? 1 : Math.sign(platform.speed);
            const treadSpeed = platform.speed === undefined ? 2 : Math.abs(platform.speed);
            const rotationSpeed = treadSpeed * 0.1; // Scale rotation speed with treadmill speed
            const animRotation = (treadTime * rotationSpeed * treadDirection) % (Math.PI * 2);
            
            // Add side rollers (light gray circles at each end) with rotating spokes
            const rollerRadius = platform.height / 2;
            
            // Left roller
            gameCore.ctx.save();
            gameCore.ctx.translate(platform.x, platform.y + rollerRadius);
            gameCore.ctx.rotate(animRotation);
            
            // Draw roller base
            gameCore.ctx.fillStyle = '#777777';
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(0, 0, rollerRadius, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            // Draw spokes
            gameCore.ctx.strokeStyle = '#333333';
            gameCore.ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2;
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(0, 0);
                gameCore.ctx.lineTo(Math.cos(angle) * rollerRadius, Math.sin(angle) * rollerRadius);
                gameCore.ctx.stroke();
            }
            gameCore.ctx.restore();
            
            // Right roller
            gameCore.ctx.save();
            gameCore.ctx.translate(platform.x + platform.width, platform.y + rollerRadius);
            gameCore.ctx.rotate(animRotation);
            
            // Draw roller base
            gameCore.ctx.fillStyle = '#777777';
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(0, 0, rollerRadius, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            // Draw spokes
            gameCore.ctx.strokeStyle = '#333333';
            gameCore.ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2;
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(0, 0);
                gameCore.ctx.lineTo(Math.cos(angle) * rollerRadius, Math.sin(angle) * rollerRadius);
                gameCore.ctx.stroke();
            }
            gameCore.ctx.restore();
            
            // No more vertical tread lines - removed as requested
            
            // Add highlights on top edge
            gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, 3);
            
            // Draw direction arrows along the belt
            const arrowSpacing = 50; // Space between arrows
            const arrowSize = Math.min(12, platform.height * 0.4);
            
            // Yellow arrows showing movement direction
            gameCore.ctx.fillStyle = '#FFCC00';
            
            // Starting position for first arrow (slightly offset from edge)
            let startPos = platform.x + 25;
            
            // Adjust arrow position based on animation time
            const arrowOffset = (treadTime * treadDirection * 0.5) % arrowSpacing;
            startPos += arrowOffset;
            
            // Draw the arrows
            for (let x = startPos; x < platform.x + platform.width - arrowSize; x += arrowSpacing) {
                // Skip arrows too close to the edge
                if (x < platform.x + arrowSize || x > platform.x + platform.width - arrowSize) {
                    continue;
                }
                
                // Draw triangle pointing in the direction of movement
                gameCore.ctx.beginPath();
                if (treadDirection >= 0) {
                    // Right pointing triangle
                    gameCore.ctx.moveTo(x + arrowSize, platform.y + platform.height/2);
                    gameCore.ctx.lineTo(x, platform.y + platform.height/2 - arrowSize/2);
                    gameCore.ctx.lineTo(x, platform.y + platform.height/2 + arrowSize/2);
                } else {
                    // Left pointing triangle
                    gameCore.ctx.moveTo(x - arrowSize, platform.y + platform.height/2);
                    gameCore.ctx.lineTo(x, platform.y + platform.height/2 - arrowSize/2);
                    gameCore.ctx.lineTo(x, platform.y + platform.height/2 + arrowSize/2);
                }
                gameCore.ctx.closePath();
                gameCore.ctx.fill();
            }
            break;
            
        case "ICE":
            // Base ice color - light blue for ice
            gameCore.ctx.fillStyle = '#A5F2F3'; 
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add glossy effect to make it look icy
            gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height / 3);
            
            // Add some sparkle effects to make it look icy
            const time = Date.now() / 500;
            gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            
            // Draw little sparkles at random positions
            for (let i = 0; i < 5; i++) {
                const sparkleX = platform.x + (Math.sin(time + i) * 0.5 + 0.5) * platform.width;
                const sparkleY = platform.y + (Math.cos(time * 1.2 + i) * 0.5 + 0.5) * platform.height;
                const sparkleSize = 2 + Math.sin(time * 2 + i) * 1;
                
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                gameCore.ctx.fill();
            }
            
            // Draw small cracks in the ice
            gameCore.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            gameCore.ctx.lineWidth = 1;
            
            // First crack
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(platform.x + platform.width * 0.2, platform.y + platform.height * 0.3);
            gameCore.ctx.lineTo(platform.x + platform.width * 0.4, platform.y + platform.height * 0.5);
            gameCore.ctx.lineTo(platform.x + platform.width * 0.3, platform.y + platform.height * 0.7);
            gameCore.ctx.stroke();
            
            // Second crack
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(platform.x + platform.width * 0.6, platform.y + platform.height * 0.2);
            gameCore.ctx.lineTo(platform.x + platform.width * 0.7, platform.y + platform.height * 0.4);
            gameCore.ctx.lineTo(platform.x + platform.width * 0.9, platform.y + platform.height * 0.5);
            gameCore.ctx.stroke();
            break;
        case "VERTICAL":
            // Draw vertical wall
            // Base color - orange-brown for the wall
            gameCore.ctx.fillStyle = '#cc7722';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add vertical lines for texture
            gameCore.ctx.strokeStyle = 'rgba(60, 30, 0, 0.6)';
            gameCore.ctx.lineWidth = 1;
            for (let x = platform.x + 8; x < platform.x + platform.width; x += 15) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(x, platform.y);
                gameCore.ctx.lineTo(x, platform.y + platform.height);
                gameCore.ctx.stroke();
            }
            
            // Add some horizontal bars for grip
            gameCore.ctx.fillStyle = '#8B4513'; // Darker brown for the grip bars
            for (let y = platform.y + 10; y < platform.y + platform.height; y += 20) {
                gameCore.ctx.fillRect(platform.x, y, platform.width, 5);
            }
            
            // Highlight edges to indicate it's a wall
            gameCore.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            gameCore.ctx.lineWidth = 2;
            
            // Left edge highlight
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(platform.x + 1, platform.y);
            gameCore.ctx.lineTo(platform.x + 1, platform.y + platform.height);
            gameCore.ctx.stroke();
            
            // Right edge shadow
            gameCore.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(platform.x + platform.width - 1, platform.y);
            gameCore.ctx.lineTo(platform.x + platform.width - 1, platform.y + platform.height);
            gameCore.ctx.stroke();
            break;
        case "TRAMPOLINE":
            // Determine the compression of the trampoline
            let trampolineHeight = platform.height;
            let trampolineY = platform.y;
            
            // If the trampoline is compressed, show this visually
            if (platform.compressed) {
                const compressionAmount = Math.min(5, platform.springForce / 3);
                trampolineHeight = platform.height - compressionAmount;
                trampolineY = platform.y + compressionAmount;
            }
            
            // Draw the base (wooden platform)
            gameCore.ctx.fillStyle = '#8B4513';
            gameCore.ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
            
            // Draw the legs
            gameCore.ctx.fillStyle = '#A52A2A'; // Darker brown for the legs
            gameCore.ctx.fillRect(platform.x + 5, platform.y + platform.height - 10, 5, 10);
            gameCore.ctx.fillRect(platform.x + platform.width - 10, platform.y + platform.height - 10, 5, 10);
            
            // Draw the spring material (red)
            gameCore.ctx.fillStyle = '#FF6347';
            gameCore.ctx.fillRect(platform.x, trampolineY, platform.width, trampolineHeight - 5);
            
            // Draw horizontal lines for the trampoline mat effect
            gameCore.ctx.strokeStyle = 'white';
            gameCore.ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(platform.x, trampolineY + i * (trampolineHeight - 5) / 4);
                gameCore.ctx.lineTo(platform.x + platform.width, trampolineY + i * (trampolineHeight - 5) / 4);
                gameCore.ctx.stroke();
            }
            
            // Show the strength of the trampoline visually
            if (platform.springForce > 0) {
                const springPower = platform.springForce / platform.maxSpringForce;
                // Draw arrows above the trampoline to show spring force
                gameCore.ctx.fillStyle = 'rgba(255, 215, 0, ' + springPower + ')';
                
                // Arrow pointing up
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(platform.x + platform.width / 2, platform.y - 20);
                gameCore.ctx.lineTo(platform.x + platform.width / 2 - 10, platform.y - 10);
                gameCore.ctx.lineTo(platform.x + platform.width / 2 + 10, platform.y - 10);
                gameCore.ctx.closePath();
                gameCore.ctx.fill();
            }
            break;
        case "NORMAL":
            gameCore.ctx.fillStyle = '#8B4513';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Grass on top
            gameCore.ctx.fillStyle = '#2E8B57';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, 5);
            break;
        case "WATER":
            // Clearer water background
            gameCore.ctx.fillStyle = 'rgba(0, 120, 255, 0.7)';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Animate the waves with the game time
            const waterTime = Date.now() / 1000;
            const waveHeight = 3;
            const waveFreq = 0.2;
            
            // Waves
            gameCore.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            gameCore.ctx.lineWidth = 2;
            
            // Top waves
            gameCore.ctx.beginPath();
            for (let i = 0; i < platform.width; i += 5) {
                const y = platform.y + Math.sin((i + waterTime * 50) * waveFreq) * waveHeight;
                if (i === 0) {
                    gameCore.ctx.moveTo(platform.x + i, y);
                } else {
                    gameCore.ctx.lineTo(platform.x + i, y);
                }
            }
            gameCore.ctx.stroke();
            
            // Small bubbles
            for (let i = 0; i < 5; i++) {
                const bubbleX = platform.x + Math.sin(waterTime * (i+1)) * platform.width/4 + platform.width/2;
                const bubbleY = platform.y + ((waterTime * 20 + i * 30) % platform.height);
                const size = 2 + Math.sin(waterTime * 2) * 1;
                
                gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
                gameCore.ctx.fill();
            }
            break;
        case "CLOUD":
            // Magical cloud platform (only usable by the unicorn)
            const cloudTime = Date.now() / 10000; // Slow floating effect
            
            // Small animation of the cloud (subtle floating)
            const offsetY = Math.sin(cloudTime * Math.PI * 2) * 3;
            
            // Draw the cloud with a rainbow glow
            // First a rainbow-like glow under the cloud
            const cloudColors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];
            for (let i = 0; i < cloudColors.length; i++) {
                const glowSize = platform.height * 0.7 + i * 3;
                gameCore.ctx.fillStyle = cloudColors[i];
                gameCore.ctx.globalAlpha = 0.3 - (i * 0.04);
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(
                    platform.x + platform.width / 2,
                    platform.y + platform.height / 2 + offsetY,
                    glowSize,
                    0, Math.PI * 2
                );
                gameCore.ctx.fill();
            }
            gameCore.ctx.globalAlpha = 1.0;
            
            // Now draw the white cloud on top
            // Main part of the cloud
            const centerX = platform.x + platform.width / 2;
            const centerY = platform.y + platform.height / 2 + offsetY;
            const radiusX = platform.width / 2;
            const radiusY = platform.height / 2;
            
            // Draw multiple circles to make a cloud-like shape
            gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(centerX, centerY, radiusY, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(centerX - radiusX * 0.6, centerY, radiusY * 0.8, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(centerX + radiusX * 0.6, centerY, radiusY * 0.7, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(centerX - radiusX * 0.3, centerY - radiusY * 0.5, radiusY * 0.6, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(centerX + radiusX * 0.3, centerY - radiusY * 0.4, radiusY * 0.7, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            // Sparkle effect for the magical clouds (only usable by unicorns)
            const starColors = ['#FFD700', '#FF00FF', '#00FFFF', '#FF69B4', '#ADFF2F'];
            for (let i = 0; i < 5; i++) {
                const twinkleX = centerX + Math.cos(cloudTime * 5 + i * 2) * radiusX * 0.7;
                const twinkleY = centerY + Math.sin(cloudTime * 7 + i * 2) * radiusY * 0.7;
                const twinkleSize = 3 + Math.sin(cloudTime * 10 + i) * 2;
                
                // Draw a star
                gameCore.ctx.fillStyle = starColors[i % starColors.length];
                gameCore.ctx.beginPath();
                
                // Draw a 5-pointed star
                for (let j = 0; j < 5; j++) {
                    const angle = (j * 2 * Math.PI / 5) - Math.PI / 2 + cloudTime * 3;
                    const x = twinkleX + Math.cos(angle) * twinkleSize;
                    const y = twinkleY + Math.sin(angle) * twinkleSize;
                    
                    if (j === 0) {
                        gameCore.ctx.moveTo(x, y);
                    } else {
                        gameCore.ctx.lineTo(x, y);
                    }
                }
                gameCore.ctx.closePath();
                gameCore.ctx.fill();
            }
            break;
        case "CLIMB":
            gameCore.ctx.fillStyle = '#A0522D';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Climbing pattern
            gameCore.ctx.strokeStyle = '#654321';
            gameCore.ctx.lineWidth = 2;
            for (let i = 10; i < platform.height; i += 20) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(platform.x, platform.y + i);
                gameCore.ctx.lineTo(platform.x + platform.width, platform.y + i);
                gameCore.ctx.stroke();
            }
            break;
        case "TREE":
            // Draw tree trunk
            gameCore.ctx.fillStyle = '#8B4513'; // Brown trunk
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Tree bark texture
            gameCore.ctx.strokeStyle = '#654321';
            gameCore.ctx.lineWidth = 2;
            for (let i = 10; i < platform.height; i += 25) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(platform.x + 5, platform.y + i);
                gameCore.ctx.lineTo(platform.x + platform.width - 5, platform.y + i - 5);
                gameCore.ctx.stroke();
            }
            
            // Draw leaves on top of the tree
            const leafSize = platform.width * 1.5;
            
            gameCore.ctx.fillStyle = '#006400'; // Dark green
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(platform.x + platform.width / 2, platform.y - leafSize / 3, leafSize / 2, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.fillStyle = '#32CD32'; // Lighter green
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(platform.x + platform.width / 2 - 15, platform.y - leafSize / 2 - 10, leafSize / 3, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(platform.x + platform.width / 2 + 15, platform.y - leafSize / 2 - 5, leafSize / 3, 0, Math.PI * 2);
            gameCore.ctx.fill();
            break;
        case "LASER":
            // Draw the laser beam - a deadly horizontal platform
            const laserTime = Date.now() / 200; // Fast animation
            
            // Container for the laser (dark metallic frame)
            gameCore.ctx.fillStyle = '#333333';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Inner glow effect (varies with time)
            const glowIntensity = 0.5 + 0.5 * Math.sin(laserTime);
            
            // Core of the laser beam (bright red)
            gameCore.ctx.fillStyle = `rgba(255, 0, 0, ${glowIntensity})`;
            gameCore.ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, platform.height - 4);
            
            // White hot center
            gameCore.ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity * 0.8})`;
            gameCore.ctx.fillRect(platform.x + 4, platform.y + platform.height/2 - 2, platform.width - 8, 4);
            
            // Add warning stripes on the sides
            gameCore.ctx.fillStyle = '#000000';
            
            // Left warning stripes
            for (let i = 0; i < platform.height; i += 10) {
                if (i % 20 < 10) {
                    gameCore.ctx.fillRect(platform.x, platform.y + i, 5, 5);
                }
            }
            
            // Right warning stripes
            for (let i = 0; i < platform.height; i += 10) {
                if (i % 20 < 10) {
                    gameCore.ctx.fillRect(platform.x + platform.width - 5, platform.y + i, 5, 5);
                }
            }
            break;
    }
}

// Functie om punten aan te tonen wanneer ze verdiend worden
function showPointsEarned(x, y, points) {
    // Maak een nieuw punten popup object
    const pointsPopup = {
        x: x,
        y: y,
        points: points,
        age: 0,
        maxAge: 60 // 1 seconde bij 60 fps
    };
    
    // Voeg toe aan de lijst met actieve popups
    if (!window.pointsPopups) {
        window.pointsPopups = [];
    }
    window.pointsPopups.push(pointsPopup);
}

// Teken alle actieve punten popups
function drawPointsPopups() {
    if (!window.pointsPopups) return;
    
    // Update en teken alle popups
    for (let i = window.pointsPopups.length - 1; i >= 0; i--) {
        const popup = window.pointsPopups[i];
        
        // Update leeftijd
        popup.age++;
        popup.y -= 1; // Beweeg omhoog
        
        // Bepaal opacity op basis van leeftijd
        const opacity = 1 - (popup.age / popup.maxAge);
        
        // Teken de popup
        gameCore.ctx.font = 'bold 16px Comic Sans MS';
        gameCore.ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
        gameCore.ctx.textAlign = 'center';
        gameCore.ctx.fillText(`+${popup.points}`, popup.x, popup.y);
        
        // Verwijder als te oud
        if (popup.age >= popup.maxAge) {
            window.pointsPopups.splice(i, 1);
        }
    }
    
    // Reset text alignment
    gameCore.ctx.textAlign = 'left';
}

// Background drawing
function drawBackground() {
    // Sky
    gameCore.ctx.fillStyle = '#87CEEB';
    gameCore.ctx.fillRect(0, 0, gameCore.canvas.width, gameCore.canvas.height);
    
    // Background clouds (white and semi-transparent) with drifting animation
    gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    // Cloud drift animation based on time
    const cloudDriftTime = Date.now() / 25000;
    const drift1 = 20 * Math.sin(cloudDriftTime * Math.PI);
    const drift2 = 15 * Math.cos(cloudDriftTime * Math.PI * 0.7);
    
    // First cloud group
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(100 + drift1, 80, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(130 + drift1, 70, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(160 + drift1, 80, 25, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    // Second cloud group
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(600 + drift2, 100, 35, 0, Math.PI * 2);
    gameCore.ctx.arc(650 + drift2, 90, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(690 + drift2, 100, 25, 0, Math.PI * 2);
    gameCore.ctx.fill();
}

// Ground drawing
function drawGround() {
    gameCore.ctx.fillStyle = '#8B4513';
    gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, gameCore.canvas.height - gameCore.GROUND_LEVEL);
    
    // Grass on top
    gameCore.ctx.fillStyle = '#2E8B57';
    gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, 10);
}

// Export the render functions
window.gameRendering = {
    drawBackground,
    drawGround,
    drawPlatform,
    drawTrap,
    drawCollectible,
    drawPointsPopups,
    showPointsEarned
};