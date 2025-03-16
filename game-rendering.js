// game-rendering.js
// Bevat alle rendering functies voor het spel: achtergrond, platforms, spelers, vijanden, etc.

// Achtergrond tekenen
function drawBackground() {
    const ctx = gameCore.ctx;
    const canvas = gameCore.canvas;
    
    // Hemel kleur (lichtblauw)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#87CEEB"); // Lichter blauw bovenaan
    skyGradient.addColorStop(1, "#c2f0c2"); // Lichter groen onderaan (blend met gras)
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Zon tekenen
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(canvas.width - 70, 70, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Enkele wolken in de achtergrond
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    
    // Wolk 1
    drawCloud(ctx, 100, 80, 50);
    
    // Wolk 2
    drawCloud(ctx, 300, 50, 60);
    
    // Wolk 3
    drawCloud(ctx, 600, 100, 55);
}

// Helper functie om een wolk te tekenen
function drawCloud(ctx, x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.45, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
}

// Grond tekenen
function drawGround() {
    const ctx = gameCore.ctx;
    const canvas = gameCore.canvas;
    
    // Gras oppervlak
    ctx.fillStyle = "#45882f";
    ctx.fillRect(0, gameCore.GROUND_LEVEL, canvas.width, canvas.height - gameCore.GROUND_LEVEL);
    
    // Gras detail
    ctx.fillStyle = "#3a7128";
    const grassDetail = 15;
    for (let i = 0; i < canvas.width; i += grassDetail) {
        const height = 5 + Math.random() * 8;
        ctx.fillRect(i, gameCore.GROUND_LEVEL - height, 3, height);
    }
}

// Platform tekenen
function drawPlatform(platform) {
    const ctx = gameCore.ctx;
    
    switch(platform.type) {
        case "NORMAL":
            // Normaal platform
            ctx.fillStyle = "#8B4513"; // Donkerbruin
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Platform detail
            ctx.fillStyle = "#A0522D"; // Lichter bruin voor detail
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
            break;
            
        case "WATER":
            // Water tekenen met golvend effect
            const time = Date.now() / 1000;
            ctx.fillStyle = "#4A87FF";
            
            // Donkere achtergrond van het water
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Lichtere golven bovenop
            ctx.fillStyle = "#6B9FFF";
            ctx.beginPath();
            ctx.moveTo(platform.x, platform.y);
            
            // Teken 10 golfjes over de breedte van het water
            const segments = 10;
            const waveHeight = 5;
            const segmentWidth = platform.width / segments;
            
            for (let i = 0; i <= segments; i++) {
                const x = platform.x + i * segmentWidth;
                // Gebruik sinusfunctie voor golvende beweging, en voeg tijd toe voor animatie
                const y = platform.y + Math.sin(i + time * 2) * waveHeight;
                ctx.lineTo(x, y);
            }
            
            // Maak het pad af
            ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
            ctx.lineTo(platform.x, platform.y + platform.height);
            ctx.closePath();
            ctx.fill();
            break;
            
        case "CLIMB":
            // Klimmuur
            ctx.fillStyle = "#888888"; // Grijs
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Klimpunten tekenen
            ctx.fillStyle = "#666666";
            const gripSize = 5;
            const gridSpacing = 20;
            
            for (let y = platform.y + 10; y < platform.y + platform.height; y += gridSpacing) {
                for (let x = platform.x + 10; x < platform.x + platform.width; x += gridSpacing) {
                    ctx.fillRect(x, y, gripSize, gripSize);
                }
            }
            break;
            
        case "CLOUD":
            // Wolkplatform met transparantie
            ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
            
            // Hoofdgedeelte van de wolk
            ctx.beginPath();
            ctx.arc(platform.x + platform.width * 0.3, platform.y + platform.height * 0.5, platform.height * 0.8, 0, Math.PI * 2);
            ctx.arc(platform.x + platform.width * 0.6, platform.y + platform.height * 0.4, platform.height * 0.9, 0, Math.PI * 2);
            ctx.arc(platform.x + platform.width * 0.8, platform.y + platform.height * 0.5, platform.height * 0.7, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case "TREE":
            // Boomstam
            ctx.fillStyle = "#8B4513"; // Donkerbruin
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Boomschors detail
            const barkLines = 8;
            ctx.strokeStyle = "#A0522D"; // Lichter bruin
            ctx.lineWidth = 2;
            
            for (let i = 1; i <= barkLines; i++) {
                const y = platform.y + (platform.height / barkLines) * i;
                ctx.beginPath();
                // Golvende boomschors lines
                ctx.moveTo(platform.x, y);
                ctx.lineTo(platform.x + platform.width, y + (Math.random() * 8 - 4));
                ctx.stroke();
            }
            
            // Boomkruin (alleen als de boom hoog genoeg is)
            if (platform.height > 80) {
                ctx.fillStyle = "#228B22"; // Bosgroen
                ctx.beginPath();
                ctx.arc(platform.x + platform.width/2, platform.y - 50, 70, 0, Math.PI * 2);
                ctx.arc(platform.x + platform.width/2 - 40, platform.y - 30, 50, 0, Math.PI * 2);
                ctx.arc(platform.x + platform.width/2 + 40, platform.y - 30, 50, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
    }
}

// Valstrik tekenen
function drawTrap(trap) {
    const ctx = gameCore.ctx;
    
    switch(trap.type) {
        case "SPIKES":
            // Basis van de spikes
            ctx.fillStyle = "#666666";
            ctx.fillRect(trap.x, trap.y + trap.height * 0.7, trap.width, trap.height * 0.3);
            
            // Teken de spike punten
            ctx.fillStyle = "#999999";
            const spikeCount = Math.floor(trap.width / 10);
            const spikeWidth = trap.width / spikeCount;
            
            for (let i = 0; i < spikeCount; i++) {
                const spikeX = trap.x + i * spikeWidth;
                
                ctx.beginPath();
                ctx.moveTo(spikeX, trap.y + trap.height * 0.7);
                ctx.lineTo(spikeX + spikeWidth / 2, trap.y);
                ctx.lineTo(spikeX + spikeWidth, trap.y + trap.height * 0.7);
                ctx.closePath();
                ctx.fill();
            }
            break;
    }
}

// Puppy tekenen
function drawPuppy(puppy) {
    const ctx = gameCore.ctx;
    
    // Voeg een kleine offset toe voor beweging als de puppy niet gered is
    let drawX = puppy.x;
    if (puppy.offsetX) {
        drawX += puppy.offsetX;
    }
    
    // Puppy body
    ctx.fillStyle = "#D2B48C"; // Tan kleur
    ctx.beginPath();
    ctx.ellipse(drawX + puppy.width/2, puppy.y + puppy.height/2, puppy.width/2, puppy.height/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Puppy gezicht
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.ellipse(drawX + puppy.width * 0.7, puppy.y + puppy.height * 0.4, puppy.width * 0.3, puppy.height * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ogen
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(drawX + puppy.width * 0.8, puppy.y + puppy.height * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Oren
    ctx.fillStyle = "#B8966C";
    ctx.beginPath();
    ctx.ellipse(drawX + puppy.width * 0.3, puppy.y + puppy.height * 0.2, 7, 10, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Staart (wapperend als niet gered)
    ctx.fillStyle = "#D2B48C";
    
    if (!puppy.saved) {
        // Wapperend staartje met tijd-gebaseerde animatie
        const tailAngle = Math.sin(Date.now() / 250) * 0.5;
        ctx.save();
        ctx.translate(drawX, puppy.y + puppy.height * 0.5);
        ctx.rotate(tailAngle);
        ctx.beginPath();
        ctx.ellipse(0, 5, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else {
        // Blije puppy met rechtopstaande staart
        ctx.beginPath();
        ctx.ellipse(drawX, puppy.y + puppy.height * 0.3, 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // "Gered" indicator voor als de puppy is gered
    if (puppy.saved) {
        ctx.fillStyle = "#00CC00";
        ctx.beginPath();
        ctx.arc(drawX + puppy.width, puppy.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✓", drawX + puppy.width, puppy.y);
    }
}

// Collectible tekenen (ster of pepertje)
function drawCollectible(collectible) {
    const ctx = gameCore.ctx;
    
    if (collectible.type === "PEPPER") {
        // Pepertje tekenen
        ctx.fillStyle = "#FF0000"; // Rood voor pepertje
        
        // Pepertje lichaam
        ctx.beginPath();
        ctx.ellipse(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 
                   collectible.width/2 * 0.7, collectible.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pepertje steeltje
        ctx.fillStyle = "#006400"; // Donkergroen voor steeltje
        ctx.beginPath();
        ctx.ellipse(collectible.x + collectible.width/2, collectible.y + collectible.height/5, 
                   collectible.width/6, collectible.height/8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Glans effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.ellipse(collectible.x + collectible.width/2 - collectible.width/6, 
                   collectible.y + collectible.height/2 - collectible.height/6, 
                   collectible.width/8, collectible.height/10, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Standaard ster collectible
        drawStar(ctx, collectible.x + collectible.width/2, collectible.y + collectible.height/2, 
                 5, collectible.width/2, collectible.width/4);
        
        // Animatie toevoegen - rotatie en pulseren
        const time = Date.now() / 1000;
        const scale = 0.95 + Math.sin(time * 3) * 0.05; // Tussen 0.9 en 1.0
        
        ctx.save();
        ctx.translate(collectible.x + collectible.width/2, collectible.y + collectible.height/2);
        ctx.rotate(time);
        ctx.scale(scale, scale);
        
        // Ster tekenen
        ctx.fillStyle = "#FFD700"; // Goud kleur
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = collectible.width/2;
        const innerRadius = collectible.width/4;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Glans effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(-outerRadius/4, -outerRadius/4, outerRadius/4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Helper functie voor het tekenen van sterren
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    // Implementatie verplaatst naar drawCollectible functie
}

// Speler tekenen
function drawPlayer(player) {
    const ctx = gameCore.ctx;
    
    switch(player.animalType) {
        case "SQUIRREL":
            // Eekhoorn
            // Lichaam
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.ellipse(player.x + player.width/2, player.y + player.height/2, 
                        player.width/2, player.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Gezicht
            ctx.fillStyle = "#F8E0D0"; // Lichtere kleur voor gezicht
            ctx.beginPath();
            ctx.ellipse(player.x + player.width * 0.65, player.y + player.height * 0.5, 
                        player.width * 0.35, player.height * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ogen
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(player.x + player.width * 0.75, player.y + player.height * 0.4, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Staart (gebogen)
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.moveTo(player.x, player.y + player.height * 0.5);
            ctx.quadraticCurveTo(
                player.x - player.width * 0.5, player.y + player.height * 0.2,
                player.x, player.y
            );
            ctx.quadraticCurveTo(
                player.x + player.width * 0.1, player.y + player.height * 0.1,
                player.x, player.y + player.height * 0.5
            );
            ctx.fill();
            
            // Oren
            ctx.beginPath();
            ctx.arc(player.x + player.width * 0.6, player.y + player.height * 0.2, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case "TURTLE":
            // Schildpad
            // Schild
            ctx.fillStyle = "#007046"; // Donkerder groen voor het schild
            ctx.beginPath();
            ctx.ellipse(player.x + player.width/2, player.y + player.height/2, 
                        player.width/2, player.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Schild patroon
            ctx.fillStyle = "#00A36C"; // Lichter groen voor het patroon
            ctx.beginPath();
            ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.3);
            ctx.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.3);
            ctx.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.7);
            ctx.lineTo(player.x + player.width * 0.3, player.y + player.height * 0.7);
            ctx.closePath();
            ctx.fill();
            
            // Hoofd
            ctx.fillStyle = "#A0CF95"; // Lichtgroen
            ctx.beginPath();
            ctx.arc(player.x + player.width * 0.8, player.y + player.height * 0.5, 
                    player.width * 0.25, 0, Math.PI * 2);
            ctx.fill();
            
            // Ogen
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(player.x + player.width * 0.9, player.y + player.height * 0.45, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Poten (simpel)
            ctx.fillStyle = "#A0CF95";
            
            // Voorpoot
            ctx.beginPath();
            ctx.arc(player.x + player.width * 0.75, player.y + player.height * 0.8, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Achterpoot
            ctx.beginPath();
            ctx.arc(player.x + player.width * 0.25, player.y + player.height * 0.8, 5, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case "UNICORN":
            // Eenhoorn
            // Lichaam
            ctx.fillStyle = "#FFF"; // Wit
            ctx.beginPath();
            ctx.ellipse(player.x + player.width/2, player.y + player.height/2, 
                        player.width/2, player.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Manen (gekleurd)
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.2);
            ctx.lineTo(player.x + player.width * 0.1, player.y + player.height * 0.5);
            ctx.lineTo(player.x + player.width * 0.3, player.y + player.height * 0.5);
            ctx.closePath();
            ctx.fill();
            
            // Hoorn
            ctx.fillStyle = "#FFD700"; // Goud
            ctx.beginPath();
            ctx.moveTo(player.x + player.width * 0.7, player.y + player.height * 0.1);
            ctx.lineTo(player.x + player.width * 0.9, player.y - player.height * 0.2);
            ctx.lineTo(player.x + player.width * 0.8, player.y + player.height * 0.1);
            ctx.closePath();
            ctx.fill();
            
            // Oog
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(player.x + player.width * 0.7, player.y + player.height * 0.4, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Vliegeffect als de eenhoorn vliegt
            if (player.flying) {
                // Glitter/stof effect
                for (let i = 0; i < 5; i++) {
                    const glitterX = player.x + Math.random() * player.width;
                    const glitterY = player.y + player.height + Math.random() * 10;
                    const glitterSize = 2 + Math.random() * 3;
                    
                    ctx.fillStyle = `rgba(255, 215, 0, ${0.7 - i * 0.1})`; // Goud met afnemende dekking
                    ctx.beginPath();
                    ctx.arc(glitterX, glitterY, glitterSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Vliegkrachtmeter tekenen
            if (player.flyingPower !== undefined) {
                const meterWidth = 30;
                const meterHeight = 5;
                const meterX = player.x + player.width/2 - meterWidth/2;
                const meterY = player.y - 15;
                
                // Achtergrond van de meter
                ctx.fillStyle = "#DDD";
                ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
                
                // Vulling van de meter (afhankelijk van flyingPower)
                const fillWidth = (player.flyingPower / player.flyingPowerMax) * meterWidth;
                ctx.fillStyle = player.flyingExhausted ? "#FF5555" : "#55FF55";
                ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
                
                // Rand van de meter
                ctx.strokeStyle = "#888";
                ctx.lineWidth = 1;
                ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
            }
            break;
    }
    
    // Als de speler een pepertje heeft gegeten en vuur kan spuwen
    if (player.canBreatheFire) {
        // Vuureffect tekenen
        drawFireEffect(player.x + player.width * (player.facingRight ? 0.9 : 0.1), 
                       player.y + player.height * 0.4, 
                       player.facingRight); // facingRight bepaalt de richting van het vuur
    }
    
    // Spelersnaam tonen (alleen in multiplayer)
    if (window.gameMultiplayer && gameMultiplayer.roomId) {
        ctx.font = "10px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText(player.name, player.x + player.width/2, player.y - 10);
    }
}

// Vijanden tekenen
function drawEnemies() {
    const ctx = gameCore.ctx;
    const currentLevelData = window.levels[gameCore.currentLevel];
    
    if (!currentLevelData.enemies) return;
    
    currentLevelData.enemies.forEach(enemy => {
        switch(enemy.type) {
            case "LION":
                // Lichaam
                ctx.fillStyle = "#D2994A"; // Leeuwenkleur
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                            enemy.width/2, enemy.height/2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Manen
                ctx.fillStyle = "#A3762C"; // Donkerder bruin voor manen
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                        enemy.width/2 + 5, Math.PI * 0.7, Math.PI * 1.8);
                ctx.fill();
                
                // Gezicht
                ctx.fillStyle = "#E7CF9E"; // Lichte kleur voor gezicht
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width * (enemy.direction === 1 ? 0.7 : 0.3), 
                           enemy.y + enemy.height/2, 
                           enemy.width * 0.3, enemy.height * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Ogen
                ctx.fillStyle = "#000";
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width * (enemy.direction === 1 ? 0.8 : 0.2), 
                        enemy.y + enemy.height * 0.4, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case "DRAGON":
                // Lichaam
                ctx.fillStyle = "#258425"; // Groen voor draak
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 
                            enemy.width/2, enemy.height/2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Vleugels
                ctx.fillStyle = "#3CB371"; // Middelgroen voor vleugels
                
                // Linker of rechter vleugel, afhankelijk van de richting
                const wingX = enemy.x + enemy.width * (enemy.direction === 1 ? 0.2 : 0.8);
                const wingWidth = enemy.width * 0.6;
                const wingHeight = enemy.height * 0.8;
                
                ctx.beginPath();
                ctx.moveTo(wingX, enemy.y + enemy.height * 0.3);
                ctx.quadraticCurveTo(
                    wingX + (enemy.direction === 1 ? -wingWidth : wingWidth), 
                    enemy.y - wingHeight/2,
                    wingX, 
                    enemy.y + enemy.height * 0.7
                );
                ctx.closePath();
                ctx.fill();
                
                // Gezicht
                ctx.fillStyle = "#9ACD32"; // Lichter groen voor gezicht
                ctx.beginPath();
                ctx.ellipse(enemy.x + enemy.width * (enemy.direction === 1 ? 0.7 : 0.3), 
                           enemy.y + enemy.height/2, 
                           enemy.width * 0.3, enemy.height * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Ogen
                ctx.fillStyle = "#FF0000"; // Rode ogen
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width * (enemy.direction === 1 ? 0.8 : 0.2), 
                        enemy.y + enemy.height * 0.4, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Draak vuur
                if (enemy.fireBreathing) {
                    drawFireEffect(
                        enemy.x + enemy.width * (enemy.direction === 1 ? 0.9 : 0.1),
                        enemy.y + enemy.height * 0.4,
                        enemy.direction === 1
                    );
                }
                break;
        }
        
        // Debug info tonen (patrol afstand etc.)
        if (gameCore.debugMode) {
            ctx.font = "10px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(`Speed: ${enemy.speed}, Patrol: ${enemy.patrolDistance}`, 
                         enemy.x + enemy.width/2, enemy.y - 10);
            
            // Patrol gebied tonen
            if (enemy.startX !== undefined && enemy.patrolDistance > 0) {
                ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(enemy.startX, enemy.y + enemy.height/2);
                ctx.lineTo(enemy.startX + enemy.patrolDistance, enemy.y + enemy.height/2);
                ctx.stroke();
            }
        }
    });
}

// Helper functie voor het tekenen van vuur effecten
function drawFireEffect(x, y, facingRight) {
    const ctx = gameCore.ctx;
    const time = Date.now() / 100;
    const fireLength = 40 + Math.sin(time) * 10; // Variabele lengte voor animatie
    
    // Basis vuurpositie
    const startX = x;
    const startY = y;
    const endX = startX + (facingRight ? fireLength : -fireLength);
    
    // Gradiënt voor vuur
    const gradient = ctx.createLinearGradient(startX, startY, endX, startY);
    gradient.addColorStop(0, "rgba(255, 255, 0, 0.8)"); // Geel bij de bron
    gradient.addColorStop(0.3, "rgba(255, 120, 0, 0.7)"); // Oranje in het midden
    gradient.addColorStop(1, "rgba(255, 0, 0, 0)"); // Transparant rood aan het eind
    
    // Teken de hoofdvuurstraal
    ctx.fillStyle = gradient;
    
    // Maak een dynamisch vuurpatroon
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Bovenrand van het vuur met golven
    const waveCount = 5;
    const waveHeight = 8;
    
    for (let i = 0; i <= waveCount; i++) {
        const t = i / waveCount;
        const tx = startX + (endX - startX) * t;
        const ty = startY - waveHeight * Math.sin(t * Math.PI + time / 50);
        ctx.lineTo(tx, ty);
    }
    
    // Eindpunt
    ctx.lineTo(endX, startY);
    
    // Onderrand van het vuur met andere golven
    for (let i = waveCount; i >= 0; i--) {
        const t = i / waveCount;
        const tx = startX + (endX - startX) * t;
        const ty = startY + waveHeight * Math.sin(t * Math.PI - time / 60);
        ctx.lineTo(tx, ty);
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Vonken toevoegen
    for (let i = 0; i < 5; i++) {
        const sparkX = startX + (facingRight ? Math.random() * fireLength : -Math.random() * fireLength);
        const sparkY = startY + (Math.random() * 10 - 5);
        const sparkSize = 1 + Math.random() * 2;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Exporteer alle functies
window.gameRendering = {
    drawBackground,
    drawGround,
    drawPlatform,
    drawTrap,
    drawPuppy,
    drawCollectible,
    drawPlayer,
    drawEnemies,
    drawFireEffect
};