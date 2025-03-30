// game-rendering.js
// Contains all environment and game world rendering functions

// Collectible object rendering
function drawCollectible(collectible) {
    if (collectible.type === "DOGFOOD") {
        // Draw dog food (a bone-shaped biscuit)
        const centerX = collectible.x + collectible.width/2;
        const centerY = collectible.y + collectible.height/2;
        
        // Add slight rotation for visual appeal
        const rotationAngle = 10 * Math.PI / 180;
        gameCore.ctx.save();
        gameCore.ctx.translate(centerX, centerY);
        gameCore.ctx.rotate(rotationAngle);
        
        // Draw the bone shape
        gameCore.ctx.fillStyle = '#D2B48C'; // Tan/light brown color for dog biscuit
        
        // Main bone body (rectangle) - more elongated
        const bodyWidth = collectible.width * 0.7;
        const bodyHeight = collectible.height * 0.2;
        gameCore.ctx.fillRect(-bodyWidth/2, -bodyHeight/2, bodyWidth, bodyHeight);
        
        // Left bone end (circle at left) - smaller radius
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(-bodyWidth/2, -bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        gameCore.ctx.arc(-bodyWidth/2, bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        gameCore.ctx.fill();
        
        // Right bone end (circle at right) - smaller radius
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(bodyWidth/2, -bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        gameCore.ctx.arc(bodyWidth/2, bodyHeight/1.3, bodyHeight/0.9, 0, Math.PI * 2);
        gameCore.ctx.fill();
        
        // Add highlight
        gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        gameCore.ctx.beginPath();
        gameCore.ctx.ellipse(
            -bodyWidth/4,
            -bodyHeight/4,
            bodyWidth/5,
            bodyHeight/2,
            0, 0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Restore the canvas transformation
        gameCore.ctx.restore();
    } else if (collectible.type === "PEPPER") {
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
    } else if (collectible.type === "HOURGLASS") {
        // Draw a hourglass
        const centerX = collectible.x + collectible.width/2;
        const centerY = collectible.y + collectible.height/2;
        
        // Pulsing effect for the hourglass
        const pulseTime = Date.now() / 500;
        const pulseScale = 1.0 + Math.sin(pulseTime) * 0.05;
        
        gameCore.ctx.save();
        gameCore.ctx.translate(centerX, centerY);
        gameCore.ctx.scale(pulseScale, pulseScale);
        
        // Draw hourglass frame (light blue with golden frame)
        gameCore.ctx.fillStyle = '#87CEFA'; // Light sky blue
        
        // Hourglass upper body
        gameCore.ctx.beginPath();
        const width = collectible.width * 0.7;
        const height = collectible.height * 0.35;
        
        // Upper half trapezoid
        gameCore.ctx.moveTo(-width/2, -height);
        gameCore.ctx.lineTo(width/2, -height);
        gameCore.ctx.lineTo(width/4, 0);
        gameCore.ctx.lineTo(-width/4, 0);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Lower half trapezoid 
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(-width/4, 0);
        gameCore.ctx.lineTo(width/4, 0);
        gameCore.ctx.lineTo(width/2, height);
        gameCore.ctx.lineTo(-width/2, height);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Golden frame
        gameCore.ctx.strokeStyle = '#DAA520'; // Golden frame
        gameCore.ctx.lineWidth = 2;
        
        // Upper frame
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(-width/2, -height);
        gameCore.ctx.lineTo(width/2, -height);
        gameCore.ctx.lineTo(width/4, 0);
        gameCore.ctx.lineTo(-width/4, 0);
        gameCore.ctx.closePath();
        gameCore.ctx.stroke();
        
        // Lower frame
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(-width/4, 0);
        gameCore.ctx.lineTo(width/4, 0);
        gameCore.ctx.lineTo(width/2, height);
        gameCore.ctx.lineTo(-width/2, height);
        gameCore.ctx.closePath();
        gameCore.ctx.stroke();
        
        // Draw sand particles with animation
        gameCore.ctx.fillStyle = '#FFD700'; // Gold color for sand
        
        // Animation for sand falling effect
        const sandLevel = Math.abs(Math.sin(pulseTime * 0.5)); // 0 to 1 value for sand level
        
        // Upper chamber (decreasing sand)
        const upperSandHeight = height * (1 - sandLevel) * 0.8;
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(-width/2.2, -height + 2);
        gameCore.ctx.lineTo(width/2.2, -height + 2);
        gameCore.ctx.lineTo(width/4.4, -height + 2 + upperSandHeight);
        gameCore.ctx.lineTo(-width/4.4, -height + 2 + upperSandHeight);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Lower chamber (increasing sand)
        const lowerSandHeight = height * sandLevel * 0.8;
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(-width/4.4, height - 2 - lowerSandHeight);
        gameCore.ctx.lineTo(width/4.4, height - 2 - lowerSandHeight);
        gameCore.ctx.lineTo(width/2.2, height - 2);
        gameCore.ctx.lineTo(-width/2.2, height - 2);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Draw falling sand particles
        gameCore.ctx.fillStyle = '#FFD700';
        const particleSize = 1.5;
        gameCore.ctx.beginPath();
        gameCore.ctx.rect(-particleSize/2, -particleSize/2 - 5 + sandLevel * 10, particleSize, particleSize);
        gameCore.ctx.rect(-particleSize - 1, particleSize/2 + sandLevel * 8, particleSize, particleSize);
        gameCore.ctx.rect(particleSize/2, 2 + sandLevel * 6, particleSize, particleSize);
        gameCore.ctx.fill();
        
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
    } else if (trap.type === "FIRE") {
        // Fire trap with animated flames
        const time = Date.now() / 25; // Even faster animation speed (was 50)
        
        // Draw base (logs or coals)
        gameCore.ctx.fillStyle = '#3a1700'; // Dark brown for logs
        gameCore.ctx.fillRect(trap.x, trap.y + trap.height - 6, trap.width, 6);
        
        // Draw fire embers/coals with glow - faster pulsing
        gameCore.ctx.fillStyle = '#ff3800'; // Glowing embers
        for (let i = 0; i < trap.width; i += 6) {
            const emberSize = 3 + Math.sin(time * 0.4 + i * 0.5) * 1.5; // Even more intense pulsing
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(trap.x + i + 3, trap.y + trap.height - 3, emberSize, 0, Math.PI * 2);
            gameCore.ctx.fill();
        }
        
        // Upward movement effect using time - faster oscillation but same amplitude
        const upwardMovement = Math.sin(time * 0.4) * 3; // Faster vertical oscillation
        
        // Draw animated flames
        const flameCount = Math.ceil(trap.width / 15);
        const flameWidth = trap.width / flameCount;
        
        for (let i = 0; i < flameCount; i++) {
            // Get oscillating height modifier for each flame to simulate rising motion
            // Faster oscillation but same amplitude
            const heightMod1 = Math.sin(time * 0.5 + i) * 0.2 + 1; // 0.8-1.2 range
            const heightMod2 = Math.sin(time * 0.45 + i * 2) * 0.15 + 1; // 0.85-1.15 range
            const heightMod3 = Math.sin(time * 0.55 + i * 1.5) * 0.1 + 1; // 0.9-1.1 range
            
            // Multiple flame layers with different colors
            drawFlame(
                trap.x + i * flameWidth + flameWidth/2, 
                trap.y + trap.height - 5 + upwardMovement, 
                flameWidth * 0.8, 
                trap.height * 1.7 * heightMod1, // Taller flames
                time + i * 3, 
                '#ff5a00' // Orange
            );
            
            drawFlame(
                trap.x + i * flameWidth + flameWidth/2, 
                trap.y + trap.height - 5 + upwardMovement * 0.8, 
                flameWidth * 0.6, 
                trap.height * 1.4 * heightMod2, // Taller flames
                time + i * 2 + 10, 
                '#ffdd00' // Yellow
            );
            
            drawFlame(
                trap.x + i * flameWidth + flameWidth/2, 
                trap.y + trap.height - 5 + upwardMovement * 0.6, 
                flameWidth * 0.4, 
                trap.height * 1.1 * heightMod3, // Taller flames
                time + i * 4 + 5, 
                '#ffffff' // White-hot center
            );
        }
        
        // Draw smoke particles
        gameCore.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        for (let i = 0; i < 5; i++) { // More smoke particles
            // Much faster rising smoke
            const smokeSpeed = time * 0.06 + i * 5; // Double the speed
            const verticalOffset = (smokeSpeed % 15) * 3; // Makes smoke rise faster
            
            const smokeX = trap.x + Math.sin(time * 0.15 + i * 10) * trap.width/3 + trap.width/2; // Faster horizontal drift
            const smokeY = trap.y - trap.height - i * 12 - verticalOffset - Math.sin(time * 0.25 + i) * 5; // Faster vertical movement
            const smokeSize = 4 + Math.sin(time * 0.4 + i * 2) * 2; // Faster size fluctuation
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
            gameCore.ctx.fill();
        }
        
        // Heat distortion (if trap was active for a while)
        if (!trap.soundPlaying && Math.random() < 0.1) {
            // Play fire sound with 10% chance per frame if not already playing
            try {
                if (typeof gameAudio !== 'undefined' && gameAudio.playSound) {
                    gameAudio.playSound('fire', 0.4);
                    trap.soundPlaying = true;
                    
                    // Reset sound playing flag after a delay to allow replaying
                    setTimeout(() => {
                        trap.soundPlaying = false;
                    }, 2000);
                }
            } catch (e) {
                // Log error only once per trap to avoid console spam
                if (!trap.errorLogged) {
                    console.error('Error playing fire sound:', e);
                    trap.errorLogged = true;
                }
            }
        }
    }
    
    // Helper function to draw a flame shape
    function drawFlame(x, y, width, height, time, color) {
        const waveAmount = width * 0.38; // More wavy for faster apparent motion
        
        gameCore.ctx.fillStyle = color;
        gameCore.ctx.beginPath();
        
        // Start at the bottom center
        gameCore.ctx.moveTo(x, y);
        
        // Calculate vertical stretch factor (flames stretch more at the top) - faster fluctuation
        const stretchFactor = 1.2 + Math.sin(time * 0.3) * 0.3;
        
        // Left flame edge (wavy, uses sine wave with upward motion)
        for (let i = 0; i <= 1; i += 0.1) {
            // Apply more stretch to higher parts of the flame (upward rising effect)
            const verticalStretch = i * i * stretchFactor;
            const py = y - height * (i + verticalStretch * 0.2);
            
            // Much faster oscillation for more lively flames
            const waveFactor = Math.sin(time * 0.6 + i * 15) * waveAmount * i;
            const px = x - width/2 * (1 - i) + waveFactor;
            
            gameCore.ctx.lineTo(px, py);
        }
        
        // Flame tip (varies with time) - more dynamic with faster movement
        const tipOffset = Math.sin(time * 0.5) * (width * 0.3); // Faster movement, slightly larger range
        const tipHeight = height * (1 + Math.sin(time * 0.4) * 0.15); // Faster varying height
        gameCore.ctx.lineTo(x + tipOffset, y - tipHeight);
        
        // Right flame edge (wavy, different phase)
        for (let i = 1; i >= 0; i -= 0.1) {
            // Apply more stretch to higher parts of the flame (upward rising effect)
            const verticalStretch = i * i * stretchFactor;
            const py = y - height * (i + verticalStretch * 0.2);
            
            // Different phase and much faster oscillation on the right side
            const waveFactor = Math.sin(time * 0.6 + i * 15 + 3) * waveAmount * i;
            const px = x + width/2 * (1 - i) + waveFactor;
            
            gameCore.ctx.lineTo(px, py);
        }
        
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
    }
}

// Platform rendering
function drawPlatform(platform) {
    switch(platform.type) {
        case "NUMBER":
            // Draw number platform - interactive platform with a number
            
            // Check if platform was recently hit
            const isHit = platform.hitEffect && platform.hitEffect.time > 0;
            
            // Update hit effect if active
            if (isHit) {
                platform.hitEffect.time--;
                
                // Flash effect (brighten the platform when hit)
                if (platform.hitEffect.time > 15) {
                    // Initial flash (very bright)
                    gameCore.ctx.fillStyle = '#ffe0a0'; // Lighter orange
                } else if (platform.hitEffect.time > 10) {
                    // Second phase (less bright)
                    gameCore.ctx.fillStyle = '#ffd080';
                } else {
                    // Final phase (return to normal)
                    gameCore.ctx.fillStyle = '#ffc060'; 
                }
            } else {
                // Normal color
                gameCore.ctx.fillStyle = '#ffb733';
            }
            
            // Draw the base
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Add border - thicker when hit
            gameCore.ctx.strokeStyle = '#995500';
            gameCore.ctx.lineWidth = isHit ? 3 : 2;
            gameCore.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            
            // Draw subtle pulsing effect to indicate it's interactive
            const pulseTime = Date.now() / 600;
            const pulseIntensity = isHit ? 
                0.5 + 0.3 * Math.sin(pulseTime * 2) : // More intense when hit
                0.2 + 0.1 * Math.sin(pulseTime);      // Normal pulse
            
            // Draw highlight effect on top
            gameCore.ctx.fillStyle = `rgba(255, 255, 255, ${pulseIntensity})`;
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, 5);
            
            // Draw the number with a 3D effect
            const numberValue = platform.numberValue !== undefined ? platform.numberValue : 0;
            
            // Shadow for 3D effect
            gameCore.ctx.fillStyle = '#995500';
            gameCore.ctx.font = `bold ${Math.min(platform.width, platform.height) * 0.7}px Arial`;
            gameCore.ctx.textAlign = 'center';
            gameCore.ctx.textBaseline = 'middle';
            gameCore.ctx.fillText(
                numberValue.toString(), 
                platform.x + platform.width / 2 + 2, 
                platform.y + platform.height / 2 + 3
            );
            
            // Number in white
            gameCore.ctx.fillStyle = 'white';
            gameCore.ctx.fillText(
                numberValue.toString(), 
                platform.x + platform.width / 2, 
                platform.y + platform.height / 2
            );
            
            // Draw "fist bump" indicator on the bottom
            gameCore.ctx.fillStyle = `rgba(255, 255, 255, ${pulseIntensity + 0.1})`;
            
            // Draw little arrow pointing up
            const arrowWidth = platform.width * 0.3;
            const arrowCenter = platform.x + platform.width / 2;
            const arrowBottom = platform.y + platform.height - 2;
            const arrowTop = arrowBottom - 6;
            
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(arrowCenter, arrowTop);
            gameCore.ctx.lineTo(arrowCenter - arrowWidth / 2, arrowBottom);
            gameCore.ctx.lineTo(arrowCenter + arrowWidth / 2, arrowBottom);
            gameCore.ctx.fill();
            
            // Reset text alignment
            gameCore.ctx.textAlign = 'left';
            gameCore.ctx.textBaseline = 'alphabetic';
            break;
            
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
        
        // Bepaal kleur op basis van thema
        const currentTheme = gameCore.currentLevel && gameCore.currentLevel.theme ? gameCore.currentLevel.theme : 'day';
        const pointsColor = currentTheme === 'night' ? `rgba(255, 230, 150, ${opacity})` : `rgba(255, 215, 0, ${opacity})`;
        
        // Teken de popup
        gameCore.ctx.font = 'bold 16px Comic Sans MS';
        gameCore.ctx.fillStyle = pointsColor;
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
    // Huidige level theme bepalen
    const currentTheme = gameCore.currentLevel && gameCore.currentLevel.theme ? gameCore.currentLevel.theme : 'day';
    
    if (currentTheme === 'night') {
        drawNightBackground();
    } else {
        drawDayBackground();
    }
}

// Dag achtergrond tekenen
function drawDayBackground() {
    // Sky
    gameCore.ctx.fillStyle = '#87CEEB';
    gameCore.ctx.fillRect(0, 0, gameCore.canvas.width, gameCore.canvas.height);
    
    // Teken de zon
    drawSun();
    
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
    
    // Extra wolk in het midden
    const drift3 = 10 * Math.sin(cloudDriftTime * Math.PI * 1.3);
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(350 + drift3, 120, 25, 0, Math.PI * 2);
    gameCore.ctx.arc(380 + drift3, 110, 25, 0, Math.PI * 2);
    gameCore.ctx.arc(410 + drift3, 125, 20, 0, Math.PI * 2);
    gameCore.ctx.fill();
}

// Nacht achtergrond tekenen
function drawNightBackground() {
    // Donkere nachthemel
    gameCore.ctx.fillStyle = '#0c1445';
    gameCore.ctx.fillRect(0, 0, gameCore.canvas.width, gameCore.canvas.height);
    
    // Teken sterren
    drawStars();
    
    // Teken de maan
    drawMoon();
    
    // Donkere wolken
    drawNightClouds();
}

// Zon tekenen
function drawSun() {
    const time = Date.now() / 15000; // Langzame animatie voor de zon
    
    // Bepaal positie (links boven)
    const centerX = 80 + Math.sin(time) * 20;
    const centerY = 80 + Math.cos(time) * 10;
    const radius = 30;
    
    // Teken gloeiend effect
    const gradient = gameCore.ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    gameCore.ctx.fillStyle = gradient;
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    // Teken de zon
    gameCore.ctx.fillStyle = '#FFCC00';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    // Teken stralen
    gameCore.ctx.strokeStyle = '#FFCC00';
    gameCore.ctx.lineWidth = 3;
    const rays = 8;
    const innerRadius = radius * 1.2;
    const outerRadius = radius * 1.8;
    
    for (let i = 0; i < rays; i++) {
        const angle = (i * Math.PI * 2 / rays) + time;
        const startX = centerX + Math.cos(angle) * innerRadius;
        const startY = centerY + Math.sin(angle) * innerRadius;
        const endX = centerX + Math.cos(angle) * outerRadius;
        const endY = centerY + Math.sin(angle) * outerRadius;
        
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(startX, startY);
        gameCore.ctx.lineTo(endX, endY);
        gameCore.ctx.stroke();
    }
}

// Maan tekenen
function drawMoon() {
    const time = Date.now() / 20000; // Zeer langzame animatie voor de maan
    
    // Bepaal positie (rechts boven)
    const centerX = gameCore.canvas.width - 100 + Math.sin(time) * 10;
    const centerY = 100 + Math.cos(time) * 10;
    const radius = 25;
    
    // Teken gloeiend effect
    const gradient = gameCore.ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.8);
    gradient.addColorStop(0, 'rgba(200, 200, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
    
    gameCore.ctx.fillStyle = gradient;
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    // Teken de maan
    gameCore.ctx.fillStyle = '#E6E6FA';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    // Teken maankraters
    gameCore.ctx.fillStyle = 'rgba(180, 180, 200, 0.6)';
    // Krater 1
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.4, radius * 0.15, 0, Math.PI * 2);
    gameCore.ctx.fill();
    // Krater 2
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX + radius * 0.4, centerY + radius * 0.2, radius * 0.2, 0, Math.PI * 2);
    gameCore.ctx.fill();
    // Krater 3
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX - radius * 0.1, centerY + radius * 0.5, radius * 0.1, 0, Math.PI * 2);
    gameCore.ctx.fill();
}

// Sterren tekenen
function drawStars() {
    const time = Date.now() / 8000; // Langzame twinkeling voor sterren
    gameCore.ctx.fillStyle = 'white';
    
    // Teken meerdere sterren verspreid over de hemel
    const numStars = 50;
    for (let i = 0; i < numStars; i++) {
        // Gebruik vaste posities voor sterren, maar met kleine animatie
        const x = (i * 329) % gameCore.canvas.width;
        const y = (i * 237) % (gameCore.GROUND_LEVEL - 50);
        
        // Laat sommige sterren twinkelen
        const twinkle = 0.5 + Math.sin(time + i * 0.3) * 0.5;
        const size = 1 + Math.sin(time + i) * 0.5;
        
        gameCore.ctx.globalAlpha = twinkle;
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(x, y, size, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
    
    // Teken enkele grotere sterren die echt twinkelen
    for (let i = 0; i < 10; i++) {
        const x = (i * 919) % gameCore.canvas.width;
        const y = (i * 537) % (gameCore.GROUND_LEVEL - 50);
        const twinkle = 0.7 + Math.sin(time * 2 + i * 0.7) * 0.3;
        
        // Teken een vijfpuntige ster voor de grote sterren
        const outerRadius = 2 + Math.sin(time + i) * 0.5;
        const innerRadius = outerRadius * 0.5;
        
        gameCore.ctx.globalAlpha = twinkle;
        gameCore.ctx.beginPath();
        for (let j = 0; j < 10; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = j * Math.PI / 5 + time * (i % 3);
            const starX = x + Math.cos(angle) * radius;
            const starY = y + Math.sin(angle) * radius;
            
            if (j === 0) gameCore.ctx.moveTo(starX, starY);
            else gameCore.ctx.lineTo(starX, starY);
        }
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
    }
    
    gameCore.ctx.globalAlpha = 1.0; // Reset alpha
}

// Nachtwolken tekenen
function drawNightClouds() {
    const time = Date.now() / 25000;
    
    // Teken donkere, blauwe wolken voor 's nachts
    gameCore.ctx.fillStyle = 'rgba(70, 90, 120, 0.7)';
    
    // Eerste wolkengroep
    const drift1 = 20 * Math.sin(time * Math.PI);
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(100 + drift1, 80, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(130 + drift1, 70, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(160 + drift1, 80, 25, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    // Tweede wolkengroep
    const drift2 = 15 * Math.cos(time * Math.PI * 0.7);
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(600 + drift2, 100, 35, 0, Math.PI * 2);
    gameCore.ctx.arc(650 + drift2, 90, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(690 + drift2, 100, 25, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    // Extra wolk in het midden - iets donkerder
    const drift3 = 10 * Math.sin(time * Math.PI * 1.3);
    gameCore.ctx.fillStyle = 'rgba(50, 70, 100, 0.7)';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(350 + drift3, 120, 25, 0, Math.PI * 2);
    gameCore.ctx.arc(380 + drift3, 110, 25, 0, Math.PI * 2);
    gameCore.ctx.arc(410 + drift3, 125, 20, 0, Math.PI * 2);
    gameCore.ctx.fill();
}

// Ground drawing
function drawGround() {
    // Huidige level theme bepalen
    const currentTheme = gameCore.currentLevel && gameCore.currentLevel.theme ? gameCore.currentLevel.theme : 'day';
    
    if (currentTheme === 'night') {
        // Donkerdere grond voor nachtthema
        gameCore.ctx.fillStyle = '#41311d';
        gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, gameCore.canvas.height - gameCore.GROUND_LEVEL);
        
        // Donkerder gras voor nachtthema
        gameCore.ctx.fillStyle = '#1a543a';
        gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, 10);
    } else {
        // Standaard grond voor dagthema
        gameCore.ctx.fillStyle = '#8B4513';
        gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, gameCore.canvas.height - gameCore.GROUND_LEVEL);
        
        // Standaard gras voor dagthema
        gameCore.ctx.fillStyle = '#2E8B57';
        gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, 10);
    }
}

// Export the render functions
window.gameRendering = {
    drawBackground,
    drawDayBackground,
    drawNightBackground,
    drawSun,
    drawMoon,
    drawStars,
    drawNightClouds,
    drawGround,
    drawPlatform,
    drawTrap,
    drawCollectible,
    drawPointsPopups,
    showPointsEarned
};