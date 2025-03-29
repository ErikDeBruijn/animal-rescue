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
        this.movingDirectionChanged = false; // Tracks if direction was changed by key input
        
        // Special ability: Fire breathing
        this.canBreatheFire = false;
        this.fireBreathTimer = 0;
        this.isBreathingFire = false;
        this.fireBreathActive = false; // Tracks if fire ability has been activated
        this.fireBreathingIntensity = 0; // Tracks the growth of the flame (0-100)
        
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
        this.canClaw = true; // Start with the ability to claw
        this.clawTimer = 0;
        this.clawActive = false;
        this.spaceKeyWasDown = false; // Track space key press/release
        this.feedbackShown = false; // Track if message was already shown
        
        // Mole digging system - Enhanced version
        this.canDig = true;             // Ability to start digging
        this.isDigging = false;         // Currently in digging state
        this.diggingProgress = 0;       // Progress percentage (0-100%)
        this.diggingEnergy = 100;       // Energy available for digging
        this.maxDiggingEnergy = 100;    // Maximum digging energy
        this.diggingTarget = null;      // The platform being dug through
        this.digDirection = { x: 0, y: 0 }; // Vector direction of dig
        this.originalPosition = { x: 0, y: 0 }; // Starting position of dig
        this.targetPosition = { x: 0, y: 0 };  // End position of dig
        this.showDigParticles = false;  // Whether to show particle effects
        this.diggedThroughWall = false; // Successfully dug through something
        this.digCooldown = 0;           // Cooldown timer after digging
        
        // Surface-specific properties
        this.onIce = false;  // For ice physics
        
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
        
        // Reset claw ability when switching to cat
        if (this.animalType === "CAT") {
            console.log("Switching to CAT - resetting claw ability");
            this.canClaw = true;
            this.clawActive = false;
            this.clawTimer = 0;
        }
        
        // Reset digging ability when switching to mole
        if (this.animalType === "MOLE") {
            console.log("Switching to MOLE - resetting digging ability");
            this.canDig = true;
            this.isDigging = false;
            this.diggingProgress = 0;
            this.diggingEnergy = this.maxDiggingEnergy;
            this.diggingTarget = null;
            this.digDirection = { x: 0, y: 0 };
            this.originalPosition = { x: 0, y: 0 };
            this.targetPosition = { x: 0, y: 0 };
            this.showDigParticles = false;
            this.diggedThroughWall = false;
            this.digCooldown = 0;
        }
        
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
            case "MOLE":
                animalEmoji = "🦔"; // Using hedgehog emoji since there's no mole emoji
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
        
        // Stop wind geluid als eenhoorn wisselt naar een ander dier
        if (this.animalType === "UNICORN" && this.flying) {
            this.flying = false;
            if (typeof gameAudio !== 'undefined') {
                if (typeof gameAudio.stopLoopingSound === 'function') {
                    gameAudio.stopLoopingSound('wind');
                } else if (typeof gameAudio.stopWindSound === 'function') {
                    // Legacy fallback
                    gameAudio.stopWindSound();
                }
            }
        }
        
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
                // Stop wind geluid als andere speler een eenhoorn was
                if (otherPlayer.animalType === "UNICORN" && otherPlayer.flying) {
                    otherPlayer.flying = false;
                    if (typeof gameAudio !== 'undefined') {
                        if (typeof gameAudio.stopLoopingSound === 'function') {
                            gameAudio.stopLoopingSound('wind');
                        } else if (typeof gameAudio.stopWindSound === 'function') {
                            // Legacy fallback
                            gameAudio.stopWindSound();
                        }
                    }
                }
                
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
        
        // Update respawn timer als die actief is
        if (this.isRespawning) {
            this.updateRespawnTimer();
            // Als speler aan het respawnen is, onderbreek verdere updates
            return;
        }
        
        // Reset underwater status aan het begin van elke update
        // Wordt weer op true gezet als speler in water is
        this.isUnderwater = false;
        
        // Update krauw-status van de kat
        if (this.animalType === "CAT") {
            if (this.clawTimer > 0) {
                this.clawTimer--;
                if (this.clawTimer <= 0) {
                    this.clawActive = false;
                    // Reset cooldown immediately for better responsiveness
                    this.canClaw = true;
                    
                    // Klauwen zijn niet meer actief
                }
            }
        }
        
        // Beweging horizontaal met inertia
        // Speciale waarden afhankelijk van ondergrond
        let acceleration = 0.8; // Standaard acceleratie waarde
        let friction = 0.85;    // Standaard wrijving (lager = meer wrijving)
        let maxSpeed = this.speed; // Standaard maximum snelheid
        
        // Aangepaste waarden voor ijs (bijna geen wrijving, lagere acceleratie)
        if (this.onIce) {
            acceleration = 0.3;  // Langzamere acceleratie op ijs
            friction = 0.98;     // Bijna geen wrijving op ijs
            maxSpeed = this.speed * 1.3; // Hogere maximumsnelheid vanwege gebrek aan wrijving
        }
        
        // Bepaal of de speler actief een bewegingstoets indrukt
        const isPressingLeft = gameControls.keys[this.controls.left] || gameControls.keys[this.controls.left.toLowerCase()];
        const isPressingRight = gameControls.keys[this.controls.right] || gameControls.keys[this.controls.right.toLowerCase()];
        
        // Reset de detectie van verandering in bewegingsrichting
        this.movingDirectionChanged = false;
        
        // Horizontale beweging op basis van input
        if (isPressingLeft) {
            // Geleidelijke versnelling naar links (negatieve x)
            this.velX -= acceleration;
            // Begrens de maximale snelheid
            if (this.velX < -maxSpeed) {
                this.velX = -maxSpeed;
            }
            
            // Alleen de richting aanpassen bij directe gebruikersinvoer
            if (this.facingRight) {
                this.facingRight = false;
                this.movingDirectionChanged = true; // Markeer dat richting is veranderd
            }
        } else if (isPressingRight) {
            // Geleidelijke versnelling naar rechts (positieve x)
            this.velX += acceleration;
            // Begrens de maximale snelheid
            if (this.velX > maxSpeed) {
                this.velX = maxSpeed;
            }
            
            // Alleen de richting aanpassen bij directe gebruikersinvoer
            if (!this.facingRight) {
                this.facingRight = true;
                this.movingDirectionChanged = true; // Markeer dat richting is veranderd
            }
        } else {
            // Geleidelijk vertragen als er geen toetsen worden ingedrukt (wrijving)
            this.velX *= friction;
            
            // Stop beweging helemaal als het bijna 0 is (voorkom kleine bewegingen)
            // Hogere drempel voor ijs om glijden te simuleren
            const stopThreshold = this.onIce ? 0.05 : 0.1;
            if (Math.abs(this.velX) < stopThreshold) {
                this.velX = 0;
            }
            
            // CRUCIAAL: Hier wordt de kijkrichting NIET veranderd wanneer er geen invoer is
            // Zelfs niet als de snelheid 0 wordt of als de speler door andere krachten beweegt
            // Dit zorgt voor de gewenste persistentie, vooral op loopbanden
        }
        
        // Voeg glijden toe op ijs, ook als de speler in de lucht is
        if (this.onIce && !this.onGround) {
            // Behoud een deel van de horizontale beweging, zelfs in de lucht
            this.velX *= 0.995; // Zeer lichte vertraging
        }
        
        // Springen als op de grond
        if ((gameControls.keys[this.controls.up] || gameControls.keys[this.controls.up.toLowerCase()]) && this.onGround) {
            this.velY = this.jumpPower;
            this.onGround = false;
            
            // Speel springgeluid
            if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                gameAudio.playSound('jump', 0.7);
            }
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
        if (this.animalType === "CAT") {
            // Always ensure canClaw is initialized
            if (this.canClaw === undefined) {
                this.canClaw = true;
            }
            
            // Bij het indrukken van spatiebalk: activeer klauwen als dat kan
            // We gebruiken key down/up om te zorgen dat de actie maar één keer uitgevoerd wordt
            // bij het indrukken van de spatiebalk, niet bij het ingedrukt houden
            if (gameControls.keys[' '] && !this.spaceKeyWasDown && !this.clawActive && this.canClaw) {
                this.clawActive = true;
                this.clawTimer = 70; // Klauwen actief voor 30 frames (halve seconde)
                this.canClaw = false; // Kan pas opnieuw gebruiken na afkoelen
                
                // Speel klauwgeluid (gewoon, niet als loop)
                if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                    gameAudio.playSound('claw', 0.5);
                }
                
                // Markeer dat de spatiebalk ingedrukt was
                this.spaceKeyWasDown = true;
            } else if (!gameControls.keys[' ']) {
                // Reset als de spatiebalk is losgelaten
                this.spaceKeyWasDown = false;
                
                // Force reset if cat can't claw for too long
                if (!this.canClaw && !this.clawActive) {
                    this.canClaw = true;
                }
            }
            
            // Feedback message wanneer de klauwen actief zijn
            if (this.clawActive && !this.feedbackShown) {
                gameCore.gameState.message = "Kat gebruikt klauwen!";
                setTimeout(() => {
                    if (gameCore.gameState.message === "Kat gebruikt klauwen!") {
                        gameCore.gameState.message = "";
                    }
                }, 1000);
                this.feedbackShown = true;
            } else if (!this.clawActive) {
                this.feedbackShown = false;
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
            
            // Speel wind geluid af als de eenhoorn vliegt
            if (typeof gameAudio !== 'undefined') {
                if (typeof gameAudio.playLoopingSound === 'function') {
                    gameAudio.playLoopingSound('wind');
                } else if (typeof gameAudio.playWindSound === 'function') {
                    // Legacy fallback
                    gameAudio.playWindSound();
                }
            }
        } else {
            // Normale zwaartekracht, maar minder sterk voor eenhoorn (langzamer vallen)
            const gravityFactor = this.animalType === "UNICORN" ? 0.3 : 1.0;
            this.velY += gameCore.GRAVITY * gravityFactor;
            
            // Als de eenhoorn stopt met vliegen, stop het wind geluid
            if (this.flying && typeof gameAudio !== 'undefined') {
                if (typeof gameAudio.stopLoopingSound === 'function') {
                    gameAudio.stopLoopingSound('wind');
                } else if (typeof gameAudio.stopWindSound === 'function') {
                    // Legacy fallback
                    gameAudio.stopWindSound();
                }
            }
            
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
                    
                    // Stop het wind geluid als de vliegkracht op is
                    if (typeof gameAudio !== 'undefined') {
                        if (typeof gameAudio.stopLoopingSound === 'function') {
                            gameAudio.stopLoopingSound('wind');
                        } else if (typeof gameAudio.stopWindSound === 'function') {
                            // Legacy fallback
                            gameAudio.stopWindSound();
                        }
                    }
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
        
        // Bewaar oude positie voordat we deze bijwerken (voor collision resolution)
        const oldX = this.x;
        const oldY = this.y;
        
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
            this.onIce = false; // Reset ijs-status op standaard grond
        }
        
        // Check collision met andere speler
        if (otherPlayer && typeof otherPlayer.x !== 'undefined' && this.collidesWithObject(otherPlayer)) {
            // Bepaal collision-richting
            const collisionFromLeft = this.x + this.width/2 < otherPlayer.x + otherPlayer.width/2;
            const collisionFromTop = this.y + this.height/2 < otherPlayer.y + otherPlayer.height/2;
            
            // Bereken de indringingsdiepte (hoe ver spelers elkaar overlappen)
            const overlapX = collisionFromLeft ? 
                (this.x + this.width) - otherPlayer.x : 
                (otherPlayer.x + otherPlayer.width) - this.x;
                
            const overlapY = collisionFromTop ? 
                (this.y + this.height) - otherPlayer.y : 
                (otherPlayer.y + otherPlayer.height) - this.y;
                
            // Bepaal of het een horizontale of verticale collision is gebaseerd op kleinste overlap
            if (overlapX < overlapY) {
                // Horizontale collision
                if (collisionFromLeft) {
                    this.x = otherPlayer.x - this.width; // Tegen linkerkant van andere speler
                } else {
                    this.x = otherPlayer.x + otherPlayer.width; // Tegen rechterkant van andere speler
                }
                
                // Gedeeltelijke overdracht van momentum (minder dan 100% voor betere spelervaring)
                const momentumTransfer = 0.5;
                
                // Check of beide spelers in dezelfde richting bewegen
                if ((this.velX > 0 && otherPlayer.velX > 0) || (this.velX < 0 && otherPlayer.velX < 0)) {
                    // Beweging in dezelfde richting - lichte afname van snelheid
                    this.velX *= 0.7;
                } else {
                    // Botsing in tegengestelde richting - meer weerstand
                    // Overdracht van momentum + richtingsverandering
                    const tempVelX = this.velX;
                    this.velX = -this.velX * 0.3 + otherPlayer.velX * momentumTransfer;
                    
                    // Als andere speler een Player instantie is (niet een dummy), pas ook zijn snelheid aan
                    if (otherPlayer instanceof Player) {
                        otherPlayer.velX = -otherPlayer.velX * 0.3 + tempVelX * momentumTransfer;
                    }
                }
            } else {
                // Verticale collision
                if (collisionFromTop) {
                    // Deze speler landt op de andere speler
                    this.y = otherPlayer.y - this.height;
                    this.velY = 0;
                    this.onGround = true; // Kan springen vanaf andere speler!
                    
                    // Duw de andere speler licht naar beneden
                    if (otherPlayer instanceof Player) {
                        otherPlayer.velY += 0.5; // Kleine extra zwaartekracht voor de onderste speler
                    }
                    
                    // Speel springgeluid voor springen op andere speler
                    if (typeof gameCore.playSound === 'function') {
                        gameCore.playSound('jump');
                    }
                } else {
                    // De andere speler landt op deze speler
                    this.y = otherPlayer.y + otherPlayer.height;
                    this.velY = 0;
                    
                    // Andere speler behoudt zijn 'op de grond' status (wordt in zijn eigen update geregeld)
                }
            }
        }
        
        // Platform collisions
        platforms.forEach(platform => {
            if (this.collidesWithPlatform(platform)) {
                // Collision handling afhankelijk van diersoort
                if (platform.type === "LASER") {
                    // Laser platforms are deadly for all animals
                    this.loseLife("LASER");
                } else if (platform.type === "WATER") {
                    if (this.animalType === "TURTLE") {
                        // Schildpad kan zwemmen
                        this.velY *= 0.5; // Langzamer vallen in water
                        
                        // Markeer dat de schildpad onder water is
                        this.isUnderwater = true;
                        
                        // Speel onderwater geluid af als het nog niet speelt
                        if (typeof gameAudio !== 'undefined') {
                            if (typeof gameAudio.playLoopingSound === 'function') {
                                gameAudio.playLoopingSound('underwater');
                            } else if (typeof gameAudio.playUnderwaterSound === 'function') {
                                // Legacy fallback
                                gameAudio.playUnderwaterSound();
                            }
                        }
                        
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
                        this.loseLife("WATER");
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
                                    
                                    // Speel bounce geluid
                                    if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                                        gameAudio.playSound('bounce', 0.7);
                                    }
                                } else {
                                    // Normale bouncing zonder compressie
                                    this.velY = Math.min(-this.velY * 0.7, -5);
                                    
                                    // Speel bounce geluid
                                    if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                                        gameAudio.playSound('bounce', 0.7);
                                    }
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
                } else if (platform.type === "NORMAL" || platform.type === "CLIMB" || platform.type === "TREE" || platform.type === "ICE" || platform.type === "VERTICAL" || platform.type === "TREADMILL") {
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
                    
                    // Check platform type for vertical walls
                    if (platform.type === "VERTICAL") {
                        // Vertical platforms are walls for all animals
                        
                        // Bereken collision box
                        const playerBottom = this.y + this.height;
                        const playerTop = this.y;
                        const playerLeft = this.x;
                        const playerRight = this.x + this.width;
                        
                        const platformTop = platform.y;
                        const platformBottom = platform.y + platform.height;
                        const platformLeft = platform.x;
                        const platformRight = platform.x + platform.width;
                        
                        // Check of speler tegen de zijkant van de muur botst
                        if (playerBottom > platformTop + 5 && playerTop < platformBottom - 5) {
                            if (this.velX > 0 && playerRight > platformLeft && playerLeft < platformLeft) {
                                // Botst tegen de linkerkant van de muur
                                this.x = platformLeft - this.width;
                                this.velX = 0;
                            } else if (this.velX < 0 && playerLeft < platformRight && playerRight > platformRight) {
                                // Botst tegen de rechterkant van de muur
                                this.x = platformRight;
                                this.velX = 0;
                            }
                        }
                        
                        // Check of speler op de muur landt
                        if (this.velY > 0 && 
                            playerBottom < platformTop + 10 && 
                            playerBottom > platformTop - 10) {
                            
                            // Controleer of de speler horizontaal binnen het platform is
                            if (playerRight - 10 > platformLeft && 
                                playerLeft + 10 < platformRight) {
                                
                                // Plaats speler bovenop de muur
                                this.y = platformTop - this.height;
                                this.velY = 0;
                                this.onGround = true;
                            }
                        }
                    } else {
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
                                
                                // Speciale fysica voor platformtypes
                                if (platform.type === "ICE") {
                                    // Markeer dat we op ijs staan
                                    this.onIce = true;
                                } else if (platform.type === "TREADMILL") {
                                    // Treadmill conveyor belt effect
                                    this.onIce = false; // Not slippery like ice
                                    
                                    // Haal treadmill speed op
                                    const treadmillSpeed = platform.speed !== undefined ? platform.speed : 2;
                                    const maxTreadmillSpeed = Math.abs(treadmillSpeed) * 1.5;
                                    
                                    // Bepaal of de speler actief tegen de band in beweegt
                                    const isPressingLeft = gameControls.keys[this.controls.left] || gameControls.keys[this.controls.left.toLowerCase()];
                                    const isPressingRight = gameControls.keys[this.controls.right] || gameControls.keys[this.controls.right.toLowerCase()];
                                    const isMovingAgainstTreadmill = (treadmillSpeed > 0 && isPressingLeft) || (treadmillSpeed < 0 && isPressingRight);
                                    
                                    if (isMovingAgainstTreadmill) {
                                        // Tegen de loopband in bewegen - verminder het effect maar niet volledig
                                        // Dit zorgt ervoor dat het nog steeds moeilijk is maar niet onmogelijk
                                        this.velX += treadmillSpeed * 0.05; // Verminderde kracht
                                    } else {
                                        // Met de loopband mee bewegen of stilstaan
                                        // Volledige kracht van de loopband + een minimumsnelheid garanderen
                                        this.velX += treadmillSpeed * 0.2; // Sterkere versnelling
                                        
                                        // Zorg voor minimale beweging in de richting van de loopband
                                        const minSpeed = treadmillSpeed * 0.5;
                                        if (treadmillSpeed > 0 && this.velX < minSpeed) {
                                            this.velX = minSpeed; // Minimale snelheid naar rechts
                                        } else if (treadmillSpeed < 0 && this.velX > minSpeed) {
                                            this.velX = minSpeed; // Minimale snelheid naar links
                                        }
                                    }
                                    
                                    // Begrens de maximale snelheid door de loopband
                                    if (treadmillSpeed > 0 && this.velX > maxTreadmillSpeed) {
                                        this.velX = maxTreadmillSpeed;
                                    } else if (treadmillSpeed < 0 && this.velX < -maxTreadmillSpeed) {
                                        this.velX = -maxTreadmillSpeed;
                                    }
                                } else {
                                    this.onIce = false;
                                }
                            }
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
        
        // Check if mole should activate or update digging with configured dig button
        if (this.animalType === "MOLE") {
            // Update digging progress if already digging
            if (this.isDigging) {
                this.updateDigging();
            }
            // Start digging if not already digging
            else if (this.canDig && this.isDigButtonPressed()) {
                this.activateDigging();
                console.log(`${this.name} Mole digging activated with ${this.controls.dig} key`);
            }
        }
        
        // Update vuurspuwen status als de speler een pepertje heeft gegeten
        if (this.canBreatheFire) {
            // Constant values for timing
            const maxTime = 300; // 5 seconds at 60fps
            const growPhase = 60; // First second (60 frames)
            const peakPhase = 180; // Middle 3 seconds (180 frames)
            const decreasePhase = 60; // Last second (60 frames)
            
            // Activeer vuurspuwen met spatiebalk
            if (gameControls.keys[' ']) {
                // When space is first pressed, start the timer
                if (!this.fireBreathActive) {
                    this.fireBreathActive = true;
                    this.fireBreathTimer = maxTime; // 5 seconds of fire breath
                    console.log("Fire breath activated! Timer set to 5 seconds");
                    
                    // Speel vuurgeluid
                    if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                        gameAudio.playSound('fire', 0.5);
                    }
                }
                this.isBreathingFire = true;
            } else {
                this.isBreathingFire = false;
            }
            
            // Once fire has been activated, count down the timer
            if (this.fireBreathActive) {
                // Verlaag de timer en schakel vuurspuwen uit als de tijd voorbij is
                this.fireBreathTimer--;
                
                if (this.fireBreathTimer <= 0) {
                    // Time's up, reset everything
                    this.canBreatheFire = false;
                    this.fireBreathActive = false;
                    this.fireBreathingIntensity = 0;
                } else if (this.fireBreathTimer > (maxTime - growPhase)) {
                    // Growing phase (first second)
                    const progress = (maxTime - this.fireBreathTimer) / growPhase;
                    this.fireBreathingIntensity = 100 * progress; // 0 to 100
                } else if (this.fireBreathTimer > decreasePhase) {
                    // Peak phase (middle 3 seconds)
                    this.fireBreathingIntensity = 100 * 1.5; // 50% bigger (150)
                } else {
                    // Decreasing phase (last second)
                    const progress = this.fireBreathTimer / decreasePhase;
                    this.fireBreathingIntensity = 100 * progress * 1.5; // Tapering from 150 to 0
                }
            }
        } else {
            // Zorg ervoor dat de vuurspuwen status false is als de timer afgelopen is
            this.isBreathingFire = false;
            this.fireBreathingIntensity = 0;
            this.fireBreathActive = false;
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
                    this.fireBreathActive = false; // Track if fire has been used yet
                    gameCore.gameState.message = "Vuur! Je kunt nu vuur spuwen met SPATIE!";
                    
                    // Speel verzamelgeluid
                    if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                        gameAudio.playSound('collect', 0.8);
                    }
                    
                    // Voeg een vertraging toe om het bericht te tonen
                    setTimeout(() => {
                        gameCore.gameState.message = "";
                    }, 2000);
                    
                    // Multiplayer code removed - this was previously used for synchronizing collectibles
                } else if (!currentLevelData.puppy || currentLevelData.puppy.saved || gameCore.gameState.puppySaved) {
                    // Normale collectible (ster)
                    collectibles.splice(index, 1);
                    
                    // Voeg 50 punten toe aan de score voor het verzamelen van een ster
                    gameCore.gameState.score += 50;
                    updateScoreDisplay();
                    
                    // Speel verzamelgeluid
                    if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                        gameAudio.playSound('collect', 0.8);
                    }
                    
                    // Toon puntenpopup
                    if (typeof gameRendering !== 'undefined' && typeof gameRendering.showPointsEarned === 'function') {
                        gameRendering.showPointsEarned(collectible.x + collectible.width/2, collectible.y, 50);
                    }
                    
                    // Controleer of alle collectibles verzameld zijn
                    if (collectibles.length === 0) {
                        gameCore.levelCompleted = true;
                        gameCore.gameState.message = "Level voltooid!";
                        // De "Druk op spatie" prompt wordt nu apart getekend in de game loop
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
                this.loseLife("TRAP");
            }
        });
        
        // Vijanden controleren
        const currentLevelData = window.levels[gameCore.currentLevel];
        const enemies = currentLevelData.enemies || [];
        
        enemies.forEach((enemy, enemyIndex) => {
            // Check direct collision with player
            if (this.collidesWithObject(enemy)) {
                // Controleer eerst of de vijand een dode piranha is
                // Dode piranha's kunnen geen schade aanrichten
                if (enemy.isDead || enemy.canHurtPlayer === false) {
                    // Skip schade voor dode piranha's
                } 
                // Als kat met actieve klauwen vijand aanraakt, verwijder vijand
                else if (this.animalType === "CAT") {
                    console.log(`Cat colliding with enemy! clawActive: ${this.clawActive}`);
                    
                    if (this.clawActive) {
                        console.log("CAT ATTACKING ENEMY WITH CLAWS!");
                        // Create a visual claw effect on the enemy before removing it
                        if (!enemy.clawEffect) {
                            // Add claw effect properties to the enemy
                            enemy.clawEffect = true;
                            enemy.clawTimer = 15; // Claw animation frames (0.25 seconds)
                            
                            // Alert message for debugging
                            console.log(`ENEMY HIT WITH CLAWS! Enemy type: ${enemy.type}, position: ${enemy.x},${enemy.y}`);
                            
                            // After the claw animation, remove the enemy
                            setTimeout(() => {
                                // Only remove if enemy is still in the array
                                const currentIndex = enemies.indexOf(enemy);
                                if (currentIndex !== -1) {
                                    // Verwijder de vijand uit de array
                                    enemies.splice(currentIndex, 1);
                                    console.log("Kat heeft een vijand verslagen!");
                                    
                                    // Add points for defeating enemy
                                    gameCore.gameState.score += 100;
                                    if (typeof gameRendering !== 'undefined' && typeof gameRendering.showPointsEarned === 'function') {
                                        gameRendering.showPointsEarned(enemy.x + enemy.width/2, enemy.y, 100);
                                    }
                                    
                                    // Add points for defeating enemy
                                    gameCore.gameState.score += 100;
                                    updateScoreDisplay(); // Update score UI
                                    
                                    // Show message about defeating enemy with claws
                                    gameCore.gameState.message = "Vijand verslagen met klauwen! +100 punten!";
                                    setTimeout(() => {
                                        if (gameCore.gameState.message === "Vijand verslagen met klauwen! +100 punten!") {
                                            gameCore.gameState.message = "";
                                        }
                                    }, 2000);
                                }
                            }, 250); // 250ms = 15 frames at 60fps
                        }
                    } else {
                        // Bij aanraking met een vijand, leven verliezen
                        console.log("Cat collided with enemy but claws not active - losing life");
                        this.loseLife("ENEMY");
                    }
                } else {
                    // Bij aanraking met een vijand, leven verliezen
                    this.loseLife("ENEMY");
                }
            }
            
            // Check if player is hit by dragon fire
            if (enemy.type === "DRAGON" && enemy.fireBreathing && enemy.fireBreathingIntensity > 30) {
                // Calculate fire breath hitbox - similar to player's fire but from dragon
                const facingLeft = enemy.direction === -1;
                const fireStartX = facingLeft ? enemy.x : enemy.x + enemy.width;
                const fireDirection = enemy.direction;
                
                // Fire hitbox properties - scales with intensity
                const fireLength = enemy.width * 1.5 * (enemy.fireBreathingIntensity / 100);
                const fireWidth = enemy.height * 0.7;
                
                // Dragon's fire hitbox
                const fireHitbox = {
                    x: facingLeft ? fireStartX - fireLength : fireStartX,
                    y: enemy.y + enemy.height * 0.3 - fireWidth/2,
                    width: fireLength,
                    height: fireWidth
                };
                
                // Check if player is hit by fire
                if (this.collidesWithObject(fireHitbox)) {
                    // Player is hit by dragon fire - lose a life
                    this.loseLife("FIRE");
                    gameCore.gameState.message = "Pas op voor drakenvuur!";
                    setTimeout(() => {
                        if (gameCore.gameState.message === "Pas op voor drakenvuur!") {
                            gameCore.gameState.message = "";
                        }
                    }, 2000);
                }
            }
            
            // Check if fire breath hits enemy
            if (this.isBreathingFire && this.fireBreathingIntensity > 30) {
                // Calculate fire breath hitbox
                const facingLeft = !this.facingRight;
                const fireStartX = facingLeft ? this.x : this.x + this.width;
                const fireDirection = facingLeft ? -1 : 1;
                
                // Fire hitbox properties - scales with intensity
                const fireLength = this.width * 2.0 * (this.fireBreathingIntensity / 100);
                const fireWidth = this.height * 0.7;
                
                // Simplified hitbox for the fire breath
                const fireHitbox = {
                    x: facingLeft ? fireStartX - fireLength : fireStartX,
                    y: this.y + this.height * 0.1,
                    width: fireLength,
                    height: fireWidth
                };
                
                // Check if fire hitbox collides with enemy
                if (collidesWithObjects(fireHitbox, enemy)) {
                    // Remove enemy when hit by fire
                    if (enemyIndex !== -1) {
                        // Create a visual fire effect on the enemy before removing it
                        if (!enemy.burningEffect) {
                            // Add burning effect properties to the enemy
                            enemy.burningEffect = true;
                            enemy.burningTimer = 15; // Burning animation frames (0.25 seconds)
                            
                            // After the burning animation, remove the enemy
                            setTimeout(() => {
                                // Only remove if enemy is still in the array
                                const currentIndex = enemies.indexOf(enemy);
                                if (currentIndex !== -1) {
                                    // Verwijder de vijand uit de array
                                    enemies.splice(currentIndex, 1);
                                    console.log("Vuur heeft een vijand verslagen!");
                                    
                                    // Add points for defeating enemy
                                    gameCore.gameState.score += 100;
                                    if (typeof gameRendering !== 'undefined' && typeof gameRendering.showPointsEarned === 'function') {
                                        gameRendering.showPointsEarned(enemy.x + enemy.width/2, enemy.y, 100);
                                    }
                                    
                                    // Show message about defeating enemy with fire
                                    gameCore.gameState.message = "Vijand verslagen met vuur! +100 punten!";
                                    setTimeout(() => {
                                        if (gameCore.gameState.message === "Vijand verslagen met vuur! +100 punten!") {
                                            gameCore.gameState.message = "";
                                        }
                                    }, 2000);
                                }
                            }, 250); // 250ms = 15 frames at 60fps
                        }
                    }
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
            
            // Stop onderwater geluid als speler uit het water is
            if (typeof gameAudio !== 'undefined') {
                if (typeof gameAudio.stopLoopingSound === 'function') {
                    gameAudio.stopLoopingSound('underwater');
                } else if (typeof gameAudio.stopUnderwaterSound === 'function') {
                    // Legacy fallback
                    gameAudio.stopUnderwaterSound();
                }
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
        
        // Reset flying state and stop wind sound
        if (this.animalType === "UNICORN") {
            this.flying = false;
            if (typeof gameAudio !== 'undefined') {
                if (typeof gameAudio.stopLoopingSound === 'function') {
                    gameAudio.stopLoopingSound('wind');
                } else if (typeof gameAudio.stopWindSound === 'function') {
                    // Legacy fallback
                    gameAudio.stopWindSound();
                }
            }
        }
        
        // Reset claw state
        if (this.animalType === "CAT") {
            this.clawActive = false;
            this.clawTimer = 0;
            this.spaceKeyWasDown = false;
        }
        
        // Reset turtle underwater state
        if (this.animalType === "TURTLE") {
            this.isUnderwater = false;
            this.oxygenLevel = this.maxOxygenLevel; // Reset zuurstofniveau
            
            // Stop onderwater geluid als dat nog speelt
            if (typeof gameAudio !== 'undefined') {
                if (typeof gameAudio.stopLoopingSound === 'function') {
                    gameAudio.stopLoopingSound('underwater');
                } else if (typeof gameAudio.stopUnderwaterSound === 'function') {
                    // Legacy fallback
                    gameAudio.stopUnderwaterSound();
                }
            }
        }
    }
    
    /**
     * Handles the player losing a life, including:
     * - Decreasing life count
     * - Setting invulnerability period
     * - Updating the UI
     * - Checking for game over condition
     * 
     * @param {string} damageType - Type of damage that caused life loss (e.g., "LASER")
     * @returns {boolean} true if game over, false otherwise
     */
    loseLife(damageType) {
        // Only lose a life if not currently invulnerable
        if (!this.isInvulnerable) {
            // Game logic: reduce lives
            this.lives--;
            
            // UI update
            this.updatePlayerInfoUI();
            
            // Invulnerability period - Langer dan voorheen
            this.isInvulnerable = true;
            this.invulnerableTimer = 180; // 3 seconds at 60 fps (was 2 seconden)
            
            // Speel geluid af afhankelijk van schade type
            if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                if (damageType === "LASER") {
                    // Speel laser zap geluid op maximaal volume als de speler een laser raakt
                    gameAudio.playSound('laserZap', 1.0);
                } else {
                    // Speel lose-life geluid voor andere types schade
                    gameAudio.playSound('lose-life', 0.9);
                }
            }
            
            // Stop alle lopende geluidseffecten
            if (typeof gameAudio !== 'undefined' && typeof gameAudio.stopAllLoopingSounds === 'function') {
                gameAudio.stopAllLoopingSounds();
            }
            
            // Check for game over condition
            if (this.lives <= 0) {
                // Game state update
                gameCore.gameState.message = `${this.name} heeft geen levens meer!`;
                
                // Speel game over geluid
                if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                    // Voor doodgaan (alle 3 levens kwijt) gebruik gameOver geluid
                    gameAudio.playSound('gameOver', 0.9);
                }
                
                // Initialiseer respawn delay
                this.isRespawning = true;
                this.respawnTimer = 10; // 10 seconden
                this.respawnTimerFrames = 10 * 60; // 10 seconden in frames (bij 60 fps)
                
                // Reset lives 
                this.lives = 3;
                
                // UI update
                this.updatePlayerInfoUI();
                
                // Reset position
                this.resetToStart();
                return true; // Game over
            }
            
            // NIEUW: blijf op dezelfde plek in plaats van naar de start te resetten
            // Alleen de snelheid wordt gereset
            this.velX = 0;
            this.velY = 0;
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
     * Activates the mole's digging ability
     * Starts the progressive digging process
     */
    activateDigging() {
        // Debug logging when debug mode is active
        if (gameCore.gameState.debugLevel >= 1) {
            console.log("activateDigging called for", this.name, "canDig:", this.canDig, "isDigging:", this.isDigging, "animalType:", this.animalType);
        }
        
        // Can't dig if: not a mole, already digging, on cooldown, or insufficient energy
        if (this.animalType !== "MOLE" || this.isDigging || !this.canDig || this.diggingEnergy < 10) {
            if (gameCore.gameState.debugLevel >= 1) {
                let reason = "unknown";
                if (this.animalType !== "MOLE") reason = "not a mole";
                else if (this.isDigging) reason = "already digging";
                else if (!this.canDig) reason = "on cooldown";
                else if (this.diggingEnergy < 10) reason = "not enough energy";
                
                console.log("Digging activation rejected:", reason);
            }
            return;
        }
        
        // Always log when digging starts, regardless of debug level
        console.log("DIGGING ACTIVATED! 🦔💪");
        
        // Speel graafgeluid
        if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
            gameAudio.playSound('dig', 0.6);
        }
        
        // Store the starting position for interpolation
        this.originalPosition = { x: this.x, y: this.y };
        
        // Initialize digging state
        this.isDigging = true;
        this.diggingProgress = 0;
        this.showDigParticles = true;
        
        // Find target to dig through
        this.findDiggingTarget();
        
        // If no valid target, cancel digging
        if (!this.diggingTarget) {
            if (gameCore.gameState.debugLevel >= 1) {
                console.log("No valid digging target found");
            }
            this.isDigging = false;
            this.showDigParticles = false;
            return;
        }
        
        // Feedback message
        gameCore.gameState.message = "Mol graaft!";
        setTimeout(() => {
            if (gameCore.gameState.message === "Mol graaft!") {
                gameCore.gameState.message = "";
            }
        }, 1000);
    }
    
    /**
     * This method should be called every frame to update the digging progress
     */
    updateDigging() {
        if (!this.isDigging || !this.diggingTarget) return;
        
        // Check if digging button is still pressed
        const isDigButtonPressed = this.isDigButtonPressed();
        
        // Only continue digging if button is held and has energy
        if (isDigButtonPressed && this.diggingEnergy > 0) {
            // Calculate progress rate based on material hardness
            const hardness = this.calculateDiggingHardness();
            const progressRate = 1.4 / hardness; // Doubled progress rate for faster digging
            
            // Advance progress
            this.diggingProgress += progressRate;
            this.diggingEnergy -= 0.4; // Consume energy while digging
            
            // Update position based on progress
            this.updateDiggingPosition();
            
            // Check if digging is complete
            if (this.diggingProgress >= 100) {
                this.completeDigging();
            }
        } else {
            // Button released or out of energy - revert progress gradually
            this.diggingProgress -= 0.5;
            
            if (this.diggingProgress <= 0) {
                // Digging failed, reset
                this.cancelDigging();
            } else {
                // Still in progress, update position
                this.updateDiggingPosition();
            }
        }

        // Energy regeneration always happens (even during digging, but slower)
        const regenRate = isDigButtonPressed ? 0.05 : 0.3; // Much faster regen when not digging
        
        if (this.diggingEnergy < this.maxDiggingEnergy) {
            this.diggingEnergy += regenRate;
            if (this.diggingEnergy > this.maxDiggingEnergy) {
                this.diggingEnergy = this.maxDiggingEnergy;
            }
        }
    }
    
    /**
     * Check if the digging button for this player is currently pressed
     */
    isDigButtonPressed() {
        // Get the dig button from player controls configuration
        const digButton = this.controls.dig;
        
        // Handle special cases for Control key which can be multiple keys
        if (digButton === "Control") {
            return gameControls.keys['Control'] || gameControls.keys['ControlLeft'] || gameControls.keys['ControlRight'];
        }
        
        // For normal keys like 'g', check both upper and lower case
        return gameControls.keys[digButton] || gameControls.keys[digButton.toUpperCase()];
    }
    
    /**
     * Calculate hardness factor based on the type of object being dug through
     */
    calculateDiggingHardness() {
        if (!this.diggingTarget) return 1;
        
        // Different materials have different hardness values
        if (this.diggingTarget.type === "VERTICAL") {
            return 2.0; // Vertical walls are harder to dig through
        } else if (this.digDirection.y > 0) {
            return 1.2; // Digging down is easier
        } else {
            return 1.5; // Standard platform hardness
        }
    }
    
    /**
     * Update player position based on digging progress
     */
    updateDiggingPosition() {
        if (!this.diggingTarget || this.diggingProgress <= 0) return;
        
        // Calculate progress as a percentage (0-1)
        const progress = Math.min(this.diggingProgress / 100, 1);
        
        // Interpolate between original position and target position
        this.x = this.originalPosition.x + (this.targetPosition.x - this.originalPosition.x) * progress;
        this.y = this.originalPosition.y + (this.targetPosition.y - this.originalPosition.y) * progress;
    }
    
    /**
     * Successfully complete the digging process
     */
    completeDigging() {
        // Set final position with EXTRA OFFSET to prevent stuck in walls
        if (this.digDirection.x !== 0) {
            // For horizontal digging, add extra distance in x direction
            this.x = this.targetPosition.x + (this.digDirection.x * 10); // Add 10 more pixels in dig direction
        } else {
            // For vertical digging, just use the target position
            this.x = this.targetPosition.x;
        }
        this.y = this.targetPosition.y;
        
        // Apply strong momentum in the digging direction for a burst effect
        this.velX = this.digDirection.x * this.speed * 1.5; // Increased for better momentum
        this.velY = this.digDirection.y * Math.max(3, this.speed * 0.8); // Increased for better vertical momentum
        
        // Flag that digging was successful
        this.diggedThroughWall = true;
        
        // Show success message
        gameCore.gameState.message = "Doorheen gegraven!";
        setTimeout(() => {
            if (gameCore.gameState.message === "Doorheen gegraven!") {
                gameCore.gameState.message = "";
            }
        }, 1000);
        
        // Reset digging state
        this.isDigging = false;
        this.diggingTarget = null;
        this.showDigParticles = false;
        
        // Apply cooldown
        this.canDig = false;
        setTimeout(() => {
            this.canDig = true;
            if (gameCore.gameState.debugLevel >= 1) {
                console.log("Digging cooldown complete - can dig again");
            }
        }, 1000); // Reduced cooldown to 1 second for better gameplay
    }
    
    /**
     * Cancel digging if interrupted or failed
     */
    cancelDigging() {
        // Return to original position
        this.x = this.originalPosition.x;
        this.y = this.originalPosition.y;
        
        // Reset digging state
        this.isDigging = false;
        this.diggingProgress = 0;
        this.diggingTarget = null;
        this.showDigParticles = false;
        
        // No cooldown for cancelled digs so player can try again immediately
        if (gameCore.gameState.debugLevel >= 1) {
            console.log("Digging cancelled");
        }
    }
    
    /**
     * Finds a suitable target for the mole to dig through
     * Sets diggingTarget, targetPosition and digDirection properties
     */
    findDiggingTarget() {
        if (gameCore.gameState.debugLevel >= 1) {
            console.log("Finding digging target for", this.name);
        }
        
        if (this.animalType !== "MOLE") {
            return null;
        }
        
        // Get all platforms in the level
        const currentLevelData = window.levels[gameCore.currentLevel];
        const platforms = currentLevelData.platforms || [];
        
        if (gameCore.gameState.debugLevel >= 1) {
            console.log("Checking", platforms.length, "platforms for digging");
        }
        
        // First check for walls to dig through horizontally
        for (const platform of platforms) {
            // Only dig through vertical walls and normal platforms
            if (platform.type === "VERTICAL" || platform.type === "NORMAL") {
                const facingLeft = !this.facingRight;
                const moleRight = this.x + this.width;
                const moleLeft = this.x;
                
                // Debug log platform check
                if (gameCore.gameState.debugLevel >= 1) {
                    console.log("Checking", platform.type, "wall at (", platform.x, ",", platform.y, ") - Mole at (", this.x, ",", this.y, ")");
                }
                
                // Check if wall is directly in front of the mole
                if ((facingLeft && moleLeft > platform.x && moleLeft < platform.x + platform.width + 5) ||
                    (!facingLeft && moleRight < platform.x + platform.width && moleRight > platform.x - 5)) {
                    
                    // Check if mole is vertically aligned with the wall 
                    if (this.y + this.height > platform.y && this.y < platform.y + platform.height) {
                        console.log("FOUND WALL TO DIG THROUGH! 🦔💪🧱");
                        
                        // Set the target platform
                        this.diggingTarget = platform;
                        
                        // Calculate target position after digging through
                        if (facingLeft) {
                            // Digging left
                            this.targetPosition = {
                                x: platform.x - this.width - 25, // Further increased distance to prevent getting stuck
                                y: this.y
                            };
                            this.digDirection = { x: -1, y: 0 };
                        } else {
                            // Digging right
                            this.targetPosition = {
                                x: platform.x + platform.width + 25, // Further increased distance to prevent getting stuck
                                y: this.y
                            };
                            this.digDirection = { x: 1, y: 0 };
                        }
                        
                        return this.diggingTarget;
                    }
                }
            }
        }
        
        // If no wall found, check if we can dig through the ground
        if (this.onGround) {
            if (gameCore.gameState.debugLevel >= 1) {
                console.log("No wall found, checking if can dig down through ground");
            }
            
            // Check if the down key is pressed while on ground
            if (gameControls.keys[this.controls.down] || gameControls.keys[this.controls.down.toLowerCase()]) {
                console.log("DIGGING DOWN THROUGH GROUND! 🦔⬇️");
                
                // Create a virtual target for the ground
                this.diggingTarget = {
                    type: "GROUND",
                    x: this.x - this.width/2,
                    y: this.y + this.height,
                    width: this.width * 2,
                    height: 20
                };
                
                // Set target position below the ground
                this.targetPosition = {
                    x: this.x,
                    y: this.y + this.height + 25 // Increased depth to prevent getting stuck
                };
                this.digDirection = { x: 0, y: 1 };
                
                return this.diggingTarget;
            } else if (gameCore.gameState.debugLevel >= 1) {
                console.log("Down key not pressed - can't dig down");
            }
        }
        
        // No suitable target found
        if (gameCore.gameState.debugLevel >= 1) {
            console.log("No suitable digging targets found");
        }
        return null;
    }
    
    /**
     * Draws the digging energy meter when mole is active
     */
    drawDiggingEnergyMeter() {
        if (this.animalType !== "MOLE") return;
        
        // Draw energy meter above the mole, but only if it's not 100%
        if (this.diggingEnergy < this.maxDiggingEnergy) {
            const meterWidth = this.width * 1.2;
            const meterHeight = 4;
            const meterX = this.x - (meterWidth - this.width) / 2;
            const meterY = this.y - 8;
            
            // Background of the meter
            gameCore.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            gameCore.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
            
            // Energy level
            const fillWidth = (this.diggingEnergy / this.maxDiggingEnergy) * meterWidth;
            
            // Color based on energy level
            let meterColor;
            if (this.diggingEnergy > 70) {
                meterColor = 'rgb(139, 69, 19)'; // Brown for high energy
            } else if (this.diggingEnergy > 30) {
                meterColor = 'rgb(205, 133, 63)'; // Lighter brown for medium energy
            } else {
                meterColor = 'rgb(210, 180, 140)'; // Very light brown for low energy
            }
            
            gameCore.ctx.fillStyle = meterColor;
            gameCore.ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
        }
        
        // If currently digging, show progress meter
        if (this.isDigging && this.diggingTarget) {
            const meterWidth = this.width * 1.2;
            const meterHeight = 4;
            const meterX = this.x - (meterWidth - this.width) / 2;
            const meterY = this.y - 12;
            
            // Background of the meter
            gameCore.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            gameCore.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
            
            // Progress level
            const fillWidth = (this.diggingProgress / 100) * meterWidth;
            
            // Color for digging progress
            gameCore.ctx.fillStyle = 'rgb(218, 165, 32)'; // Golden color for digging progress
            gameCore.ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
        }
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
    
    /**
     * Updates the respawn timer when a player has lost all lives
     * Shows a countdown above the player's position
     */
    updateRespawnTimer() {
        if (!this.isRespawning) return;
        
        // Verminder de timer met één frame
        this.respawnTimerFrames--;
        
        // Update de secondenteller (alleen als een hele seconde is verstreken)
        if (this.respawnTimerFrames % 60 === 0) {
            this.respawnTimer = Math.floor(this.respawnTimerFrames / 60);
        }
        
        // Als de timer afgelopen is, reset de respawn status
        if (this.respawnTimerFrames <= 0) {
            this.isRespawning = false;
            this.isInvulnerable = true;
            this.invulnerableTimer = 120; // 2 seconden onkwetsbaar na respawn
            
            // Fix voor schildpad: reset onderwater status
            if (this.animalType === "TURTLE") {
                this.isUnderwater = false;
                this.oxygenLevel = this.maxOxygenLevel; // Reset zuurstofniveau
                
                // Stop onderwater geluid als dat nog speelt
                if (typeof gameAudio !== 'undefined') {
                    if (typeof gameAudio.stopLoopingSound === 'function') {
                        gameAudio.stopLoopingSound('underwater');
                    } else if (typeof gameAudio.stopUnderwaterSound === 'function') {
                        gameAudio.stopUnderwaterSound();
                    }
                }
            }
            
            // Toon bericht dat de speler weer terug is
            gameCore.gameState.message = `${this.name} is terug in het spel!`;
            
            // Wis het bericht na 2 seconden
            setTimeout(() => {
                if (gameCore.gameState.message === `${this.name} is terug in het spel!`) {
                    gameCore.gameState.message = "";
                }
            }, 2000);
        }
    }
    
    /**
     * Draws respawn countdown above player when respawning
     * Should be called from the render function
     */
    drawRespawnCountdown() {
        if (!this.isRespawning) return;
        
        // Teken de resterende seconden boven de speler
        gameCore.ctx.font = "bold 20px Arial";
        gameCore.ctx.fillStyle = "red";
        gameCore.ctx.textAlign = "center";
        gameCore.ctx.fillText(`${this.respawnTimer}`, this.x + this.width/2, this.y - 10);
        gameCore.ctx.textAlign = "left"; // Reset text alignment
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
            
            // Voeg 1000 punten toe voor het redden van de puppy
            gameCore.gameState.score += 1000;
            updateScoreDisplay();
            
            // Speel powerup geluid bij redden van puppy
            if (typeof gameAudio !== 'undefined' && typeof gameAudio.playSound === 'function') {
                gameAudio.playSound('collectPuppy', 0.9);
            }
            
            // Toon puntenpopup
            if (typeof gameRendering !== 'undefined' && typeof gameRendering.showPointsEarned === 'function') {
                gameRendering.showPointsEarned(puppy.x + puppy.width/2, puppy.y, 1000);
            }
            
            gameCore.gameState.message = "Je hebt de puppy gered! +1000 punten! Verzamel nu de ster!";
            
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
        
        // Skip alle bewegingslogica voor dode piranha's
        // Dode piranha's bewegen niet, ze vallen alleen door zwaartekracht
        if (enemy.isDead) {
            // Alleen toepassen van zwaartekracht
            enemy.velY += gameCore.GRAVITY;
            
            // Limiet aan vallende snelheid
            if (enemy.velY > gameCore.MAX_FALL_SPEED) {
                enemy.velY = gameCore.MAX_FALL_SPEED;
            }
            
            // Alleen verticale beweging (vallen)
            enemy.y += enemy.velY;
            
            // Controleer grondcollisie
            if (enemy.y + enemy.height >= gameCore.GROUND_LEVEL) {
                enemy.y = gameCore.GROUND_LEVEL - enemy.height;
                enemy.velY = 0;
                enemy.onGround = true;
            }
            
            // Skip alle andere bewegingslogica
            return;
        }
        
        // Initialize fire breathing for dragons
        if (enemy.type === "DRAGON" && enemy.fireBreathingTimer === undefined) {
            enemy.fireBreathingTimer = 0;
            enemy.fireBreathing = false;
            enemy.fireBreathCooldown = 0;
            enemy.fireBreathingIntensity = 0; // Track fire intensity (0-100)
            enemy.fireBreathingBuildUp = false; // Track if fire is building up
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
                // Controleer of de speler boven de vijand staat
                const playerIsAbove = nearestPlayer.y < enemy.y - enemy.height/2;
                const playerIsClose = Math.abs(enemy.x - nearestPlayer.x) < enemy.width;
                
                // Als de speler boven de vijand staat en dichtbij genoeg is, blijf stilstaan of maak rustige bewegingen
                if (playerIsAbove && playerIsClose) {
                    // De vijand blijft rustig en verandert niet continu van richting
                    // Maak af en toe een kleine beweging om het natuurlijker te laten lijken
                    if (!enemy.waitTimer || enemy.waitTimer <= 0) {
                        // Kies een willekeurige richting en wachttijd wanneer de timer afloopt
                        enemy.direction = Math.random() > 0.5 ? 1 : -1;
                        enemy.waitTimer = 60 + Math.random() * 60; // Wacht tussen 1-2 seconden
                        enemy.isWaiting = true;
                    } else {
                        // Verminder de timer
                        enemy.waitTimer--;
                        
                        // Beweeg langzaam in de geselecteerde richting
                        if (enemy.isWaiting) {
                            moveX = enemy.speed * 0.3 * enemy.direction;
                        }
                    }
                } else {
                    // Reset de wachttimer als de speler niet boven de vijand staat
                    enemy.isWaiting = false;
                    enemy.waitTimer = 0;
                    
                    // Normaal gedrag: ga richting de speler
                    if (enemy.x < nearestPlayer.x) {
                        enemy.direction = 1; // Naar rechts (richting speler)
                    } else {
                        enemy.direction = -1; // Naar links (richting speler)
                    }
                    
                    // Bereken beweging (nog niet toepassen)
                    moveX = enemy.speed * enemy.direction;
                }
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
                        // Start the build-up phase
                        enemy.fireBreathingBuildUp = true;
                        
                        // Configure the duration of fire breathing + build-up
                        enemy.fireBreathingTimer = 120; // Approximately 2 seconds total (60 frames build-up + 60 frames active fire)
                        
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
                        // Start the build-up phase
                        enemy.fireBreathingBuildUp = true;
                        
                        // Configure the duration of fire breathing + build-up
                        enemy.fireBreathingTimer = 120; // Approximately 2 seconds total (60 frames build-up + 60 frames active fire)
                        
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
                    
                    // Build-up phase - first half of the timer
                    if (enemy.fireBreathingBuildUp) {
                        // Calculate intensity based on how far into build-up we are
                        const buildUpPhase = 60; // 60 frames (1 second) of build-up
                        if (enemy.fireBreathingTimer > 60) {
                            // Still in build-up phase
                            const progress = (120 - enemy.fireBreathingTimer) / buildUpPhase;
                            enemy.fireBreathingIntensity = 100 * progress; // Gradually increase from 0 to 100
                        } else {
                            // Transition to active fire
                            enemy.fireBreathingBuildUp = false;
                            enemy.fireBreathing = true;
                            enemy.fireBreathingIntensity = 100; // Full intensity
                        }
                    }
                    
                    // When time's up, reset everything
                    if (enemy.fireBreathingTimer <= 0) {
                        enemy.fireBreathing = false;
                        enemy.fireBreathingBuildUp = false;
                        enemy.fireBreathingIntensity = 0;
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
                // Speciale behandeling voor piranha's: ze kunnen in water bewegen
                if (enemy.type === "PIRANHA") {
                    if (platform.type === "WATER") {
                        // Controleer of de piranha in het water is
                        if (enemy.x + enemy.width > platform.x && 
                            enemy.x < platform.x + platform.width &&
                            enemy.y + enemy.height > platform.y && 
                            enemy.y < platform.y + platform.height) {
                            
                            // Piranha is in water, markeer als "zwemmend"
                            enemy.isSwimming = true;
                            
                            // Check of er spelers in het water zijn (op dezelfde platform)
                            let targetPlayer = null;
                            for (let player of players) {
                                if (player.collidesWithPlatform && player.collidesWithPlatform(platform) && 
                                    ((player.animalType === "TURTLE" && player.isUnderwater) || 
                                     platform.type === "WATER")) {
                                    // Speler is in water - jacht op deze speler
                                    targetPlayer = player;
                                    break;
                                }
                            }
                            
                            // Als er een speler in het water is, jaag erop
                            if (targetPlayer) {
                                // Horizontale beweging - richting speler (langzamer)
                                if (enemy.x < targetPlayer.x) {
                                    enemy.direction = 1; // Naar rechts (richting speler)
                                    enemy.x += enemy.speed * 0.4; // Langzamer bewegen
                                } else {
                                    enemy.direction = -1; // Naar links (richting speler)
                                    enemy.x -= enemy.speed * 0.4; // Langzamer bewegen
                                }
                                
                                // Verticale beweging - richting speler (langzamer)
                                // Vergelijk het middelpunt van de piranha met het middelpunt van de speler
                                const piranhaCenter = enemy.y + enemy.height/2;
                                const playerCenter = targetPlayer.y + targetPlayer.height/2;
                                
                                if (piranhaCenter < playerCenter) {
                                    // Naar beneden zwemmen (richting speler)
                                    enemy.y += enemy.speed * 0.8; // Veel sneller verticaal bewegen
                                } else {
                                    // Naar boven zwemmen (richting speler)
                                    enemy.y -= enemy.speed * 0.8; // Veel sneller verticaal bewegen
                                }
                                
                                // Maak dubbel zo veel bubbels als normaal tijdens het jagen
                                enemy.huntingPlayer = true;
                            } else {
                                // Normaal patroon gedrag wanneer er geen speler in water is
                                enemy.huntingPlayer = false;
                                
                                // In water kan de piranha ook verticaal bewegen (langzaam)
                                // Voeg vertical patrouille toe als die er nog niet is
                                if (enemy.verticalDirection === undefined) {
                                    // Willekeurige start richting (50% kans op omhoog beginnen)
                                    enemy.verticalDirection = Math.random() > 0.5 ? -1 : 1;
                                    enemy.verticalMovement = 0;
                                    enemy.maxVerticalMovement = 25 + Math.random() * 15; // Smaller bewegingsbereik
                                    enemy.directionChangeTimer = 0;
                                    enemy.randomDirectionChange = 40 + Math.floor(Math.random() * 30); // 40-70 frames
                                }
                                
                                // Update verticale beweging teller
                                enemy.verticalMovement += Math.abs(enemy.verticalDirection);
                                enemy.directionChangeTimer++;
                                
                                // Verander regelmatig van richting (om de 40-70 frames OF bij bereiken max hoogte)
                                // Dit zorgt ervoor dat de piranha zowel omhoog als omlaag zwemt
                                if (enemy.verticalMovement >= enemy.maxVerticalMovement || 
                                    enemy.directionChangeTimer >= enemy.randomDirectionChange) {
                                    // Verander richting
                                    enemy.verticalDirection *= -1;
                                    console.log("Piranha verandert richting naar: " + 
                                               (enemy.verticalDirection === 1 ? "omlaag" : "omhoog"));
                                    
                                    // Reset timers
                                    enemy.directionChangeTimer = 0;
                                    enemy.verticalMovement = 0;
                                    enemy.randomDirectionChange = 40 + Math.floor(Math.random() * 30);
                                }
                                
                                // Pas verticale beweging toe met voldoende snelheid om beweging te zien
                                enemy.y += enemy.verticalDirection * (enemy.speed * 0.4);
                            }
                            
                            // Zorg dat de piranha binnen het water blijft
                            // Controleer bovenkant water
                            if (enemy.y < platform.y) {
                                // Zet de piranha terug op de platformgrens
                                enemy.y = platform.y;
                                
                                // Forceer de richting naar beneden, ongeacht of we een speler achtervolgen
                                // Dit lost het probleem op dat de piranha niet omhoog lijkt te zwemmen
                                if (enemy.huntingPlayer) {
                                    // alleen richting forceren als de piranha probeert te jagen
                                    console.log("Piranha zit aan bovenkant water - kan niet verder omhoog");
                                } else {
                                    enemy.verticalDirection = 1; // Naar beneden
                                }
                            } 
                            // Controleer onderkant water
                            else if (enemy.y + enemy.height > platform.y + platform.height) {
                                // Zet de piranha terug op de platformgrens
                                enemy.y = platform.y + platform.height - enemy.height;
                                
                                // Forceer de richting naar boven, ongeacht of we een speler achtervolgen
                                if (enemy.huntingPlayer) {
                                    console.log("Piranha zit aan onderkant water - kan niet verder omlaag");
                                } else {
                                    enemy.verticalDirection = -1; // Naar boven
                                }
                            }
                            
                            // Reset zwaartekracht voor piranha's in water
                            enemy.velY = 0;
                            
                            return; // Skip andere platform checks voor piranha's in water
                        } else {
                            // Piranha is buiten water, markeer als dood
                            enemy.isSwimming = false;
                            enemy.huntingPlayer = false;
                            enemy.isDead = true;  // Markeer de piranha als dood
                            
                            // Niet meer laten bewegen, alleen laten vallen door zwaartekracht
                            enemy.velX = 0;       // Stop horizontale beweging
                            enemy.direction = enemy.direction || 1; // Behoud richting voor tekening
                            
                            // Vertraag licht vallende piranha (lijkt meer op een dood visje)
                            enemy.velY = Math.min(enemy.velY, 2);
                            
                            // Verhinderen dat de piranha spelers kan beschadigen
                            enemy.canHurtPlayer = false;
                            
                            console.log("Piranha gestorven - buiten water");
                        }
                    }
                } 
                
                // Sla water en wolkenplatforms over voor andere vijanden (niet voor piranha's)
                if ((enemy.type !== "PIRANHA" && platform.type === "WATER") || platform.type === "CLOUD") return;
                
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
                
                // Voeg collisiedetectie toe voor VERTICAL platforms voor vijanden
                if (platform.type === "VERTICAL") {
                    // Bereken collision box
                    const enemyBottom = enemy.y + enemy.height;
                    const enemyTop = enemy.y;
                    const enemyLeft = enemy.x;
                    const enemyRight = enemy.x + enemy.width;
                    
                    const platformTop = platform.y;
                    const platformBottom = platform.y + platform.height;
                    const platformLeft = platform.x;
                    const platformRight = platform.x + platform.width;
                    
                    // Check of vijand tegen de zijkant van de muur botst
                    if (enemyBottom > platformTop + 5 && enemyTop < platformBottom - 5) {
                        if (enemy.direction > 0 && enemyRight > platformLeft && enemyLeft < platformLeft) {
                            // Botst tegen de linkerkant van de muur
                            enemy.x = platformLeft - enemy.width;
                            enemy.direction *= -1; // Verander richting
                        } else if (enemy.direction < 0 && enemyLeft < platformRight && enemyRight > platformRight) {
                            // Botst tegen de rechterkant van de muur
                            enemy.x = platformRight;
                            enemy.direction *= -1; // Verander richting
                        }
                    }
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