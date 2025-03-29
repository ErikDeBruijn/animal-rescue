// game-characters-npcs.js
// Contains rendering functions for non-playable characters (enemies and puppy)

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
    
    // Fire breathing build-up or active flame
    if ((dragon.fireBreathing || dragon.fireBreathingBuildUp) && dragon.fireBreathingIntensity > 0) {
        const time = Date.now() / 100;
        // Determine where the fire comes from based on direction
        const fireX = facingLeft ? dragon.x : dragon.x + dragon.width;
        const fireDirection = facingLeft ? -1 : 1;
        
        // If in build-up phase, show glowing mouth before fire
        if (dragon.fireBreathingBuildUp) {
            // Glowing mouth effect - pulsing red/orange to indicate build-up
            const glowSize = dragon.width * 0.15 * (dragon.fireBreathingIntensity / 100);
            const glowOpacity = 0.6 * (dragon.fireBreathingIntensity / 100);
            
            // Pulsating glow in dragon's mouth
            gameCore.ctx.fillStyle = `rgba(255, ${120 + Math.sin(time*2) * 50}, 0, ${glowOpacity})`;
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(
                fireX, 
                dragon.y + dragon.height * 0.3, 
                glowSize * (0.8 + Math.sin(time*3) * 0.2), // Pulsating size
                0, Math.PI * 2
            );
            gameCore.ctx.fill();
            
            // Small sparks around the mouth during build-up
            if (dragon.fireBreathingIntensity > 30) {
                const sparkCount = Math.floor(dragon.fireBreathingIntensity / 15);
                for (let i = 0; i < sparkCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = glowSize * (1 + Math.random() * 0.5);
                    
                    gameCore.ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, ${0.7 * Math.random()})`;
                    gameCore.ctx.beginPath();
                    gameCore.ctx.arc(
                        fireX + Math.cos(angle) * distance, 
                        dragon.y + dragon.height * 0.3 + Math.sin(angle) * distance, 
                        1 + Math.random() * 2, 
                        0, Math.PI * 2
                    );
                    gameCore.ctx.fill();
                }
            }
        }
        
        // Active fire breathing (after build-up)
        if (dragon.fireBreathing) {
            // Get intensity factor
            const intensityFactor = dragon.fireBreathingIntensity / 100;
            
            // Fire length and width parameters - modified by intensity
            const fireLength = dragon.width * 1.5 * intensityFactor;
            const fireWidth = dragon.height * 0.5 * intensityFactor;
            const flickerOffset = Math.sin(time) * 4 * intensityFactor;
            
            // Draw fire flame - mimics the player flame but in dragon's direction
            // Yellow outer flame
            gameCore.ctx.fillStyle = `rgba(255, 255, 0, ${0.7 * intensityFactor})`;
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(fireX, dragon.y + dragon.height * 0.3);
            gameCore.ctx.quadraticCurveTo(
                fireX + fireDirection * (fireLength * 0.6), 
                dragon.y + dragon.height * 0.2 + flickerOffset,
                fireX + fireDirection * fireLength, 
                dragon.y + dragon.height * 0.3 + flickerOffset/2
            );
            gameCore.ctx.quadraticCurveTo(
                fireX + fireDirection * (fireLength * 0.6), 
                dragon.y + dragon.height * 0.4 - flickerOffset,
                fireX, 
                dragon.y + dragon.height * 0.3
            );
            gameCore.ctx.fill();
            
            // Orange middle flame
            gameCore.ctx.fillStyle = `rgba(255, 165, 0, ${0.8 * intensityFactor})`;
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(fireX, dragon.y + dragon.height * 0.3);
            gameCore.ctx.quadraticCurveTo(
                fireX + fireDirection * (fireLength * 0.4), 
                dragon.y + dragon.height * 0.25 + flickerOffset/2,
                fireX + fireDirection * (fireLength * 0.7), 
                dragon.y + dragon.height * 0.3 + flickerOffset/3
            );
            gameCore.ctx.quadraticCurveTo(
                fireX + fireDirection * (fireLength * 0.4), 
                dragon.y + dragon.height * 0.35 - flickerOffset/2,
                fireX, 
                dragon.y + dragon.height * 0.3
            );
            gameCore.ctx.fill();
            
            // Red inner flame
            gameCore.ctx.fillStyle = `rgba(255, 0, 0, ${0.9 * intensityFactor})`;
            gameCore.ctx.beginPath();
            gameCore.ctx.moveTo(fireX, dragon.y + dragon.height * 0.3);
            gameCore.ctx.quadraticCurveTo(
                fireX + fireDirection * (fireLength * 0.3), 
                dragon.y + dragon.height * 0.28 + flickerOffset/3,
                fireX + fireDirection * (fireLength * 0.5), 
                dragon.y + dragon.height * 0.3
            );
            gameCore.ctx.quadraticCurveTo(
                fireX + fireDirection * (fireLength * 0.3), 
                dragon.y + dragon.height * 0.32 - flickerOffset/3,
                fireX, 
                dragon.y + dragon.height * 0.3
            );
            gameCore.ctx.fill();
            
            // Add fire particles for extra effect
            const particleCount = Math.floor(5 + intensityFactor * 10);
            for (let i = 0; i < particleCount; i++) {
                const particleSize = (1 + Math.random() * 3) * intensityFactor;
                const particleDistanceFactor = Math.random();
                const particleX = fireX + fireDirection * (particleDistanceFactor * fireLength);
                const particleY = dragon.y + dragon.height * 0.3 + (Math.random() - 0.5) * fireWidth * 0.8;
                
                // Particle color (yellow to red)
                const colors = [
                    `rgba(255,255,0,${0.7 * intensityFactor})`, 
                    `rgba(255,165,0,${0.8 * intensityFactor})`, 
                    `rgba(255,0,0,${0.9 * intensityFactor})`
                ];
                gameCore.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                gameCore.ctx.fill();
            }
        }
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
    
    // Initialize the help counter on the puppy if not already set
    if (puppy.helpCounter === undefined) {
        puppy.helpCounter = 0;
        puppy.showingHelp = false;
        puppy.helpSoundPlayed = false;
    }
    
    // Increase the help counter each frame
    puppy.helpCounter++;
    
    // Show the help bubble after 3 seconds (180 frames at 60fps)
    if (puppy.helpCounter >= 180 && puppy.helpCounter < 550) { // Ongeveer 9.2 seconden (550 frames bij 60fps)
        puppy.showingHelp = true;
        
        // Speel het puppyCrying geluid af wanneer de help-bubbel verschijnt (bij eerste frame)
        if (!puppy.helpSoundPlayed) {
            // Reset flag zodat we maximaal elke 9 seconden het geluid proberen af te spelen (als het mislukt)
            puppy.helpSoundPlayed = true;
            
            // Gebruik het gameAudio systeem om het geluid af te spelen
            // We voegen extra foutafhandeling toe specifiek voor het puppy geluid
            try {
                console.log('Puppy hulpgeluid afspelen...');
                
                // Voeg een extra controle toe om te zien of het geluid daadwerkelijk beschikbaar is
                if (gameAudio && gameAudio.sounds && gameAudio.sounds['puppyCrying']) {
                    gameAudio.playSound('puppyCrying');
                } else {
                    // Het geluid is niet beschikbaar, controleer of de speelfunctie beschikbaar is
                    console.warn('Puppy geluid niet gevonden, probeer via fallback methode');
                    
                    // Directe fallback als het geluid niet beschikbaar is
                    if (gameAudio && typeof gameAudio.playSound === 'function') {
                        // Probeert andere hondgeluiden als het primaire geluid niet werkt
                        ['puppy', 'dog', 'bark'].forEach(alternativeName => {
                            if (gameAudio.sounds[alternativeName]) {
                                console.log(`Probeer alternatief geluid: ${alternativeName}`);
                                gameAudio.playSound(alternativeName);
                                return; // Stop na het eerste geldige alternatief
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('Fout bij afspelen puppy help geluid:', e);
                // Reset de helpSoundPlayed flag zodat we het later nog een keer proberen
                setTimeout(() => {
                    puppy.helpSoundPlayed = false;
                }, 3000); // Probeer over 3 seconden nog een keer
            }
        }
    } else if (puppy.helpCounter >= 550) {
        // Verberg de help-bubbel na 9.2 seconden
        puppy.showingHelp = false;
    }
    
    // Draw a small SOS text bubble above the puppy to indicate it needs help
    if (!gameCore.gameState.gameOver && puppy.showingHelp) {
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

// Draw a piranha
function drawPiranha(piranha) {
    // Determine direction based on movement
    const facingLeft = piranha.direction === -1;
    
    // Controleer of de piranha dood is (buiten water)
    if (piranha.isDead) {
        // Save the current context state
        gameCore.ctx.save();
        
        // Translate to the center of the piranha
        gameCore.ctx.translate(
            piranha.x + piranha.width/2,
            piranha.y + piranha.height/2
        );
        
        // Rotate 180 degrees (upside down)
        gameCore.ctx.rotate(Math.PI);
        
        // Draw back at the negative position to center the rotated piranha
        // Body (grayish color when dead)
        // Top half (grayish-green)
        gameCore.ctx.fillStyle = '#607d79'; // Faded bluegreen color for top
        gameCore.ctx.fillRect(-piranha.width/2, -piranha.height/2, piranha.width, piranha.height/2);
        
        // Bottom half (grayish-red)
        gameCore.ctx.fillStyle = '#7a4242'; // Faded red color for bottom
        gameCore.ctx.fillRect(-piranha.width/2, 0, piranha.width, piranha.height/2);
        
        // Restore the context for further drawing
        gameCore.ctx.restore();
        
        // Add X for eyes (dead piranha)
        const eyeX = facingLeft ? piranha.x + piranha.width * 0.2 : piranha.x + piranha.width * 0.8;
        const eyeY = piranha.y + piranha.height * 0.3;
        
        // Draw X mark
        gameCore.ctx.strokeStyle = 'black';
        gameCore.ctx.lineWidth = 2;
        
        // X shape for eye
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(eyeX - 4, eyeY - 4);
        gameCore.ctx.lineTo(eyeX + 4, eyeY + 4);
        gameCore.ctx.moveTo(eyeX + 4, eyeY - 4);
        gameCore.ctx.lineTo(eyeX - 4, eyeY + 4);
        gameCore.ctx.stroke();
        
        // Reset line width
        gameCore.ctx.lineWidth = 1;
        
        return; // Skip rest of drawing for dead piranha
    }
    
    // Regular piranha drawing (alive)
    // Body (bluegreen top, red bottom)
    // Top half (bluegreen)
    gameCore.ctx.fillStyle = '#1a9b8d'; // Bluegreen color for top
    gameCore.ctx.fillRect(piranha.x, piranha.y, piranha.width, piranha.height/2);
    
    // Bottom half (red)
    gameCore.ctx.fillStyle = '#cc0000'; // Red color for bottom
    gameCore.ctx.fillRect(piranha.x, piranha.y + piranha.height/2, piranha.width, piranha.height/2);
    
    // Fish tail (match the blue-green color)
    gameCore.ctx.fillStyle = '#1a9b8d';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Tail to the right when facing left
        gameCore.ctx.moveTo(piranha.x + piranha.width, piranha.y + piranha.height * 0.5);
        gameCore.ctx.lineTo(piranha.x + piranha.width + piranha.width * 0.3, piranha.y);
        gameCore.ctx.lineTo(piranha.x + piranha.width + piranha.width * 0.3, piranha.y + piranha.height);
        gameCore.ctx.lineTo(piranha.x + piranha.width, piranha.y + piranha.height * 0.5);
    } else {
        // Tail to the left when facing right
        gameCore.ctx.moveTo(piranha.x, piranha.y + piranha.height * 0.5);
        gameCore.ctx.lineTo(piranha.x - piranha.width * 0.3, piranha.y);
        gameCore.ctx.lineTo(piranha.x - piranha.width * 0.3, piranha.y + piranha.height);
        gameCore.ctx.lineTo(piranha.x, piranha.y + piranha.height * 0.5);
    }
    gameCore.ctx.fill();
    
    // Eye
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.beginPath();
    if (facingLeft) {
        gameCore.ctx.arc(
            piranha.x + piranha.width * 0.2, 
            piranha.y + piranha.height * 0.3, 
            piranha.width * 0.1, 
            0, Math.PI * 2
        );
    } else {
        gameCore.ctx.arc(
            piranha.x + piranha.width * 0.8, 
            piranha.y + piranha.height * 0.3, 
            piranha.width * 0.1, 
            0, Math.PI * 2
        );
    }
    gameCore.ctx.fill();
    
    // Pupil
    gameCore.ctx.fillStyle = 'black';
    gameCore.ctx.beginPath();
    if (facingLeft) {
        gameCore.ctx.arc(
            piranha.x + piranha.width * 0.15, 
            piranha.y + piranha.height * 0.3, 
            piranha.width * 0.05, 
            0, Math.PI * 2
        );
    } else {
        gameCore.ctx.arc(
            piranha.x + piranha.width * 0.85, 
            piranha.y + piranha.height * 0.3, 
            piranha.width * 0.05, 
            0, Math.PI * 2
        );
    }
    gameCore.ctx.fill();
    
    // Dangerous teeth
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Teeth on the left side when facing left
        for (let i = 0; i < 3; i++) {
            gameCore.ctx.moveTo(piranha.x, piranha.y + piranha.height * (0.3 + i * 0.2));
            gameCore.ctx.lineTo(piranha.x - piranha.width * 0.1, piranha.y + piranha.height * (0.4 + i * 0.2));
            gameCore.ctx.lineTo(piranha.x, piranha.y + piranha.height * (0.5 + i * 0.2));
        }
    } else {
        // Teeth on the right side when facing right
        for (let i = 0; i < 3; i++) {
            gameCore.ctx.moveTo(piranha.x + piranha.width, piranha.y + piranha.height * (0.3 + i * 0.2));
            gameCore.ctx.lineTo(piranha.x + piranha.width + piranha.width * 0.1, piranha.y + piranha.height * (0.4 + i * 0.2));
            gameCore.ctx.lineTo(piranha.x + piranha.width, piranha.y + piranha.height * (0.5 + i * 0.2));
        }
    }
    gameCore.ctx.fill();
    
    // Fins (top and bottom)
    gameCore.ctx.fillStyle = '#0e7b70'; // Darker blue-green for fins
    
    // Top fin
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(piranha.x + piranha.width * 0.5, piranha.y);
    gameCore.ctx.lineTo(piranha.x + piranha.width * 0.3, piranha.y - piranha.height * 0.3);
    gameCore.ctx.lineTo(piranha.x + piranha.width * 0.7, piranha.y - piranha.height * 0.3);
    gameCore.ctx.lineTo(piranha.x + piranha.width * 0.5, piranha.y);
    gameCore.ctx.fill();
    
    // Bottom fin
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(piranha.x + piranha.width * 0.5, piranha.y + piranha.height);
    gameCore.ctx.lineTo(piranha.x + piranha.width * 0.3, piranha.y + piranha.height + piranha.height * 0.3);
    gameCore.ctx.lineTo(piranha.x + piranha.width * 0.7, piranha.y + piranha.height + piranha.height * 0.3);
    gameCore.ctx.lineTo(piranha.x + piranha.width * 0.5, piranha.y + piranha.height);
    gameCore.ctx.fill();
    
    // Bubble effect in water (randomly, more when hunting)
    const bubbleChance = piranha.huntingPlayer ? 0.7 : 0.9; // Meer bubbels tijdens het jagen
    if (Math.random() > bubbleChance) {
        // Bepaal hoeveel bubbels we willen maken
        const bubbleCount = piranha.huntingPlayer ? 2 : 1;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubbleSize = Math.random() * piranha.width * 0.1 + piranha.width * 0.05;
            const bubbleX = facingLeft ? 
                            piranha.x + piranha.width - Math.random() * 15 : 
                            piranha.x + Math.random() * 15;
            const bubbleY = piranha.y + Math.random() * piranha.height;
            
            gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            gameCore.ctx.fill();
        }
    }
    
    // Toon een "alert" teken boven de piranha als deze een speler achtervolgt
    if (piranha.huntingPlayer) {
        // Teken een uitroepteken boven de piranha
        gameCore.ctx.fillStyle = 'red';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            piranha.x + piranha.width/2,
            piranha.y - 15,
            5,
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Teken een kleine streep onder de cirkel
        gameCore.ctx.fillRect(
            piranha.x + piranha.width/2 - 1.5,
            piranha.y - 8,
            3,
            6
        );
    }
}

// Export the NPC render functions
window.gameCharactersNPCs = {
    drawLion,
    drawDragon,
    drawPuppy,
    drawPiranha
};