// game-entities.js
// Contains all game entity behaviors, physics and game logic
// This file focuses on behavior only - rendering is handled in game-characters.js

// Player class with all behavior and physics logic
class Player {
    constructor(x, y, controls, name, defaultAnimal) {
        // Position and physics properties
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.onGround = false;
        
        // Input and identity properties
        this.controls = controls;
        this.name = name;
        this.animalType = defaultAnimal;
        this.canSwitch = true;
        
        // Visual orientation (used by renderer)
        this.facingRight = true; 
        
        // Special ability: Fire breathing
        this.canBreatheFire = false;
        this.fireBreathTimer = 0;
        
        // Life system
        this.lives = 3;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        
        // Turtle oxygen system
        this.oxygenLevel = 100;
        this.maxOxygenLevel = 100;
        this.isUnderwater = false;
        this.lowOxygenWarning = false;
        
        // Cat claw system
        this.canClaw = false;
        this.clawTimer = 0;
        this.clawActive = false;
        
        // Initialize animal-specific properties
        this.updateAnimalProperties();
    }
    
    updateAnimalProperties() {
        // Get the properties for this animal type from the game configuration
        const animal = gameCore.animalTypes[this.animalType];
        
        // Physics and collision properties
        this.width = animal.width;
        this.height = animal.height;
        this.jumpPower = animal.jumpPower;
        this.speed = animal.speed;
        
        // Visual property (used by renderer)
        this.color = animal.color;
        
        // Update the UI with the current animal
        this.updateUI();
    }
    
    // UI-specific method that updates the player information display
    updateUI() {
        this.updatePlayerInfoUI();
    }
    
    updatePlayerInfoUI() {
        let animalEmoji;
        
        switch(this.animalType) {
            case "SQUIRREL":
                animalEmoji = "🐿️";
                break;
            case "TURTLE":
                animalEmoji = "🐢";
                break;
            case "UNICORN":
                animalEmoji = "🦄";
                break;
            case "CAT":
                animalEmoji = "🐱";
                break;
        }
        
        const animalName = gameCore.animalTypes[this.animalType].name;
        const playerElement = document.getElementById(this.name === "Speler 1" ? "player1-animal" : "player2-animal");
        
        if (playerElement) {
            // Add lives emoji (heart emoji)
            const heartsEmoji = "❤️".repeat(this.lives);
            playerElement.textContent = `${animalName} ${animalEmoji} ${heartsEmoji}`;
        }
    }
    
    // Controleer of er water onder de speler is (voor doelbewust in water springen)
    checkIfWaterBelow(platforms) {
        for (let platform of platforms) {
            if (platform.type === "WATER" &&
                this.x + this.width/2 > platform.x && 
                this.x + this.width/2 < platform.x + platform.width &&
                this.y + this.height + 5 > platform.y && 
                this.y + this.height < platform.y) {
                return true;
            }
        }
        return false;
    }
    
    // Detectie voor wissel-toetsen
    isSwitchKeyPressed() {
        // Voor speler 2, check alle shift-toetsen (links en rechts)
        if (this.name === "Speler 2") {
            return gameControls.keys['Shift'] || gameControls.keys['ShiftLeft'] || gameControls.keys['ShiftRight'];
        }
        // Voor speler 1, check F-toets
        else {
            return gameControls.keys['f'] || gameControls.keys['F'];
        }
    }
    
