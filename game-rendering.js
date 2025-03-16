// game-rendering.js
// Bevat alle render functies voor het spel

// Teken vijanden
function drawEnemies() {
    if (!window.levels) return;
    const currentLevelData = window.levels[gameCore.currentLevel];
    const enemies = currentLevelData.enemies || [];
    
    enemies.forEach(enemy => {
        if (enemy.type === "LION") {
            drawLion(enemy);
        } else if (enemy.type === "DRAGON") {
            drawDragon(enemy);
        }
    });
}

// Teken een leeuw
function drawLion(lion) {
    // Bepaal richting op basis van beweging
    const facingLeft = lion.direction === -1;
    
    // Lichaam (goudkleurig)
    gameCore.ctx.fillStyle = '#DAA520'; // Goud kleur
    gameCore.ctx.fillRect(lion.x, lion.y, lion.width, lion.height);
    
    // Manen (donkerder goud) - positie afhankelijk van richting
    gameCore.ctx.fillStyle = '#B8860B'; // Donker goud
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Manen links
        gameCore.ctx.arc(lion.x + lion.width * 0.3, lion.y + lion.height * 0.4, 
                lion.width * 0.4, 0, Math.PI * 2);
    } else {
        // Manen rechts (standaard)
        gameCore.ctx.arc(lion.x + lion.width * 0.7, lion.y + lion.height * 0.4, 
                lion.width * 0.4, 0, Math.PI * 2);
    }
    
    gameCore.ctx.fill();
    
    // Ogen en Neus - positie afhankelijk van richting
    gameCore.ctx.fillStyle = 'black';
    
    if (facingLeft) {
        // Oog links
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.2, lion.y + lion.height * 0.3, 
                lion.width * 0.06, 0, Math.PI * 2);
        gameCore.ctx.fill();
        
        // Neus links
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.1, lion.y + lion.height * 0.4, 
                lion.width * 0.05, 0, Math.PI * 2);
        gameCore.ctx.fill();
    } else {
        // Oog rechts (standaard)
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.8, lion.y + lion.height * 0.3, 
                lion.width * 0.06, 0, Math.PI * 2);
        gameCore.ctx.fill();
        
        // Neus rechts (standaard)
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(lion.x + lion.width * 0.9, lion.y + lion.height * 0.4, 
                lion.width * 0.05, 0, Math.PI * 2);
        gameCore.ctx.fill();
    }
    
    // Staart - positie afhankelijk van richting
    gameCore.ctx.fillStyle = '#DAA520';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Staart rechts
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
        // Staart links (standaard)
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
    
    // Poten - positie afhankelijk van richting
    gameCore.ctx.fillStyle = '#DAA520';
    
    if (facingLeft) {
        // Poten gespiegeld
        // Voorpoot links
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.3, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
        // Achterpoot rechts
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.8, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
    } else {
        // Poten standaard
        // Voorpoot rechts
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.7, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
        // Achterpoot links
        gameCore.ctx.fillRect(
            lion.x + lion.width * 0.2, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
    }
}