    switchAnimal(otherPlayer) {
        // Haal toegestane dieren op voor het huidige level
        const currentLevelData = window.levels[gameCore.currentLevel];
        const allowedAnimals = currentLevelData.allowedAnimals || ["SQUIRREL", "TURTLE", "UNICORN"];
        
        // Bepaal gedrag op basis van het aantal beschikbare dieren
        if (allowedAnimals.length <= 1) {
            // Als er maar 1 diersoort is, kan er niet gewisseld worden
            return;
        } else if (allowedAnimals.length === 2) {
            // Als er precies 2 diersoorten zijn, wissel tussen de 2 spelers van dier
            // Bepaal het andere dier (welke het andere dier dan deze speler heeft)
            const otherAnimal = allowedAnimals.find(animal => animal !== this.animalType);
            
            // Wissel naar het andere dier en update UI
            console.log(`${this.name} wisselt van ${this.animalType} naar ${otherAnimal}`);
            this.animalType = otherAnimal;
            this.updateAnimalProperties();
            
            // Zorg ervoor dat de andere speler ook wisselt
            if (otherPlayer) {
                const otherPlayersOtherAnimal = allowedAnimals.find(animal => animal !== otherPlayer.animalType);
                console.log(`${otherPlayer.name} wisselt automatisch van ${otherPlayer.animalType} naar ${otherPlayersOtherAnimal}`);
                otherPlayer.animalType = otherPlayersOtherAnimal;
                otherPlayer.updateAnimalProperties();
            }
        } else {
            // Als er 3 dieren zijn, gebruik het normale cyclus-gedrag
            // Zoek de index van het huidige dier in de toegestane dieren lijst
            let currentIndex = allowedAnimals.indexOf(this.animalType);
            if (currentIndex === -1) {
                // Als het huidige dier niet toegestaan is, begin met het eerste toegestane dier
                currentIndex = 0;
            }
            
            // Bepaal het volgende dier in de cyclus
            let nextIndex = (currentIndex + 1) % allowedAnimals.length;
            let newAnimalType = allowedAnimals[nextIndex];
            
            // Als de andere speler al het gewenste dier is, sla het over en ga naar het volgende dier
            // Maar alleen als er meer dan 2 dieren toegestaan zijn
            if (otherPlayer.animalType === newAnimalType && allowedAnimals.length > 2) {
                nextIndex = (nextIndex + 1) % allowedAnimals.length;
                newAnimalType = allowedAnimals[nextIndex];
                
                // Als we nu weer bij het originele dier zijn, zoek opnieuw
                if (newAnimalType === this.animalType && allowedAnimals.length > 2) {
                    nextIndex = (nextIndex + 1) % allowedAnimals.length;
                    newAnimalType = allowedAnimals[nextIndex];
                }
            }
            
            // Wissel naar nieuw dier
            console.log(`${this.name} wisselt van ${this.animalType} naar ${newAnimalType}`);
            this.animalType = newAnimalType;
            this.updateAnimalProperties();
        }
    }
    
    update(otherPlayer, platforms, traps, collectibles) {
        // Update onkwetsbaarheidstimer als die actief is
        this.updateInvulnerability();
        
        // Reset underwater status aan het begin van elke update
        // Wordt weer op true gezet als speler in water is
        this.isUnderwater = false;
        
        // Update krauw-status van de kat
        if (this.animalType === "CAT") {
            if (this.clawTimer > 0) {
                this.clawTimer--;
                if (this.clawTimer <= 0) {
                    this.clawActive = false;
                }
            }
        }
        
        // Beweging horizontaal met inertia
        const acceleration = 0.8; // Acceleratie waarde
        const friction = 0.85;    // Wrijving (lager = meer wrijving)
        
        // Horizontale beweging
        if (gameControls.keys[this.controls.left] || gameControls.keys[this.controls.left.toLowerCase()]) {
            // Geleidelijke versnelling naar links (negatieve x)
            this.velX -= acceleration;
            // Begrens de maximale snelheid
            if (this.velX < -this.speed) {
                this.velX = -this.speed;
            }
            this.facingRight = false; // Speler kijkt naar links
        } else if (gameControls.keys[this.controls.right] || gameControls.keys[this.controls.right.toLowerCase()]) {
            // Geleidelijke versnelling naar rechts (positieve x)
            this.velX += acceleration;
            // Begrens de maximale snelheid
            if (this.velX > this.speed) {
                this.velX = this.speed;
            }
            this.facingRight = true; // Speler kijkt naar rechts
        } else {
            // Geleidelijk vertragen als er geen toetsen worden ingedrukt (wrijving)
            this.velX *= friction;
            
            // Stop beweging helemaal als het bijna 0 is (voorkom kleine bewegingen)
            if (Math.abs(this.velX) < 0.1) {
                this.velX = 0;
            }
        }
        
        // Springen als op de grond
        if ((gameControls.keys[this.controls.up] || gameControls.keys[this.controls.up.toLowerCase()]) && this.onGround) {
            this.velY = this.jumpPower;
            this.onGround = false;
        }
        
        // Snel naar beneden gaan met pijl-omlaag (handig om in water te komen)
        if (gameControls.keys[this.controls.down] || gameControls.keys[this.controls.down.toLowerCase()]) {
            if (!this.onGround) {
                this.velY += 0.8; // Sneller vallen
            } else if (this.checkIfWaterBelow(platforms)) {
                // Spring bewust in water onder de speler
                this.velY = 5;
                this.onGround = false;
            }
        }
        
        // Wisselen van dier
        let switchKeyPressed = this.isSwitchKeyPressed();
        
        if (switchKeyPressed && this.canSwitch) {
            this.switchAnimal(otherPlayer);
            this.canSwitch = false; // Voorkom snel wisselen
        } else if (!switchKeyPressed) {
            this.canSwitch = true; // Reset wanneer knop losgelaten
        }
        
        // Activeer klauwen voor kat wanneer spatiebalk wordt ingedrukt
        if (this.animalType === "CAT" && !this.clawActive) {
            // Controleer of de spatiebalk is ingedrukt
            if (gameControls.keys[' '] && this.canClaw) {
                this.clawActive = true;
                this.clawTimer = 30; // Klauwen actief voor 30 frames (halve seconde)
                this.canClaw = false; // Kan pas opnieuw gebruiken na afkoelen
                console.log("Kat activeert klauwen!");
            }
        }
        
        // Zwaartekracht toepassen (minder voor vliegende eenhoorn)
        if (this.animalType === "UNICORN" && 
            (gameControls.keys[this.controls.up] || gameControls.keys[this.controls.up.toLowerCase()]) &&
            !this.flyingExhausted && this.flyingPower > 0) {
            
            // Eenhoorn kan vliegen (omhoog bewegen) wanneer de omhoog-toets wordt ingedrukt
            // en er voldoende vliegkracht is
            this.velY = -3;
            // Glitter-effect voor vliegen (wordt getekend in draw)
            this.flying = true;
        } else {
            // Normale zwaartekracht, maar minder sterk voor eenhoorn (langzamer vallen)
            const gravityFactor = this.animalType === "UNICORN" ? 0.3 : 1.0;
            this.velY += gameCore.GRAVITY * gravityFactor;
            this.flying = false;
        }
        
        // Beperk de maximale valsnelheid om te voorkomen dat spelers door platforms vallen
        // Eenhoorn heeft lagere maximale valsnelheid (zweeft meer)
        const maxFall = this.animalType === "UNICORN" ? gameCore.MAX_FALL_SPEED * 0.6 : gameCore.MAX_FALL_SPEED;
        if (this.velY > maxFall) {
            this.velY = maxFall;
        }
        
        // Vliegmeter voor de eenhoorn
        if (this.animalType === "UNICORN") {
            // Initialiseer vliegmeter als die nog niet bestaat
            if (this.flyingPower === undefined) {
                this.flyingPower = 100; // Maximale vliegkracht
                this.flyingPowerMax = 100;
                this.flyingExhausted = false;
            }
            
            // Update vliegmeter
            if (this.flying) {
                // Verminder vliegkracht als de eenhoorn vliegt
                this.flyingPower -= 0.7;
                if (this.flyingPower <= 0) {
                    this.flyingPower = 0;
                    this.flyingExhausted = true;
                    this.flying = false; // Stop met vliegen als de vliegkracht op is
                }
            } else {
                // Herstel vliegkracht langzaam als de eenhoorn niet vliegt
                if (this.onGround) {
                    // Sneller herstel op de grond
                    this.flyingPower += 0.5;
                } else {
                    // Langzamer herstel in de lucht
                    this.flyingPower += 0.1;
                }
                
                if (this.flyingPower >= 30) {
                    this.flyingExhausted = false; // Kan weer vliegen na enig herstel
                }
                
                if (this.flyingPower > this.flyingPowerMax) {
                    this.flyingPower = this.flyingPowerMax;
                }
            }
        }
        
        // Positie bijwerken
        this.x += this.velX;
        this.y += this.velY;
        
        // Kant van canvas checken
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > gameCore.canvas.width) this.x = gameCore.canvas.width - this.width;
        
        // Grond checken
        this.onGround = false;
        if (this.y + this.height >= gameCore.GROUND_LEVEL) {
            this.y = gameCore.GROUND_LEVEL - this.height;
            this.velY = 0;
            this.onGround = true;
        }
        
        // Platform collisions
        platforms.forEach(platform => {
            if (this.collidesWithPlatform(platform)) {
                // Collision handling afhankelijk van diersoort
                if (platform.type === "WATER") {
                    if (this.animalType === "TURTLE") {
                        // Schildpad kan zwemmen
                        this.velY *= 0.5; // Langzamer vallen in water
                        
                        // Markeer dat de schildpad onder water is
                        this.isUnderwater = true;
                        
                        // Zuurstof wordt nu afgetrokken in game-rendering.js
                        // Dit zorgt voor betere zichtbaarheid van het effect
                        console.log("Schildpad is onder water");
                        
                        // Schildpad kan in water omhoog zwemmen
                        if (gameControls.keys[this.controls.up] || gameControls.keys[this.controls.up.toLowerCase()]) {
                            this.velY = -2; // Omhoog zwemmen
                        }
                        
                        // Betere horizontale beweging in water
                        if (gameControls.keys[this.controls.left] || gameControls.keys[this.controls.left.toLowerCase()]) {
                            this.velX = -this.speed * 0.8; // Iets langzamer in water
                        } else if (gameControls.keys[this.controls.right] || gameControls.keys[this.controls.right.toLowerCase()]) {
                            this.velX = this.speed * 0.8; // Iets langzamer in water
                        }
                        
                        // Laat schildpad drijven (niet zinken) in water
                        if (Math.abs(this.velY) < 0.5 && !(gameControls.keys[this.controls.up] || gameControls.keys[this.controls.up.toLowerCase()])) {
                            this.velY = -0.2; // Langzaam drijven
                        }
                    } else {
                        // Andere dieren kunnen niet zwemmen
                        this.loseLife();
                    }
                } else if (platform.type === "TRAMPOLINE") {
                    // Trampoline platform logica
                    if (this.velY > 0 && 
                        this.y + this.height < platform.y + 15 && 
                        this.y + this.height > platform.y - 10) {
                        
                        // Controleer of de speler horizontaal binnen het platform is
                        if (this.x + this.width * 0.3 < platform.x + platform.width &&
                            this.x + this.width * 0.7 > platform.x) {
                            
                            // Initialiseer trampolinekracht als die nog niet bestaat
                            if (platform.springForce === undefined) {
                                platform.springForce = 0;
                                platform.maxSpringForce = 15;
                                platform.compressed = false;
                            }
                            
                            // Als de speler pijltje-omlaag indrukt, compress de trampoline
                            if (gameControls.keys[this.controls.down] || gameControls.keys[this.controls.down.toLowerCase()]) {
                                platform.compressed = true;
                                // Verhoog de springkracht wanneer trampoline wordt ingedrukt
                                platform.springForce += 0.5;
                                if (platform.springForce > platform.maxSpringForce) {
                                    platform.springForce = platform.maxSpringForce;
                                }
                                
                                // Plaats speler op het platform en beweeg licht omlaag om compressie te tonen
                                this.y = platform.y - this.height + 5;
                                this.velY = 0;
                                this.onGround = true;
                            } else {
                                // De speler laat de pijltje-omlaag los, spring omhoog!
                                if (platform.compressed) {
                                    // Gebruik de opgeslagen springkracht voor de sprong
                                    this.velY = -platform.springForce;
                                    
                                    // Reset de springkracht na gebruik
                                    platform.springForce = 0;
                                    platform.compressed = false;
                                } else {
                                    // Normale bouncing zonder compressie
                                    this.velY = Math.min(-this.velY * 0.7, -5);
                                }
                                this.onGround = false;
                            }
                        }
                    }
                } else if (platform.type === "CLOUD") {
                    // Alleen de eenhoorn kan op wolken staan
                    if (this.animalType === "UNICORN") {
                        // Wolk-platformcollisie voor eenhoorn
                        if (this.velY > 0 && 
                            this.y + this.height < platform.y + 15 && 
                            this.y + this.height > platform.y - 10) {
                            
                            // Controleer of de eenhoorn horizontaal binnen het platform is
                            if (this.x + this.width * 0.3 < platform.x + platform.width &&
                                this.x + this.width * 0.7 > platform.x) {
                                // Plaats eenhoorn op de wolk
                                this.y = platform.y - this.height;
                                this.velY = 0;
                                this.onGround = true;
                            }
                        }
                    }
                } else if (platform.type === "NORMAL" || platform.type === "CLIMB" || platform.type === "TREE") {
                    // Als de eenhoorn vliegt, stop het vliegen als de eenhoorn een platform raakt
                    // Dit moet altijd als eerste worden gecontroleerd om door-vliegen te voorkomen
                    if (this.animalType === "UNICORN" && this.flying) {
                        // Brede collisiedetectie voor vliegende eenhoorn (meer nauwkeurig)
                        const unicornTop = this.y;
                        const unicornBottom = this.y + this.height;
                        const unicornLeft = this.x;
                        const unicornRight = this.x + this.width;
                        
                        const platformTop = platform.y;
                        const platformBottom = platform.y + platform.height;
                        const platformLeft = platform.x;
                        const platformRight = platform.x + platform.width;
                        
                        // Controleer of de eenhoorn binnen de grenzen van het platform is (of er doorheen probeert te gaan)
                        if (unicornRight > platformLeft && unicornLeft < platformRight) {
                            // Controleer of de eenhoorn omhoog vliegt tegen de onderkant van het platform
                            if (this.velY < 0 && unicornTop < platformBottom && unicornTop > platformTop) {
                                // Botst tegen de onderkant, stuit terug
                                this.velY = 1;
                                this.y = platformBottom;
                                this.flying = false;
                            }
                            // Controleer of de eenhoorn door de zijkant probeert te vliegen
                            else if (unicornBottom > platformTop && unicornTop < platformBottom) {
                                if (this.velX > 0 && unicornRight > platformLeft && unicornLeft < platformLeft) {
                                    // Botst tegen de linkerkant van het platform
                                    this.x = platformLeft - this.width;
                                    this.velX = 0;
                                } else if (this.velX < 0 && unicornLeft < platformRight && unicornRight > platformRight) {
                                    // Botst tegen de rechterkant van het platform
                                    this.x = platformRight;
                                    this.velX = 0;
                                }
                            }
                        }
                    }
                    
                    // Normale platformcollisiedetectie voor alle dieren
                    // Check of de speler op het platform landt
                    if (this.velY > 0 && 
                        this.y + this.height < platform.y + 15 && 
                        this.y + this.height > platform.y - 10) {
                        
                        // Controleer of de speler horizontaal binnen het platform is
                        if (this.x + this.width * 0.3 < platform.x + platform.width &&
                            this.x + this.width * 0.7 > platform.x) {
                            
                            // Plaats speler netjes op het platform
                            this.y = platform.y - this.height;
                            this.velY = 0;
                            this.onGround = true;
                        }
                    }
                }
                
                // Speciale platformtypes
                if ((platform.type === "CLIMB" || platform.type === "TREE") && this.animalType === "SQUIRREL") {
                    // Eekhoorn kan klimmen (tegen muren en bomen)
                    if (gameControls.keys[this.controls.up] || gameControls.keys[this.controls.up.toLowerCase()]) {
                        this.velY = -3; // Langzaam omhoog klimmen
                        this.onGround = true; // Kan nog steeds springen
                    }
                    
                    // Horizontale collisie met de boom
                    if (this.x + this.width > platform.x && 
                        this.x < platform.x + platform.width) {
                        // Blijf plakken aan de boom bij klimmen
                        if (gameControls.keys[this.controls.left] || gameControls.keys[this.controls.left.toLowerCase()] || 
                            gameControls.keys[this.controls.right] || gameControls.keys[this.controls.right.toLowerCase()]) {
                            // Zorg voor langzamere val langs de boom
                            if (this.velY > 2) {
                                this.velY = 2;
                            }
                        }
                    }
                }
            }
        });
        