// Teken een draak
function drawDragon(dragon) {
    // Bepaal richting op basis van beweging
    const facingLeft = dragon.direction === -1;
    
    // Lichaam (groen)
    gameCore.ctx.fillStyle = '#228B22'; // Forest green
    gameCore.ctx.fillRect(dragon.x, dragon.y, dragon.width, dragon.height);
    
    // Vleugels - positie afhankelijk van richting
    gameCore.ctx.fillStyle = '#006400'; // Donkerder groen
    
    if (facingLeft) {
        // Vleugels gespiegeld
        // Rechter vleugel (nu links)
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.3, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.1, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Linker vleugel (nu rechts)
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.7, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.9, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
    } else {
        // Vleugels standaard
        // Linker vleugel
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.3, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x - dragon.width * 0.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.1, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
        
        // Rechter vleugel
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(dragon.x + dragon.width * 0.7, dragon.y + dragon.height * 0.2);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.3, dragon.y - dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 1.1, dragon.y + dragon.height * 0.1);
        gameCore.ctx.lineTo(dragon.x + dragon.width * 0.9, dragon.y + dragon.height * 0.3);
        gameCore.ctx.closePath();
        gameCore.ctx.fill();
    }
    
    // Kop - positie afhankelijk van richting
    gameCore.ctx.fillStyle = '#228B22';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Kop links
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.2, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.2, 
            0, Math.PI * 2
        );
    } else {
        // Kop rechts (standaard)
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.8, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.2, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Ogen - positie afhankelijk van richting
    gameCore.ctx.fillStyle = 'red';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Oog links
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.15, 
            dragon.y + dragon.height * 0.25, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
    } else {
        // Oog rechts (standaard)
        gameCore.ctx.arc(
            dragon.x + dragon.width * 0.85, 
            dragon.y + dragon.height * 0.25, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Staart - positie afhankelijk van richting
    gameCore.ctx.fillStyle = '#228B22';
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Staart rechts
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
        // Staart links (standaard)
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
    
    // Vuur (als de draak rondvliegt)
    if (dragon.patrolDistance > 0) {
        const time = Date.now() / 100;
        // Bepaal waar het vuur vandaan komt op basis van richting
        const fireX = facingLeft ? dragon.x : dragon.x + dragon.width;
        
        // Gele buitenste vlam
        gameCore.ctx.fillStyle = 'yellow';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.15, 
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Oranje middelste vlam
        gameCore.ctx.fillStyle = 'orange';
        gameCore.ctx.beginPath();
        gameCore.ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.1, 
            0, Math.PI * 2
        );
        gameCore.ctx.fill();
        
        // Rode binnenste vlam
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

// Functie om de puppy te tekenen
function drawPuppy(puppy) {
    if (puppy.saved) return; // Teken de puppy niet als hij al gered is
    
    // Pas de positie aan met de offset voor het schudden (als die bestaat)
    const puppyX = puppy.x + (puppy.offsetX || 0);
    
    // Puppy lichaam (lichtbruin)
    gameCore.ctx.fillStyle = '#D2B48C'; // Tan kleur
    gameCore.ctx.fillRect(puppyX, puppy.y, puppy.width, puppy.height);
    
    // Puppy oren (donkerder bruin)
    // Linker oor
    gameCore.ctx.fillStyle = '#A0522D';
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(puppyX + puppy.width * 0.1, puppy.y);
    gameCore.ctx.lineTo(puppyX, puppy.y - puppy.height * 0.5);
    gameCore.ctx.lineTo(puppyX + puppy.width * 0.2, puppy.y);
    gameCore.ctx.fill();
    
    // Rechter oor
    gameCore.ctx.beginPath();
    gameCore.ctx.moveTo(puppyX + puppy.width * 0.8, puppy.y);
    gameCore.ctx.lineTo(puppyX + puppy.width, puppy.y - puppy.height * 0.5);
    gameCore.ctx.lineTo(puppyX + puppy.width * 0.9, puppy.y);
    gameCore.ctx.fill();
    
    // Puppy ogen (groot en schattig)
    gameCore.ctx.fillStyle = 'black';
    // Linker oog
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.3, 
        puppy.y + puppy.height * 0.3, 
        puppy.width * 0.12, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Wit van het oog
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.28, 
        puppy.y + puppy.height * 0.28, 
        puppy.width * 0.04, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Rechter oog
    gameCore.ctx.fillStyle = 'black';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.7, 
        puppy.y + puppy.height * 0.3, 
        puppy.width * 0.12, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Wit van het oog
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.68, 
        puppy.y + puppy.height * 0.28, 
        puppy.width * 0.04, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Puppy neus
    gameCore.ctx.fillStyle = 'black';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(
        puppyX + puppy.width * 0.5, 
        puppy.y + puppy.height * 0.5, 
        puppy.width * 0.1, 
        0, Math.PI * 2
    );
    gameCore.ctx.fill();
    
    // Puppy staart
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
    
    // Teken een kleine SOS-tekstballon boven de puppy om aan te geven dat hij hulp nodig heeft
    if (!gameCore.gameState.gameOver) {
        const bubbleWidth = puppy.width * 1.2;
        const bubbleHeight = puppy.height * 0.6;
        const bubbleX = puppyX - (bubbleWidth - puppy.width) / 2;
        const bubbleY = puppy.y - bubbleHeight - 15;
        
        // Voeg een klein beefeffect toe aan de SOS-tekstballon
        const time = Date.now() / 150;
        const trembleX = Math.sin(time) * 1.5;
        const trembleY = Math.cos(time * 1.5) * 1;
        
        // Teken de tekstballon
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
        
        // Teken de driehoek naar de puppy
        gameCore.ctx.beginPath();
        gameCore.ctx.moveTo(bubbleX + bubbleWidth/2 - 5 + trembleX, bubbleY + bubbleHeight + trembleY);
        gameCore.ctx.lineTo(bubbleX + bubbleWidth/2 + 5 + trembleX, bubbleY + bubbleHeight + trembleY);
        gameCore.ctx.lineTo(puppyX + puppy.width/2, puppy.y);
        gameCore.ctx.fill();
        
        // Teken "Help!" in de tekstballon
        gameCore.ctx.fillStyle = 'red';
        gameCore.ctx.font = '10px Arial';
        gameCore.ctx.textAlign = 'center';
        gameCore.ctx.fillText('Help!', bubbleX + bubbleWidth/2 + trembleX, bubbleY + bubbleHeight/2 + 4 + trembleY);
        
        // Geanimeerde voetstappen voor de puppy om aan te geven dat hij beweegt
        const footprintTime = Date.now() / 500;
        // Teken alleen als de functie sin ongeveer 1 is (dus maar af en toe)
        if (Math.sin(footprintTime) > 0.9) {
            gameCore.ctx.fillStyle = 'rgba(165, 42, 42, 0.3)'; // Donkerrode voetafdrukken
            // Verschillende posities voor pootafdrukken
            const positions = [
                {x: puppyX - 10, y: puppy.y + puppy.height + 5},
                {x: puppyX - 15, y: puppy.y + puppy.height + 8},
                {x: puppyX - 20, y: puppy.y + puppy.height + 3}
            ];
            
            // Teken kleine pootafdrukken
            positions.forEach(pos => {
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                gameCore.ctx.fill();
            });
        }
    }
}

// Verzamelobject tekenen
function drawCollectible(collectible) {
    // Redden sterretje
    gameCore.ctx.fillStyle = 'gold';
    
    // Ster tekenen
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
    
    // Glinstering
    gameCore.ctx.fillStyle = 'white';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(centerX - collectible.width/5, centerY - collectible.height/5, 
            collectible.width/10, 0, Math.PI * 2);
    gameCore.ctx.fill();
}

// Valstrik tekenen
function drawTrap(trap) {
    if (trap.type === "SPIKES") {
        gameCore.ctx.fillStyle = '#888';
        
        // Basis van de spikes
        gameCore.ctx.fillRect(trap.x, trap.y + trap.height - 5, trap.width, 5);
        
        // Punten tekenen
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

// Platform tekenen
function drawPlatform(platform) {
    switch(platform.type) {
        case "TRAMPOLINE":
            // Bepaal de compressie van de trampoline
            let trampolineHeight = platform.height;
            let trampolineY = platform.y;
            
            // Als de trampoline wordt ingedrukt, toon dit visueel
            if (platform.compressed) {
                const compressionAmount = Math.min(5, platform.springForce / 3);
                trampolineHeight = platform.height - compressionAmount;
                trampolineY = platform.y + compressionAmount;
            }
            
            // Teken de basis (houten platform)
            gameCore.ctx.fillStyle = '#8B4513';
            gameCore.ctx.fillRect(platform.x, platform.y + platform.height - 5, platform.width, 5);
            
            // Teken de poten
            gameCore.ctx.fillStyle = '#A52A2A'; // Donkerder bruin voor de poten
            gameCore.ctx.fillRect(platform.x + 5, platform.y + platform.height - 10, 5, 10);
            gameCore.ctx.fillRect(platform.x + platform.width - 10, platform.y + platform.height - 10, 5, 10);
            
            // Teken springmateriaal (rood)
            gameCore.ctx.fillStyle = '#FF6347';
            gameCore.ctx.fillRect(platform.x, trampolineY, platform.width, trampolineHeight - 5);
            
            // Teken horizontale lijnen voor het trampolinemat-effect
            gameCore.ctx.strokeStyle = 'white';
            gameCore.ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(platform.x, trampolineY + i * (trampolineHeight - 5) / 4);
                gameCore.ctx.lineTo(platform.x + platform.width, trampolineY + i * (trampolineHeight - 5) / 4);
                gameCore.ctx.stroke();
            }
            
            // Toon de sterkte van de trampoline visueel
            if (platform.springForce > 0) {
                const springPower = platform.springForce / platform.maxSpringForce;
                // Teken pijlen boven de trampoline om springkracht te tonen
                gameCore.ctx.fillStyle = 'rgba(255, 215, 0, ' + springPower + ')';
                
                // Pijl omhoog
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
            // Gras bovenop
            gameCore.ctx.fillStyle = '#2E8B57';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, 5);
            break;
        case "WATER":
            // Duidelijker water achtergrond
            gameCore.ctx.fillStyle = 'rgba(0, 120, 255, 0.7)';
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Animeer de golven met de game time
            const time = Date.now() / 1000;
            const waveHeight = 3;
            const waveFreq = 0.2;
            
            // Golven
            gameCore.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            gameCore.ctx.lineWidth = 2;
            
            // Bovenste golven
            gameCore.ctx.beginPath();
            for (let i = 0; i < platform.width; i += 5) {
                const y = platform.y + Math.sin((i + time * 50) * waveFreq) * waveHeight;
                if (i === 0) {
                    gameCore.ctx.moveTo(platform.x + i, y);
                } else {
                    gameCore.ctx.lineTo(platform.x + i, y);
                }
            }
            gameCore.ctx.stroke();
            
            // Kleine bubbels
            for (let i = 0; i < 5; i++) {
                const bubbleX = platform.x + Math.sin(time * (i+1)) * platform.width/4 + platform.width/2;
                const bubbleY = platform.y + ((time * 20 + i * 30) % platform.height);
                const size = 2 + Math.sin(time * 2) * 1;
                
                gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                gameCore.ctx.beginPath();
                gameCore.ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
                gameCore.ctx.fill();
            }
            break;
        case "CLOUD":
            // Magische wolkenplatform (alleen bruikbaar door de eenhoorn)
            const cloudTime = Date.now() / 10000; // Langzaam drijvende effect
            
            // Kleine animatie van de wolk (subtiel zweven)
            const offsetY = Math.sin(cloudTime * Math.PI * 2) * 3;
            
            // Wolk tekenen met een regenboog-gloed
            // Eerst een regenboogachtige gloed onder de wolk
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
            
            // Teken nu de witte wolk erbovenop
            // Hoofddeel van de wolk
            const centerX = platform.x + platform.width / 2;
            const centerY = platform.y + platform.height / 2 + offsetY;
            const radiusX = platform.width / 2;
            const radiusY = platform.height / 2;
            
            // Teken meerdere cirkels om een wolkachtige vorm te maken
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
            
            // Glinster-effect voor de magische wolken (alleen te gebruiken door eenhoorns)
            const starColors = ['#FFD700', '#FF00FF', '#00FFFF', '#FF69B4', '#ADFF2F'];
            for (let i = 0; i < 5; i++) {
                const twinkleX = centerX + Math.cos(cloudTime * 5 + i * 2) * radiusX * 0.7;
                const twinkleY = centerY + Math.sin(cloudTime * 7 + i * 2) * radiusY * 0.7;
                const twinkleSize = 3 + Math.sin(cloudTime * 10 + i) * 2;
                
                // Sterretje tekenen
                gameCore.ctx.fillStyle = starColors[i % starColors.length];
                gameCore.ctx.beginPath();
                
                // Teken een 5-puntige ster
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
            // Klimpatroon
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
            // Boomstam tekenen
            gameCore.ctx.fillStyle = '#8B4513'; // Bruine stam
            gameCore.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Boomschors textuur
            gameCore.ctx.strokeStyle = '#654321';
            gameCore.ctx.lineWidth = 2;
            for (let i = 10; i < platform.height; i += 25) {
                gameCore.ctx.beginPath();
                gameCore.ctx.moveTo(platform.x + 5, platform.y + i);
                gameCore.ctx.lineTo(platform.x + platform.width - 5, platform.y + i - 5);
                gameCore.ctx.stroke();
            }
            
            // Bladeren tekenen op de top van de boom
            const leafSize = platform.width * 1.5;
            
            gameCore.ctx.fillStyle = '#006400'; // Donkergroen
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(platform.x + platform.width / 2, platform.y - leafSize / 3, leafSize / 2, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.fillStyle = '#32CD32'; // Lichtergroen
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(platform.x + platform.width / 2 - 15, platform.y - leafSize / 2 - 10, leafSize / 3, 0, Math.PI * 2);
            gameCore.ctx.fill();
            
            gameCore.ctx.beginPath();
            gameCore.ctx.arc(platform.x + platform.width / 2 + 15, platform.y - leafSize / 2 - 5, leafSize / 3, 0, Math.PI * 2);
            gameCore.ctx.fill();
            break;
    }
}

// Achtergrond tekenen
function drawBackground() {
    // Lucht
    gameCore.ctx.fillStyle = '#87CEEB';
    gameCore.ctx.fillRect(0, 0, gameCore.canvas.width, gameCore.canvas.height);
    
    // Achtergrondwolken (wit en semi-transparant)
    gameCore.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(100, 80, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(130, 70, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(160, 80, 25, 0, Math.PI * 2);
    gameCore.ctx.fill();
    
    gameCore.ctx.beginPath();
    gameCore.ctx.arc(600, 100, 35, 0, Math.PI * 2);
    gameCore.ctx.arc(650, 90, 30, 0, Math.PI * 2);
    gameCore.ctx.arc(690, 100, 25, 0, Math.PI * 2);
    gameCore.ctx.fill();
}

// Grond tekenen
function drawGround() {
    gameCore.ctx.fillStyle = '#8B4513';
    gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, gameCore.canvas.height - gameCore.GROUND_LEVEL);
    
    // Gras bovenop
    gameCore.ctx.fillStyle = '#2E8B57';
    gameCore.ctx.fillRect(0, gameCore.GROUND_LEVEL, gameCore.canvas.width, 10);
}

// Draw player method for each animal type
function drawPlayer(player) {
    if (player.animalType === "SQUIRREL") {
        drawSquirrel(player);
    } else if (player.animalType === "TURTLE") {
        drawTurtle(player);
    } else if (player.animalType === "UNICORN") {
        drawUnicorn(player);
    }
}

function drawSquirrel(player) {
    // Bepaal richting op basis van beweging
    const facingLeft = player.velX < 0;
    
    // Lichaam
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Ogen (positie afhankelijk van richting)
    gameCore.ctx.fillStyle = "white";
    if (facingLeft) {
        // Ogen links
        gameCore.ctx.fillRect(player.x + player.width * 0.15, player.y + player.height * 0.2, player.width * 0.15, player.height * 0.15);
    } else {
        // Ogen rechts (standaard)
        gameCore.ctx.fillRect(player.x + player.width * 0.7, player.y + player.height * 0.2, player.width * 0.15, player.height * 0.15);
    }
    
    // Staart (positie afhankelijk van richting)
    gameCore.ctx.fillStyle = player.color;
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Staart rechts
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
        // Staart links (standaard)
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
    // Bepaal richting op basis van beweging
    const facingLeft = player.velX < 0;
    
    // Schild
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
    
    // Schild patroon
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
    
    // Hoofd (positie afhankelijk van richting)
    gameCore.ctx.fillStyle = "#00804A";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Hoofd links
        gameCore.ctx.ellipse(
            player.x + player.width * 0.2, 
            player.y + player.height * 0.3, 
            player.width * 0.25, 
            player.height * 0.25, 
            0, 0, Math.PI * 2
        );
    } else {
        // Hoofd rechts (standaard)
        gameCore.ctx.ellipse(
            player.x + player.width * 0.8, 
            player.y + player.height * 0.3, 
            player.width * 0.25, 
            player.height * 0.25, 
            0, 0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Pootjes (slechts zichtbaar als de schildpad beweegt)
    if (player.velX !== 0 || player.velY !== 0) {
        gameCore.ctx.fillStyle = "#00804A";
        
        if (facingLeft) {
            // Voorste poot links
            gameCore.ctx.fillRect(
                player.x + player.width * 0.2, 
                player.y + player.height * 0.6, 
                player.width * 0.15, 
                player.height * 0.3
            );
            
            // Achterste poot rechts
            gameCore.ctx.fillRect(
                player.x + player.width * 0.7, 
                player.y + player.height * 0.6, 
                player.width * 0.15, 
                player.height * 0.3
            );
        } else {
            // Voorste poot rechts (standaard)
            gameCore.ctx.fillRect(
                player.x + player.width * 0.8, 
                player.y + player.height * 0.6, 
                player.width * 0.15, 
                player.height * 0.3
            );
            
            // Achterste poot links (standaard)
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
    // Bepaal richting op basis van beweging
    const facingLeft = player.velX < 0;
    
    // Teken vliegmeter boven de eenhoorn
    if (player.flyingPower !== undefined) {
        const meterWidth = player.width * 1.2;
        const meterHeight = 5;
        const meterX = player.x - (meterWidth - player.width) / 2;
        const meterY = player.y - 15;
        
        // Achtergrond van de meter
        gameCore.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        gameCore.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Actuele vliegkracht
        const fillWidth = (player.flyingPower / player.flyingPowerMax) * meterWidth;
        
        // Kleur op basis van vliegkracht-niveau
        let meterColor;
        if (player.flyingPower > 70) {
            meterColor = 'rgb(0, 255, 0)'; // Groen
        } else if (player.flyingPower > 30) {
            meterColor = 'rgb(255, 255, 0)'; // Geel
        } else {
            meterColor = 'rgb(255, 0, 0)'; // Rood
        }
        
        gameCore.ctx.fillStyle = meterColor;
        gameCore.ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
    }
    
    // Basis-lichaam (ovaal)
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
    
    // Manen (regenboogkleuren) - positie afhankelijk van richting
    const maneColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
    
    if (facingLeft) {
        // Manen aan de rechterkant
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
        // Manen aan de linkerkant (standaard)
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
    
    // Hoorn (gouden kleur) - positie afhankelijk van richting
    gameCore.ctx.fillStyle = "#FFD700";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Hoorn links
        gameCore.ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.1, player.y - player.height * 0.2);
        gameCore.ctx.lineTo(player.x + player.width * 0.2, player.y + player.height * 0.1);
    } else {
        // Hoorn rechts (standaard)
        gameCore.ctx.moveTo(player.x + player.width * 0.7, player.y + player.height * 0.1);
        gameCore.ctx.lineTo(player.x + player.width * 0.9, player.y - player.height * 0.2);
        gameCore.ctx.lineTo(player.x + player.width * 0.8, player.y + player.height * 0.1);
    }
    
    gameCore.ctx.fill();
    
    // Pootjes - positie afhankelijk van richting
    gameCore.ctx.fillStyle = "#E56BF7";
    
    if (facingLeft) {
        // Pootjes gespiegeld
        // Voorpoot links
        gameCore.ctx.fillRect(
            player.x + player.width * 0.3, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
        // Achterpoot rechts
        gameCore.ctx.fillRect(
            player.x + player.width * 0.8, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
    } else {
        // Pootjes standaard
        // Voorpoot rechts
        gameCore.ctx.fillRect(
            player.x + player.width * 0.7, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
        // Achterpoot links
        gameCore.ctx.fillRect(
            player.x + player.width * 0.2, 
            player.y + player.height * 0.6, 
            player.width * 0.1, 
            player.height * 0.4
        );
    }
    
    // Oog - positie afhankelijk van richting
    gameCore.ctx.fillStyle = "white";
    gameCore.ctx.beginPath();
    
    if (facingLeft) {
        // Oog links
        gameCore.ctx.arc(
            player.x + player.width * 0.3, 
            player.y + player.height * 0.3, 
            player.width * 0.1, 
            0, Math.PI * 2
        );
    } else {
        // Oog rechts (standaard)
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
        // Pupil links
        gameCore.ctx.arc(
            player.x + player.width * 0.28, 
            player.y + player.height * 0.3, 
            player.width * 0.05, 
            0, Math.PI * 2
        );
    } else {
        // Pupil rechts (standaard)
        gameCore.ctx.arc(
            player.x + player.width * 0.72, 
            player.y + player.height * 0.3, 
            player.width * 0.05, 
            0, Math.PI * 2
        );
    }
    
    gameCore.ctx.fill();
    
    // Vliegende glitters als de eenhoorn vliegt
    if (player.flying) {
        const time = Date.now() / 100; // Voor animatie
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

// Exporteer de render functions
window.gameRendering = {
    drawBackground,
    drawGround,
    drawEnemies,
    drawPlatform,
    drawTrap,
    drawPuppy,
    drawCollectible,
    drawPlayer
};