        // Update vuurspuwen status als de speler een pepertje heeft gegeten
        if (this.canBreatheFire) {
            // Verlaag de timer en schakel vuurspuwen uit als de tijd voorbij is
            this.fireBreathTimer--;
            if (this.fireBreathTimer <= 0) {
                this.canBreatheFire = false;
            }
        }
        
        // Collectibles verzamelen
        
        collectibles.forEach((collectible, index) => {
            if (this.collidesWithObject(collectible)) {
                // Alleen verzamelen als de puppy is gered in het level
                const currentLevelData = window.levels[gameCore.currentLevel];
                
                // Check of dit een pepertje is
                if (collectible.type === "PEPPER") {
                    // Verzamel het pepertje en activeer vuurspuwen
                    collectibles.splice(index, 1);
                    this.canBreatheFire = true;
                    this.fireBreathTimer = 300; // 5 seconden vuurspuwen (300 frames)
                    gameCore.gameState.message = "Vuur! Je kunt nu even vuur spuwen!";
                    
                    // Voeg een vertraging toe om het bericht te tonen
                    setTimeout(() => {
                        gameCore.gameState.message = "";
                    }, 2000);
                    
                    // Multiplayer code removed - this was previously used for synchronizing collectibles
                } else if (!currentLevelData.puppy || currentLevelData.puppy.saved || gameCore.gameState.puppySaved) {
                    // Normale collectible (ster)
                    collectibles.splice(index, 1);
                    // Controleer of alle collectibles verzameld zijn
                    if (collectibles.length === 0) {
                        gameCore.levelCompleted = true;
                        gameCore.gameState.message = "Level voltooid! Druk op Spatie voor het volgende level";
                    }
                    
                } else {
                    // Toon bericht dat puppy eerst gered moet worden
                    gameCore.gameState.message = "Red eerst de puppy!";
                    // Voeg een vertraging toe om het bericht te tonen
                    setTimeout(() => {
                        gameCore.gameState.message = "";
                    }, 2000);
                }
            }
        });
        
        // Valstrikken controleren
        traps.forEach(trap => {
            if (this.collidesWithObject(trap)) {
                this.loseLife();
            }
        });
        
        // Vijanden controleren
        const currentLevelData = window.levels[gameCore.currentLevel];
        const enemies = currentLevelData.enemies || [];
        enemies.forEach(enemy => {
            if (this.collidesWithObject(enemy)) {
                // Als kat met actieve klauwen vijand aanraakt, verwijder vijand
                if (this.animalType === "CAT" && this.clawActive) {
                    // Vind de index van de vijand in de array
                    const enemyIndex = enemies.indexOf(enemy);
                    if (enemyIndex !== -1) {
                        // Verwijder de vijand uit de array
                        enemies.splice(enemyIndex, 1);
                        console.log("Kat heeft een vijand aangevallen!");
                        
                        // Laat de kat weer krabben na 2 seconden
                        setTimeout(() => {
                            this.canClaw = true;
                        }, 2000);
                    }
                } else {
                    // Bij aanraking met een vijand, leven verliezen
                    this.loseLife();
                }
            }
        });
        
        // Verhoog zuurstof alleen als de schildpad NIET onder water is
        // Dit moet aan het eind van de update gebeuren nadat alle collisie-checks zijn gedaan
        if (this.animalType === "TURTLE" && !this.isUnderwater && this.oxygenLevel < this.maxOxygenLevel) {
            this.oxygenLevel += 0.5; // Zuurstof herstelt boven water
            if (this.oxygenLevel > this.maxOxygenLevel) {
                this.oxygenLevel = this.maxOxygenLevel;
            }
            
            // Reset de waarschuwing als zuurstof weer boven 50% is
            if (this.oxygenLevel > 50) {
                this.lowOxygenWarning = false;
            }
        }
    }
    
    collidesWithPlatform(platform) {
        // Verbeterde detectie specifiek voor waterplatforms - ruimere detectie
        if (platform.type === "WATER" && this.animalType === "TURTLE") {
            // Ruimere detectie voor schildpad in water (check of enig deel van de schildpad in water is)
            return this.x < platform.x + platform.width &&
                   this.x + this.width > platform.x &&
                   this.y < platform.y + platform.height &&
                   this.y + this.height > platform.y;
        } else {
            // Normale detectie voor andere platforms
            return this.x < platform.x + platform.width &&
                   this.x + this.width > platform.x &&
                   this.y < platform.y + platform.height &&
                   this.y + this.height > platform.y;
        }
    }
    
    collidesWithObject(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    resetToStart() {
        const startPos = window.levels[gameCore.currentLevel].startPositions[this.name === "Speler 1" ? 0 : 1];
        this.x = startPos.x;
        this.y = startPos.y;
        this.velX = 0;
        this.velY = 0;
    }
    
    /**
     * Handles the player losing a life, including:
     * - Decreasing life count
     * - Setting invulnerability period
     * - Updating the UI
     * - Checking for game over condition
     * - Resetting player position
     * 
     * @returns {boolean} true if game over, false otherwise
     */
    loseLife() {
        // Only lose a life if not currently invulnerable
        if (!this.isInvulnerable) {
            // Game logic: reduce lives
            this.lives--;
            
            // UI update
            this.updatePlayerInfoUI();
            
            // Invulnerability period
            this.isInvulnerable = true;
            this.invulnerableTimer = 120; // 2 seconds at 60 fps
            
            // Check for game over condition
            if (this.lives <= 0) {
                // Game state update
                gameCore.gameState.message = `${this.name} heeft geen levens meer!`;
                
                // Reset lives 
                this.lives = 3;
                
                // UI update
                this.updatePlayerInfoUI();
                
                // Reset position
                this.resetToStart();
                return true; // Game over
            }
            
            // Reset position
            this.resetToStart();
        }
        return false; // Not game over
    }
    
    /**
     * Resets player lives when starting a new level
     */
    resetLives() {
        // Game state reset
        this.lives = 3;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        
        // UI update
        this.updatePlayerInfoUI();
    }
    
    /**
     * Updates the invulnerability timer
     * Called each frame to decrease the timer when active
     */
    updateInvulnerability() {
        if (this.isInvulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.isInvulnerable = false;
            }
        }
    }
}

/**
 * Updates the puppy in the current level
 * Handles:
 * - Movement animation (shaking)
 * - Detection of player rescue
 * - Detection of enemy capture
 * - Game state updates
 */
function updatePuppy() {
    // Safety checks
    if (!window.levels) return;
    const currentLevelData = window.levels[gameCore.currentLevel];
    if (!currentLevelData.puppy) return;
    
    const puppy = currentLevelData.puppy;
    
    // Only process if the puppy hasn't been saved yet
    if (!puppy.saved && !gameCore.gameState.puppySaved) {
        // Animation: give the puppy a small movement (shaking) to make it noticeable
        // This is used by the renderer to position the puppy
        puppy.offsetX = Math.sin(Date.now() / 300) * 2; // Slow shaking
        
        // Check if a player touches (rescues) the puppy
        const hasMultiplePlayers = currentLevelData.allowedAnimals && currentLevelData.allowedAnimals.length > 1;
        
        // Check which players to check based on number of available animals
        if (window.player1 && 
            (window.player1.collidesWithObject(puppy) || 
             (hasMultiplePlayers && window.player2 && window.player2.collidesWithObject(puppy)))) {
            // Game state update: puppy is saved
            puppy.saved = true;
            gameCore.gameState.puppySaved = true;
            gameCore.gameState.message = "Je hebt de puppy gered! Verzamel nu de ster!";
            
            // Clear message after delay
            setTimeout(() => {
                gameCore.gameState.message = "";
            }, 3000);
        }
        
        // Check if an enemy touches the puppy (puppy lost)
        // Add a small safety margin so the lion doesn't catch the puppy too easily
        const enemies = currentLevelData.enemies || [];
        for (let enemy of enemies) {
            // Smaller hitbox for enemies to catch puppy (75% of normal size)
            const adjustedEnemy = {
                x: enemy.x + enemy.width * 0.125,
                y: enemy.y + enemy.height * 0.125,
                width: enemy.width * 0.75,
                height: enemy.height * 0.75
            };
            
            if (gameCore.collidesWithObjects(adjustedEnemy, puppy)) {
                // 20% chance the puppy escapes!
                if (!gameCore.gameState.gameOver && Math.random() > 0.2) {
                    // Game state update: game over
                    gameCore.gameState.gameOver = true;
                    gameCore.gameState.message = "Oh nee! De puppy is gevangen! Druk op Spatie om opnieuw te proberen";
                }
            }
        }
    }
}

/**
 * Updates all enemies in the current level
 * Handles:
 * - Enemy movement AI
 * - Physics and collision detection
 * - Dragon fire breathing
 * - Player and puppy detection
 * 
 * @param {Array} players - The player objects to check for proximity
 */
function updateEnemies(players) {
    // Safety checks
    if (!window.levels) return;
    const currentLevelData = window.levels[gameCore.currentLevel];
    const enemies = currentLevelData.enemies || [];
    const platforms = currentLevelData.platforms || [];
    
    // No updates if game is over
    if (gameCore.gameState.gameOver) return;
    
    enemies.forEach(enemy => {
        // Initialize physics properties if they don't exist yet
        if (enemy.velY === undefined) {
            enemy.velY = 0;         // Vertical velocity
            enemy.onGround = false;  // Whether the enemy is on ground/platform
        }
        
        // Initialize fire breathing for dragons
        if (enemy.type === "DRAGON" && enemy.fireBreathingTimer === undefined) {
            enemy.fireBreathingTimer = 0;
            enemy.fireBreathing = false;
            enemy.fireBreathCooldown = 0;
        }
        
        // Als deze vijand een patrolDistance heeft, update zijn positie
        if (enemy.patrolDistance > 0) {
            // Initialiseer bewegingsrichting en startpositie als die er nog niet zijn
            if (enemy.direction === undefined) {
                enemy.direction = 1; // 1 = rechts, -1 = links
                enemy.startX = enemy.x; // Sla de originele X positie op
            }

            // Kijk eerst naar spelers in de buurt
            let nearestPlayer = null;
            let shortestDistance = Infinity;
            
            for (let player of players) {
                // Bereken afstand tot speler
                const distanceToPlayer = Math.abs(enemy.x - player.x);
                
                // Controleer of de speler dichterbij is dan de huidige dichtstbijzijnde
                if (distanceToPlayer < shortestDistance && distanceToPlayer < 200) {
                    shortestDistance = distanceToPlayer;
                    nearestPlayer = player;
                }
            }
            
            // Horizontale beweging - afhankelijk van AI-logica
            let moveX = 0;
            
            // Als er een speler dichtbij is, ga die achterna
            if (nearestPlayer) {
                // Bepaal richting naar speler
                if (enemy.x < nearestPlayer.x) {
                    enemy.direction = 1; // Naar rechts (richting speler)
                } else {
                    enemy.direction = -1; // Naar links (richting speler)
                }
                
                // Bereken beweging (nog niet toepassen)
                moveX = enemy.speed * enemy.direction;
            }
            // Anders, als er een puppy is, ga daar naartoe als die zichtbaar is
            else if (currentLevelData.puppy && !currentLevelData.puppy.saved) {
                const puppy = currentLevelData.puppy;
                const distanceToPuppy = Math.abs(enemy.x - puppy.x);
                
                // Als de vijand de puppy kan zien (binnen 150 pixels)
                if (distanceToPuppy < 150) {
                    // Verminder de reactiesnelheid van vijanden (ze reageren langzamer op de puppy)
                    // Ze gaan alleen richting puppy met een kans van 60%
                    if (Math.random() < 0.6) {
                        // Pas de richting aan om naar de puppy te gaan
                        if (enemy.x < puppy.x) {
                            enemy.direction = 1; // Naar rechts (richting puppy)
                        } else {
                            enemy.direction = -1; // Naar links (richting puppy)
                        }
                        
                        // Bereken beweging (nog niet toepassen)
                        moveX = (enemy.speed * 0.5) * enemy.direction;
                    }
                } else {
                    // Normale patrouille
                    moveX = enemy.speed * enemy.direction;
                }
            } else {
                // Normale patrouille als er geen puppy of speler in de buurt is
                moveX = enemy.speed * enemy.direction;
            }
            
            // Check of de enemy naar een rand loopt
            let isAtEdge = false;
            if (enemy.onGround) {
                // Check of er grond is onder de volgende stap
                const nextX = enemy.x + moveX;
                const hasGroundAhead = platforms.some(platform => {
                    // Controleer of er een platform direct onder de volgende positie is
                    return platform.type !== "WATER" && platform.type !== "CLOUD" &&
                           nextX + enemy.width/2 > platform.x && 
                           nextX + enemy.width/2 < platform.x + platform.width &&
                           enemy.y + enemy.height + 5 > platform.y && 
                           enemy.y + enemy.height < platform.y + 10;
                });
                
                // Check ook voor de onderrand van het level
                const hasGroundLevelAhead = enemy.y + enemy.height + 5 > gameCore.GROUND_LEVEL;
                
                // Als er geen grond voor de enemy is, staat hij aan een rand
                isAtEdge = !(hasGroundAhead || hasGroundLevelAhead);
                
                // Als de enemy aan een rand staat, draai om tenzij hij een speler volgt
                if (isAtEdge && !nearestPlayer) {
                    enemy.direction *= -1; // Draai om
                    moveX = enemy.speed * enemy.direction; // Update beweging
                }
            }
            
            // Voer horizontale beweging uit
            enemy.x += moveX;
            
            // Controleer of de vijand moet omdraaien bij patrouilleren
            // Alleen als er geen speler of puppy wordt achtervolgd
            if (!nearestPlayer && !(currentLevelData.puppy && !currentLevelData.puppy.saved && Math.abs(enemy.x - currentLevelData.puppy.x) < 150)) {
                if (enemy.x > enemy.startX + enemy.patrolDistance) {
                    // Turn around and go left
                    enemy.direction = -1;
                    // Ensure the enemy doesn't go too far
                    enemy.x = enemy.startX + enemy.patrolDistance;
                    
                    // Dragon fire breathing at the end of patrol
                    if (enemy.type === "DRAGON" && enemy.fireBreathCooldown <= 0) {
                        // Set fire state for the renderer to use
                        enemy.fireBreathing = true;
                        
                        // Configure the duration of fire breathing
                        enemy.fireBreathingTimer = 60; // Approximately 1 second of fire (60 frames)
                        
                        // Set cooldown before next fire breathing
                        enemy.fireBreathCooldown = 180; // Approximately 3 seconds cooldown
                    }
                } else if (enemy.x < enemy.startX) {
                    // Turn around and go right
                    enemy.direction = 1;
                    // Ensure the enemy doesn't go too far
                    enemy.x = enemy.startX;
                    
                    // Dragon fire breathing at the end of patrol
                    if (enemy.type === "DRAGON" && enemy.fireBreathCooldown <= 0) {
                        // Set fire state for the renderer to use
                        enemy.fireBreathing = true;
                        
                        // Configure the duration of fire breathing
                        enemy.fireBreathingTimer = 60; // Approximately 1 second of fire (60 frames)
                        
                        // Set cooldown before next fire breathing
                        enemy.fireBreathCooldown = 180; // Approximately 3 seconds cooldown
                    }
                }
            }
            
            // Zwaartekracht toepassen
            enemy.velY += gameCore.GRAVITY;
            
            // Begrens vallende snelheid
            if (enemy.velY > gameCore.MAX_FALL_SPEED) {
                enemy.velY = gameCore.MAX_FALL_SPEED;
            }
            
            // Verticale beweging toepassen
            enemy.y += enemy.velY;
            
            // Reset grondstatus
            enemy.onGround = false;
            
            // Update vuurspuwen timers voor draak
            if (enemy.type === "DRAGON") {
                if (enemy.fireBreathingTimer > 0) {
                    enemy.fireBreathingTimer--;
                    if (enemy.fireBreathingTimer <= 0) {
                        enemy.fireBreathing = false;
                    }
                }
                
                if (enemy.fireBreathCooldown > 0) {
                    enemy.fireBreathCooldown--;
                }
            }
            
            // Controleer grondcollisie
            if (enemy.y + enemy.height >= gameCore.GROUND_LEVEL) {
                enemy.y = gameCore.GROUND_LEVEL - enemy.height;
                enemy.velY = 0;
                enemy.onGround = true;
            }
            
            // Controleer platform collisies
            platforms.forEach(platform => {
                // Sla water en wolkenplatforms over voor vijanden
                if (platform.type === "WATER" || platform.type === "CLOUD") return;
                
                // Controleer of de vijand op het platform staat
                if (enemy.velY > 0 && 
                    enemy.y + enemy.height < platform.y + 10 && 
                    enemy.y + enemy.height > platform.y - 10 &&
                    enemy.x + enemy.width/2 > platform.x && 
                    enemy.x + enemy.width/2 < platform.x + platform.width) {
                    
                    enemy.y = platform.y - enemy.height;
                    enemy.velY = 0;
                    enemy.onGround = true;
                }
            });
        }
    });
}

// Export the game entity functions and classes
window.gameEntities = {
    // Main player class
    Player,
    
    // Entity update functions
    updatePuppy,    // Updates puppy state and interactions
    updateEnemies   // Updates enemy movement and behaviors
};