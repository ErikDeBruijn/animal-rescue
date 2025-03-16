// Dieren Redders - Een samenwerkingsspel met dieren
// Gemaakt voor een ouder en kind om samen te spelen

// Canvas en context opzetten
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Spelconstanten
const GRAVITY = 0.5;
const JUMP_POWER = -12;
const GROUND_LEVEL = canvas.height - 50;
const BLOCK_SIZE = 40;
const MAX_FALL_SPEED = 10; // Maximale valsnelheid om door platforms vallen te voorkomen

// Level variabelen
let currentLevel = 0;
let levelCompleted = false;

// Controleer of er een level is gespecificeerd in de URL
function getStartLevel() {
    // Controleer eerst de fragment identifier (#level=X)
    const hash = window.location.hash;
    if (hash && hash.startsWith('#level=')) {
        const levelParam = hash.substring(7); // Extraheer het getal na #level=
        const levelIndex = parseInt(levelParam);
        // Controleer of het een geldige level index is
        if (!isNaN(levelIndex) && levelIndex >= 0) {
            return levelIndex;
        }
    }

    // Als fallback, controleer ook de oude querystring methode (?level=X)
    const urlParams = new URLSearchParams(window.location.search);
    const queryLevelParam = urlParams.get('level');
    
    if (queryLevelParam !== null) {
        const levelIndex = parseInt(queryLevelParam);
        // Controleer of het een geldige level index is
        if (!isNaN(levelIndex) && levelIndex >= 0) {
            return levelIndex;
        }
    }
    
    return 0; // Standaard naar het eerste level
}

// Spel state
let gameState = {
    running: true,
    message: "",
    puppySaved: false, // Om bij te houden of de puppy gered is
    gameOver: false    // Game over als de puppy wordt gevangen door een vijand
};

// Dieren definities met speciale krachten
const animalTypes = {
    SQUIRREL: {
        name: "Eekhoorn",
        color: "#B36B00",
        width: 30,
        height: 30,
        jumpPower: -8,  // Verlaagd van -15 naar -8
        speed: 5,
        ability: "Hoog springen en klimmen"
    },
    TURTLE: {
        name: "Schildpad",
        color: "#00804A",
        width: 40,
        height: 25,
        jumpPower: -6,  // Verlaagd van -8 naar -6
        speed: 3,
        ability: "Zwemmen en door smalle ruimtes gaan"
    },
    UNICORN: {
        name: "Eenhoorn",
        color: "#E56BF7", // Lichtpaars/roze
        width: 40,
        height: 30,
        jumpPower: -7,
        speed: 6, // Snelste dier
        ability: "Vliegen en over grote afstanden zweven",
        canFly: true // Speciale eigenschap voor vliegen
    }
};

// Spelers
class Player {
    constructor(x, y, controls, name, defaultAnimal) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.onGround = false;
        this.controls = controls;
        this.name = name;
        this.animalType = defaultAnimal;
        this.canSwitch = true;
        
        // Properties die afhankelijk zijn van diersoort
        this.updateAnimalProperties();
    }
    
    updateAnimalProperties() {
        const animal = animalTypes[this.animalType];
        this.width = animal.width;
        this.height = animal.height;
        this.jumpPower = animal.jumpPower;
        this.speed = animal.speed;
        this.color = animal.color;
        
        // Update de UI met het huidige dier
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
        }
        
        const animalName = animalTypes[this.animalType].name;
        const playerElement = document.getElementById(this.name === "Speler 1" ? "player1-animal" : "player2-animal");
        
        if (playerElement) {
            playerElement.textContent = `${animalName} ${animalEmoji}`;
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
    
    // Verbeterde detectie voor wissel-toetsen
    isSwitchKeyPressed() {
        // Voor speler 2, check alle shift-toetsen (links en rechts)
        if (this.name === "Speler 2") {
            return keys['Shift'] || keys['ShiftLeft'] || keys['ShiftRight'];
        }
        // Voor speler 1, check F-toets
        else {
            return keys['f'] || keys['F'];
        }
    }
    
    switchAnimal(otherPlayer) {
        // Bepaal volgende diersoort in de cyclus: SQUIRREL -> TURTLE -> UNICORN -> SQUIRREL
        let newAnimalType;
        switch(this.animalType) {
            case "SQUIRREL":
                newAnimalType = "TURTLE";
                break;
            case "TURTLE":
                newAnimalType = "UNICORN";
                break;
            case "UNICORN":
                newAnimalType = "SQUIRREL";
                break;
        }
        
        // Als de andere speler al het gewenste dier is, sla het over en ga naar het volgende dier
        if (otherPlayer.animalType === newAnimalType) {
            // Ga naar het volgende dier in de cyclus
            switch(newAnimalType) {
                case "SQUIRREL":
                    newAnimalType = "TURTLE";
                    break;
                case "TURTLE":
                    newAnimalType = "UNICORN";
                    break;
                case "UNICORN":
                    newAnimalType = "SQUIRREL";
                    break;
            }
            
            // Als we nu weer bij het originele dier zijn, neem dan het derde dier
            if (newAnimalType === this.animalType) {
                // Dit zou niet moeten gebeuren met drie dieren, maar voor de zekerheid
                switch(newAnimalType) {
                    case "SQUIRREL":
                        newAnimalType = "UNICORN";
                        break;
                    case "TURTLE":
                        newAnimalType = "SQUIRREL";
                        break;
                    case "UNICORN":
                        newAnimalType = "TURTLE";
                        break;
                }
            }
        }
        
        // Wissel naar nieuw dier
        console.log(`${this.name} wisselt van ${this.animalType} naar ${newAnimalType}`);
        this.animalType = newAnimalType;
        this.updateAnimalProperties();
    }
    
    update(otherPlayer, platforms, traps, collectibles) {
        // Beweging horizontaal
        if (keys[this.controls.left] || keys[this.controls.left.toLowerCase()]) {
            this.velX = -this.speed;
        } else if (keys[this.controls.right] || keys[this.controls.right.toLowerCase()]) {
            this.velX = this.speed;
        } else {
            this.velX = 0;
        }
        
        // Springen als op de grond
        if ((keys[this.controls.up] || keys[this.controls.up.toLowerCase()]) && this.onGround) {
            this.velY = this.jumpPower;
            this.onGround = false;
        }
        
        // Snel naar beneden gaan met pijl-omlaag (handig om in water te komen)
        if (keys[this.controls.down] || keys[this.controls.down.toLowerCase()]) {
            if (!this.onGround) {
                this.velY += 0.8; // Sneller vallen
            } else if (this.checkIfWaterBelow(platforms)) {
                // Spring bewust in water onder de speler
                this.velY = 5;
                this.onGround = false;
            }
        }
        
        // Wisselen van dier - verbeterde detectie voor alle shift-toetsen en F-toets
        let switchKeyPressed = this.isSwitchKeyPressed();
        
        if (switchKeyPressed && this.canSwitch) {
            this.switchAnimal(otherPlayer);
            this.canSwitch = false; // Voorkom snel wisselen
        } else if (!switchKeyPressed) {
            this.canSwitch = true; // Reset wanneer knop losgelaten
        }
        
        // Zwaartekracht toepassen (minder voor vliegende eenhoorn)
        if (this.animalType === "UNICORN" && 
            (keys[this.controls.up] || keys[this.controls.up.toLowerCase()]) &&
            !this.flyingExhausted && this.flyingPower > 0) {
            
            // Eenhoorn kan vliegen (omhoog bewegen) wanneer de omhoog-toets wordt ingedrukt
            // en er voldoende vliegkracht is
            this.velY = -3;
            // Glitter-effect voor vliegen (wordt getekend in draw)
            this.flying = true;
        } else {
            // Normale zwaartekracht, maar minder sterk voor eenhoorn (langzamer vallen)
            const gravityFactor = this.animalType === "UNICORN" ? 0.3 : 1.0;
            this.velY += GRAVITY * gravityFactor;
            this.flying = false;
        }
        
        // Beperk de maximale valsnelheid om te voorkomen dat spelers door platforms vallen
        // Eenhoorn heeft lagere maximale valsnelheid (zweeft meer)
        const maxFall = this.animalType === "UNICORN" ? MAX_FALL_SPEED * 0.6 : MAX_FALL_SPEED;
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
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        
        // Grond checken
        this.onGround = false;
        if (this.y + this.height >= GROUND_LEVEL) {
            this.y = GROUND_LEVEL - this.height;
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
                        
                        // Schildpad kan in water omhoog zwemmen
                        if (keys[this.controls.up] || keys[this.controls.up.toLowerCase()]) {
                            this.velY = -2; // Omhoog zwemmen
                        }
                        
                        // Betere horizontale beweging in water
                        if (keys[this.controls.left] || keys[this.controls.left.toLowerCase()]) {
                            this.velX = -this.speed * 0.8; // Iets langzamer in water
                        } else if (keys[this.controls.right] || keys[this.controls.right.toLowerCase()]) {
                            this.velX = this.speed * 0.8; // Iets langzamer in water
                        }
                        
                        // Laat schildpad drijven (niet zinken) in water
                        if (Math.abs(this.velY) < 0.5 && !keys[this.controls.up]) {
                            this.velY = -0.2; // Langzaam drijven
                        }
                    } else {
                        // Andere dieren kunnen niet zwemmen
                        this.resetToStart();
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
                    if (keys[this.controls.up] || keys[this.controls.up.toLowerCase()]) {
                        this.velY = -3; // Langzaam omhoog klimmen
                        this.onGround = true; // Kan nog steeds springen
                    }
                    
                    // Horizontale collisie met de boom
                    if (this.x + this.width > platform.x && 
                        this.x < platform.x + platform.width) {
                        // Blijf plakken aan de boom bij klimmen
                        if (keys[this.controls.left] || keys[this.controls.left.toLowerCase()] || 
                            keys[this.controls.right] || keys[this.controls.right.toLowerCase()]) {
                            // Zorg voor langzamere val langs de boom
                            if (this.velY > 2) {
                                this.velY = 2;
                            }
                        }
                    }
                }
            }
        });
        
        // Collectibles verzamelen
        collectibles.forEach((collectible, index) => {
            if (this.collidesWithObject(collectible)) {
                // Alleen verzamelen als de puppy is gered in het level
                const currentLevelData = levels[currentLevel];
                if (!currentLevelData.puppy || currentLevelData.puppy.saved || gameState.puppySaved) {
                    collectibles.splice(index, 1);
                    // Controleer of alle collectibles verzameld zijn
                    if (collectibles.length === 0) {
                        levelCompleted = true;
                        gameState.message = "Level voltooid! Druk op Spatie voor het volgende level";
                    }
                } else {
                    // Toon bericht dat puppy eerst gered moet worden
                    gameState.message = "Red eerst de puppy!";
                    // Voeg een vertraging toe om het bericht te tonen
                    setTimeout(() => {
                        gameState.message = "";
                    }, 2000);
                }
            }
        });
        
        // Valstrikken controleren
        traps.forEach(trap => {
            if (this.collidesWithObject(trap)) {
                this.resetToStart();
            }
        });
        
        // Vijanden controleren
        const currentLevelData = levels[currentLevel];
        const enemies = currentLevelData.enemies || [];
        enemies.forEach(enemy => {
            if (this.collidesWithObject(enemy)) {
                // Bij aanraking met een vijand, terug naar start
                this.resetToStart();
            }
        });
    }
    
    collidesWithPlatform(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }
    
    collidesWithObject(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    resetToStart() {
        const startPos = levels[currentLevel].startPositions[this.name === "Speler 1" ? 0 : 1];
        this.x = startPos.x;
        this.y = startPos.y;
        this.velX = 0;
        this.velY = 0;
    }
    
    draw() {
        if (this.animalType === "SQUIRREL") {
            this.drawSquirrel();
        } else if (this.animalType === "TURTLE") {
            this.drawTurtle();
        } else if (this.animalType === "UNICORN") {
            this.drawUnicorn();
        }
    }
    
    drawSquirrel() {
        // Bepaal richting op basis van beweging
        const facingLeft = this.velX < 0;
        
        // Lichaam
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Ogen (positie afhankelijk van richting)
        ctx.fillStyle = "white";
        if (facingLeft) {
            // Ogen links
            ctx.fillRect(this.x + this.width * 0.15, this.y + this.height * 0.2, this.width * 0.15, this.height * 0.15);
        } else {
            // Ogen rechts (standaard)
            ctx.fillRect(this.x + this.width * 0.7, this.y + this.height * 0.2, this.width * 0.15, this.height * 0.15);
        }
        
        // Staart (positie afhankelijk van richting)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        if (facingLeft) {
            // Staart rechts
            ctx.moveTo(this.x + this.width, this.y + this.height * 0.3);
            ctx.quadraticCurveTo(
                this.x + this.width + this.width * 0.5, this.y + this.height * 0.2, 
                this.x + this.width + this.width * 0.3, this.y + this.height * 0.5
            );
            ctx.quadraticCurveTo(
                this.x + this.width + this.width * 0.2, this.y + this.height * 0.8, 
                this.x + this.width, this.y + this.height * 0.7
            );
        } else {
            // Staart links (standaard)
            ctx.moveTo(this.x, this.y + this.height * 0.3);
            ctx.quadraticCurveTo(
                this.x - this.width * 0.5, this.y + this.height * 0.2, 
                this.x - this.width * 0.3, this.y + this.height * 0.5
            );
            ctx.quadraticCurveTo(
                this.x - this.width * 0.2, this.y + this.height * 0.8, 
                this.x, this.y + this.height * 0.7
            );
        }
        
        ctx.fill();
    }
    
    drawTurtle() {
        // Bepaal richting op basis van beweging
        const facingLeft = this.velX < 0;
        
        // Schild
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2, 
            this.y + this.height/2, 
            this.width/2, 
            this.height/2, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Schild patroon
        ctx.fillStyle = "#006400";
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2, 
            this.y + this.height/2, 
            this.width/3, 
            this.height/3, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Hoofd (positie afhankelijk van richting)
        ctx.fillStyle = "#00804A";
        ctx.beginPath();
        
        if (facingLeft) {
            // Hoofd links
            ctx.ellipse(
                this.x + this.width * 0.2, 
                this.y + this.height * 0.3, 
                this.width * 0.25, 
                this.height * 0.25, 
                0, 0, Math.PI * 2
            );
        } else {
            // Hoofd rechts (standaard)
            ctx.ellipse(
                this.x + this.width * 0.8, 
                this.y + this.height * 0.3, 
                this.width * 0.25, 
                this.height * 0.25, 
                0, 0, Math.PI * 2
            );
        }
        
        ctx.fill();
        
        // Pootjes (slechts zichtbaar als de schildpad beweegt)
        if (this.velX !== 0 || this.velY !== 0) {
            ctx.fillStyle = "#00804A";
            
            if (facingLeft) {
                // Voorste poot links
                ctx.fillRect(
                    this.x + this.width * 0.2, 
                    this.y + this.height * 0.6, 
                    this.width * 0.15, 
                    this.height * 0.3
                );
                
                // Achterste poot rechts
                ctx.fillRect(
                    this.x + this.width * 0.7, 
                    this.y + this.height * 0.6, 
                    this.width * 0.15, 
                    this.height * 0.3
                );
            } else {
                // Voorste poot rechts (standaard)
                ctx.fillRect(
                    this.x + this.width * 0.8, 
                    this.y + this.height * 0.6, 
                    this.width * 0.15, 
                    this.height * 0.3
                );
                
                // Achterste poot links (standaard)
                ctx.fillRect(
                    this.x + this.width * 0.2, 
                    this.y + this.height * 0.6, 
                    this.width * 0.15, 
                    this.height * 0.3
                );
            }
        }
    }
    
    drawUnicorn() {
        // Bepaal richting op basis van beweging
        const facingLeft = this.velX < 0;
        
        // Teken vliegmeter boven de eenhoorn
        if (this.flyingPower !== undefined) {
            const meterWidth = this.width * 1.2;
            const meterHeight = 5;
            const meterX = this.x - (meterWidth - this.width) / 2;
            const meterY = this.y - 15;
            
            // Achtergrond van de meter
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
            
            // Actuele vliegkracht
            const fillWidth = (this.flyingPower / this.flyingPowerMax) * meterWidth;
            
            // Kleur op basis van vliegkracht-niveau
            let meterColor;
            if (this.flyingPower > 70) {
                meterColor = 'rgb(0, 255, 0)'; // Groen
            } else if (this.flyingPower > 30) {
                meterColor = 'rgb(255, 255, 0)'; // Geel
            } else {
                meterColor = 'rgb(255, 0, 0)'; // Rood
            }
            
            ctx.fillStyle = meterColor;
            ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
        }
        
        // Basis-lichaam (ovaal)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width/2, 
            this.y + this.height/2, 
            this.width/2, 
            this.height/2, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Manen (regenboogkleuren) - positie afhankelijk van richting
        const maneColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
        
        if (facingLeft) {
            // Manen aan de rechterkant
            for (let i = 0; i < 7; i++) {
                ctx.fillStyle = maneColors[i];
                ctx.beginPath();
                ctx.ellipse(
                    this.x + this.width * 0.7 + i * 2, 
                    this.y + this.height * 0.3,
                    7 - i, 
                    15 - i, 
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            }
        } else {
            // Manen aan de linkerkant (standaard)
            for (let i = 0; i < 7; i++) {
                ctx.fillStyle = maneColors[i];
                ctx.beginPath();
                ctx.ellipse(
                    this.x + this.width * 0.3 - i * 2, 
                    this.y + this.height * 0.3,
                    7 - i, 
                    15 - i, 
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // Hoorn (gouden kleur) - positie afhankelijk van richting
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        
        if (facingLeft) {
            // Hoorn links
            ctx.moveTo(this.x + this.width * 0.3, this.y + this.height * 0.1);
            ctx.lineTo(this.x + this.width * 0.1, this.y - this.height * 0.2);
            ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.1);
        } else {
            // Hoorn rechts (standaard)
            ctx.moveTo(this.x + this.width * 0.7, this.y + this.height * 0.1);
            ctx.lineTo(this.x + this.width * 0.9, this.y - this.height * 0.2);
            ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.1);
        }
        
        ctx.fill();
        
        // Pootjes - positie afhankelijk van richting
        ctx.fillStyle = "#E56BF7";
        
        if (facingLeft) {
            // Pootjes gespiegeld
            // Voorpoot links
            ctx.fillRect(
                this.x + this.width * 0.3, 
                this.y + this.height * 0.6, 
                this.width * 0.1, 
                this.height * 0.4
            );
            // Achterpoot rechts
            ctx.fillRect(
                this.x + this.width * 0.8, 
                this.y + this.height * 0.6, 
                this.width * 0.1, 
                this.height * 0.4
            );
        } else {
            // Pootjes standaard
            // Voorpoot rechts
            ctx.fillRect(
                this.x + this.width * 0.7, 
                this.y + this.height * 0.6, 
                this.width * 0.1, 
                this.height * 0.4
            );
            // Achterpoot links
            ctx.fillRect(
                this.x + this.width * 0.2, 
                this.y + this.height * 0.6, 
                this.width * 0.1, 
                this.height * 0.4
            );
        }
        
        // Oog - positie afhankelijk van richting
        ctx.fillStyle = "white";
        ctx.beginPath();
        
        if (facingLeft) {
            // Oog links
            ctx.arc(
                this.x + this.width * 0.3, 
                this.y + this.height * 0.3, 
                this.width * 0.1, 
                0, Math.PI * 2
            );
        } else {
            // Oog rechts (standaard)
            ctx.arc(
                this.x + this.width * 0.7, 
                this.y + this.height * 0.3, 
                this.width * 0.1, 
                0, Math.PI * 2
            );
        }
        
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = "black";
        ctx.beginPath();
        
        if (facingLeft) {
            // Pupil links
            ctx.arc(
                this.x + this.width * 0.28, 
                this.y + this.height * 0.3, 
                this.width * 0.05, 
                0, Math.PI * 2
            );
        } else {
            // Pupil rechts (standaard)
            ctx.arc(
                this.x + this.width * 0.72, 
                this.y + this.height * 0.3, 
                this.width * 0.05, 
                0, Math.PI * 2
            );
        }
        
        ctx.fill();
        
        // Vliegende glitters als de eenhoorn vliegt
        if (this.flying) {
            const time = Date.now() / 100; // Voor animatie
            for (let i = 0; i < 7; i++) {
                const angle = (time / 50 + i) % (Math.PI * 2);
                const distance = 15 + Math.sin(time / 30 + i) * 5;
                
                const x = this.x + this.width/2 + Math.cos(angle) * distance;
                const y = this.y + this.height/2 + Math.sin(angle) * distance;
                
                ctx.fillStyle = maneColors[i % maneColors.length];
                ctx.beginPath();
                ctx.arc(x, y, 2 + Math.sin(time / 20 + i) * 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Levels laden van het externe bestand
const levels = getLevels(GROUND_LEVEL);

// Haal het startlevel op uit de URL
currentLevel = getStartLevel();

// Zorg ervoor dat het level index geldig is
if (currentLevel >= levels.length) {
    currentLevel = 0;
}

// Update de Level Editor link om terug te gaan naar hetzelfde level in de editor
updateEditorLink();

// Besturing instellen
const keys = {};

// Spelers aanmaken
const player1 = new Player(
    levels[currentLevel].startPositions[0].x, 
    levels[currentLevel].startPositions[0].y,
    {up: 'w', left: 'a', right: 'd', down: 's', switch: 'f'},
    "Speler 1",
    "SQUIRREL"
);

const player2 = new Player(
    levels[currentLevel].startPositions[1].x, 
    levels[currentLevel].startPositions[1].y,
    {up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', switch: 'Shift'},
    "Speler 2",
    "TURTLE"
);

// Input event listeners
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true; // Zowel hoofdletters als kleine letters registreren
    
    // Debug informatie in console
    console.log('Key pressed:', e.key);
    
    // Spatie om naar volgend level te gaan als level voltooid is
    if (e.key === ' ' && levelCompleted) {
        nextLevel();
    }
    
    // Spatie om opnieuw te proberen als de puppy is gevangen
    if (e.key === ' ' && gameState.gameOver) {
        // Reset het huidige level
        resetCurrentLevel();
    }
});

window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false; // Zowel hoofdletters als kleine letters loslaten
});

// Update de puppy
function updatePuppy() {
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData.puppy) return;
    
    const puppy = currentLevelData.puppy;
    
    // Als de puppy nog niet gered is
    if (!puppy.saved && !gameState.puppySaved) {
        // Geef de puppy een kleine beweging (schudden) om hem op te laten vallen
        puppy.offsetX = Math.sin(Date.now() / 300) * 2; // Langzaam schudden
        
        // Controleer of een speler de puppy aanraakt (redt)
        if (player1.collidesWithObject(puppy) || player2.collidesWithObject(puppy)) {
            puppy.saved = true;
            gameState.puppySaved = true;
            gameState.message = "Je hebt de puppy gered! Verzamel nu de ster!";
            
            // Voeg een vertraging toe om het bericht te tonen
            setTimeout(() => {
                gameState.message = "";
            }, 3000);
        }
        
        // Controleer of een vijand de puppy aanraakt (puppy verloren)
        // Voeg een kleine veiligheidsmarge toe, zodat de leeuw de puppy niet te makkelijk te pakken krijgt
        const enemies = currentLevelData.enemies || [];
        for (let enemy of enemies) {
            // Kleinere hitbox voor vijanden om puppy te pakken (75% van normale grootte)
            const adjustedEnemy = {
                x: enemy.x + enemy.width * 0.125,
                y: enemy.y + enemy.height * 0.125,
                width: enemy.width * 0.75,
                height: enemy.height * 0.75
            };
            
            if (collidesWithObjects(adjustedEnemy, puppy)) {
                // Ook hier 20% kans dat de puppy ontsnapt!
                if (!gameState.gameOver && Math.random() > 0.2) {
                    gameState.gameOver = true;
                    gameState.message = "Oh nee! De puppy is gevangen! Druk op Spatie om opnieuw te proberen";
                }
            }
        }
    }
}

// Helper functie voor collision detection
function collidesWithObjects(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Update vijanden (verplaats ze volgens hun patrol paths)
function updateEnemies() {
    const currentLevelData = levels[currentLevel];
    const enemies = currentLevelData.enemies || [];
    
    if (gameState.gameOver) return; // Geen updates als het game over is
    
    enemies.forEach(enemy => {
        // Als deze vijand een patrolDistance heeft, update zijn positie
        if (enemy.patrolDistance > 0) {
            // Initialiseer bewegingsrichting en startpositie als die er nog niet zijn
            if (enemy.direction === undefined) {
                enemy.direction = 1; // 1 = rechts, -1 = links
                enemy.startX = enemy.x; // Sla de originele X positie op
            }
            
            // Beweeg de vijand
            enemy.x += enemy.speed * enemy.direction;
            
            // Controleer of de vijand moet omdraaien
            if (enemy.x > enemy.startX + enemy.patrolDistance) {
                enemy.direction = -1; // Draai om en ga naar links
                enemy.x = enemy.startX + enemy.patrolDistance; // Zorg dat hij niet te ver gaat
            } else if (enemy.x < enemy.startX) {
                enemy.direction = 1; // Draai om en ga naar rechts
                enemy.x = enemy.startX; // Zorg dat hij niet te ver gaat
            }
        }
        
        // Als er een puppy is, laat de vijanden richting de puppy bewegen als ze dichtbij genoeg zijn
        if (currentLevelData.puppy && !currentLevelData.puppy.saved) {
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
                    
                    // Vijanden bewegen minder snel richting puppy 
                    // (50% van normale snelheid)
                    enemy.x += (enemy.speed * 0.5) * enemy.direction;
                }
            }
        }
    });
}

// Teken vijanden
function drawEnemies() {
    const currentLevelData = levels[currentLevel];
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
    ctx.fillStyle = '#DAA520'; // Goud kleur
    ctx.fillRect(lion.x, lion.y, lion.width, lion.height);
    
    // Manen (donkerder goud) - positie afhankelijk van richting
    ctx.fillStyle = '#B8860B'; // Donker goud
    ctx.beginPath();
    
    if (facingLeft) {
        // Manen links
        ctx.arc(lion.x + lion.width * 0.3, lion.y + lion.height * 0.4, 
                lion.width * 0.4, 0, Math.PI * 2);
    } else {
        // Manen rechts (standaard)
        ctx.arc(lion.x + lion.width * 0.7, lion.y + lion.height * 0.4, 
                lion.width * 0.4, 0, Math.PI * 2);
    }
    
    ctx.fill();
    
    // Ogen en Neus - positie afhankelijk van richting
    ctx.fillStyle = 'black';
    
    if (facingLeft) {
        // Oog links
        ctx.beginPath();
        ctx.arc(lion.x + lion.width * 0.2, lion.y + lion.height * 0.3, 
                lion.width * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Neus links
        ctx.beginPath();
        ctx.arc(lion.x + lion.width * 0.1, lion.y + lion.height * 0.4, 
                lion.width * 0.05, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Oog rechts (standaard)
        ctx.beginPath();
        ctx.arc(lion.x + lion.width * 0.8, lion.y + lion.height * 0.3, 
                lion.width * 0.06, 0, Math.PI * 2);
        ctx.fill();
        
        // Neus rechts (standaard)
        ctx.beginPath();
        ctx.arc(lion.x + lion.width * 0.9, lion.y + lion.height * 0.4, 
                lion.width * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Staart - positie afhankelijk van richting
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    
    if (facingLeft) {
        // Staart rechts
        ctx.moveTo(lion.x + lion.width, lion.y + lion.height * 0.7);
        ctx.quadraticCurveTo(
            lion.x + lion.width + lion.width * 0.2, lion.y + lion.height, 
            lion.x + lion.width + lion.width * 0.3, lion.y + lion.height * 0.5
        );
        ctx.quadraticCurveTo(
            lion.x + lion.width + lion.width * 0.3, lion.y + lion.height * 0.2, 
            lion.x + lion.width, lion.y + lion.height * 0.4
        );
    } else {
        // Staart links (standaard)
        ctx.moveTo(lion.x, lion.y + lion.height * 0.7);
        ctx.quadraticCurveTo(
            lion.x - lion.width * 0.2, lion.y + lion.height, 
            lion.x - lion.width * 0.3, lion.y + lion.height * 0.5
        );
        ctx.quadraticCurveTo(
            lion.x - lion.width * 0.3, lion.y + lion.height * 0.2, 
            lion.x, lion.y + lion.height * 0.4
        );
    }
    
    ctx.fill();
    
    // Poten - positie afhankelijk van richting
    ctx.fillStyle = '#DAA520';
    
    if (facingLeft) {
        // Poten gespiegeld
        // Voorpoot links
        ctx.fillRect(
            lion.x + lion.width * 0.3, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
        // Achterpoot rechts
        ctx.fillRect(
            lion.x + lion.width * 0.8, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
    } else {
        // Poten standaard
        // Voorpoot rechts
        ctx.fillRect(
            lion.x + lion.width * 0.7, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
        // Achterpoot links
        ctx.fillRect(
            lion.x + lion.width * 0.2, 
            lion.y + lion.height * 0.7, 
            lion.width * 0.15, 
            lion.height * 0.3
        );
    }
}

// Functie om de puppy te tekenen
function drawPuppy(puppy) {
    if (puppy.saved) return; // Teken de puppy niet als hij al gered is
    
    // Pas de positie aan met de offset voor het schudden (als die bestaat)
    const puppyX = puppy.x + (puppy.offsetX || 0);
    
    // Puppy lichaam (lichtbruin)
    ctx.fillStyle = '#D2B48C'; // Tan kleur
    ctx.fillRect(puppyX, puppy.y, puppy.width, puppy.height);
    
    // Puppy oren (donkerder bruin)
    // Linker oor
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(puppyX + puppy.width * 0.1, puppy.y);
    ctx.lineTo(puppyX, puppy.y - puppy.height * 0.5);
    ctx.lineTo(puppyX + puppy.width * 0.2, puppy.y);
    ctx.fill();
    
    // Rechter oor
    ctx.beginPath();
    ctx.moveTo(puppyX + puppy.width * 0.8, puppy.y);
    ctx.lineTo(puppyX + puppy.width, puppy.y - puppy.height * 0.5);
    ctx.lineTo(puppyX + puppy.width * 0.9, puppy.y);
    ctx.fill();
    
    // Puppy ogen (groot en schattig)
    ctx.fillStyle = 'black';
    // Linker oog
    ctx.beginPath();
    ctx.arc(
        puppyX + puppy.width * 0.3, 
        puppy.y + puppy.height * 0.3, 
        puppy.width * 0.12, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Wit van het oog
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
        puppyX + puppy.width * 0.28, 
        puppy.y + puppy.height * 0.28, 
        puppy.width * 0.04, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Rechter oog
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
        puppyX + puppy.width * 0.7, 
        puppy.y + puppy.height * 0.3, 
        puppy.width * 0.12, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Wit van het oog
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
        puppyX + puppy.width * 0.68, 
        puppy.y + puppy.height * 0.28, 
        puppy.width * 0.04, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Puppy neus
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
        puppyX + puppy.width * 0.5, 
        puppy.y + puppy.height * 0.5, 
        puppy.width * 0.1, 
        0, Math.PI * 2
    );
    ctx.fill();
    
    // Puppy staart
    ctx.fillStyle = '#D2B48C';
    ctx.beginPath();
    ctx.moveTo(puppyX, puppy.y + puppy.height * 0.5);
    ctx.quadraticCurveTo(
        puppyX - puppy.width * 0.3, puppy.y + puppy.height * 0.3, 
        puppyX - puppy.width * 0.2, puppy.y + puppy.height * 0.7
    );
    ctx.quadraticCurveTo(
        puppyX - puppy.width * 0.1, puppy.y + puppy.height * 0.8, 
        puppyX, puppy.y + puppy.height * 0.6
    );
    ctx.fill();
    
    // Teken een kleine SOS-tekstballon boven de puppy om aan te geven dat hij hulp nodig heeft
    if (!gameState.gameOver) {
        const bubbleWidth = puppy.width * 1.2;
        const bubbleHeight = puppy.height * 0.6;
        const bubbleX = puppyX - (bubbleWidth - puppy.width) / 2;
        const bubbleY = puppy.y - bubbleHeight - 15;
        
        // Voeg een klein beefeffect toe aan de SOS-tekstballon
        const time = Date.now() / 150;
        const trembleX = Math.sin(time) * 1.5;
        const trembleY = Math.cos(time * 1.5) * 1;
        
        // Teken de tekstballon
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(
            bubbleX + bubbleWidth/2 + trembleX, 
            bubbleY + bubbleHeight/2 + trembleY, 
            bubbleWidth/2, 
            bubbleHeight/2, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Teken de driehoek naar de puppy
        ctx.beginPath();
        ctx.moveTo(bubbleX + bubbleWidth/2 - 5 + trembleX, bubbleY + bubbleHeight + trembleY);
        ctx.lineTo(bubbleX + bubbleWidth/2 + 5 + trembleX, bubbleY + bubbleHeight + trembleY);
        ctx.lineTo(puppyX + puppy.width/2, puppy.y);
        ctx.fill();
        
        // Teken "Help!" in de tekstballon
        ctx.fillStyle = 'red';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Help!', bubbleX + bubbleWidth/2 + trembleX, bubbleY + bubbleHeight/2 + 4 + trembleY);
        
        // Geanimeerde voetstappen voor de puppy om aan te geven dat hij beweegt
        const footprintTime = Date.now() / 500;
        // Teken alleen als de functie sin ongeveer 1 is (dus maar af en toe)
        if (Math.sin(footprintTime) > 0.9) {
            ctx.fillStyle = 'rgba(165, 42, 42, 0.3)'; // Donkerrode voetafdrukken
            // Verschillende posities voor pootafdrukken
            const positions = [
                {x: puppyX - 10, y: puppy.y + puppy.height + 5},
                {x: puppyX - 15, y: puppy.y + puppy.height + 8},
                {x: puppyX - 20, y: puppy.y + puppy.height + 3}
            ];
            
            // Teken kleine pootafdrukken
            positions.forEach(pos => {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
}

// Reset het huidige level (na game over door puppy verlies)
function resetCurrentLevel() {
    // Reset spelers
    player1.resetToStart();
    player2.resetToStart();
    
    // Reset puppy
    const currentLevelData = levels[currentLevel];
    if (currentLevelData.puppy) {
        currentLevelData.puppy.saved = false;
    }
    
    // Reset game state
    gameState.puppySaved = false;
    gameState.gameOver = false;
    gameState.message = "";
    
    // Reset vijanden naar hun startposities
    if (currentLevelData.enemies) {
        currentLevelData.enemies.forEach(enemy => {
            if (enemy.startX !== undefined) {
                enemy.x = enemy.startX;
                enemy.direction = 1;
            }
        });
    }
}

// Teken een draak
function drawDragon(dragon) {
    // Bepaal richting op basis van beweging
    const facingLeft = dragon.direction === -1;
    
    // Lichaam (groen)
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.fillRect(dragon.x, dragon.y, dragon.width, dragon.height);
    
    // Vleugels - positie afhankelijk van richting
    ctx.fillStyle = '#006400'; // Donkerder groen
    
    if (facingLeft) {
        // Vleugels gespiegeld
        // Rechter vleugel (nu links)
        ctx.beginPath();
        ctx.moveTo(dragon.x + dragon.width * 0.3, dragon.y + dragon.height * 0.2);
        ctx.lineTo(dragon.x - dragon.width * 0.3, dragon.y - dragon.height * 0.1);
        ctx.lineTo(dragon.x - dragon.width * 0.1, dragon.y + dragon.height * 0.1);
        ctx.lineTo(dragon.x + dragon.width * 0.1, dragon.y + dragon.height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Linker vleugel (nu rechts)
        ctx.beginPath();
        ctx.moveTo(dragon.x + dragon.width * 0.7, dragon.y + dragon.height * 0.2);
        ctx.lineTo(dragon.x + dragon.width * 1.3, dragon.y - dragon.height * 0.1);
        ctx.lineTo(dragon.x + dragon.width * 1.1, dragon.y + dragon.height * 0.1);
        ctx.lineTo(dragon.x + dragon.width * 0.9, dragon.y + dragon.height * 0.3);
        ctx.closePath();
        ctx.fill();
    } else {
        // Vleugels standaard
        // Linker vleugel
        ctx.beginPath();
        ctx.moveTo(dragon.x + dragon.width * 0.3, dragon.y + dragon.height * 0.2);
        ctx.lineTo(dragon.x - dragon.width * 0.3, dragon.y - dragon.height * 0.1);
        ctx.lineTo(dragon.x - dragon.width * 0.1, dragon.y + dragon.height * 0.1);
        ctx.lineTo(dragon.x + dragon.width * 0.1, dragon.y + dragon.height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Rechter vleugel
        ctx.beginPath();
        ctx.moveTo(dragon.x + dragon.width * 0.7, dragon.y + dragon.height * 0.2);
        ctx.lineTo(dragon.x + dragon.width * 1.3, dragon.y - dragon.height * 0.1);
        ctx.lineTo(dragon.x + dragon.width * 1.1, dragon.y + dragon.height * 0.1);
        ctx.lineTo(dragon.x + dragon.width * 0.9, dragon.y + dragon.height * 0.3);
        ctx.closePath();
        ctx.fill();
    }
    
    // Kop - positie afhankelijk van richting
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    
    if (facingLeft) {
        // Kop links
        ctx.arc(
            dragon.x + dragon.width * 0.2, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.2, 
            0, Math.PI * 2
        );
    } else {
        // Kop rechts (standaard)
        ctx.arc(
            dragon.x + dragon.width * 0.8, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.2, 
            0, Math.PI * 2
        );
    }
    
    ctx.fill();
    
    // Ogen - positie afhankelijk van richting
    ctx.fillStyle = 'red';
    ctx.beginPath();
    
    if (facingLeft) {
        // Oog links
        ctx.arc(
            dragon.x + dragon.width * 0.15, 
            dragon.y + dragon.height * 0.25, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
    } else {
        // Oog rechts (standaard)
        ctx.arc(
            dragon.x + dragon.width * 0.85, 
            dragon.y + dragon.height * 0.25, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
    }
    
    ctx.fill();
    
    // Staart - positie afhankelijk van richting
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    
    if (facingLeft) {
        // Staart rechts
        ctx.moveTo(dragon.x + dragon.width, dragon.y + dragon.height * 0.5);
        ctx.quadraticCurveTo(
            dragon.x + dragon.width + dragon.width * 0.5, dragon.y + dragon.height * 0.5, 
            dragon.x + dragon.width + dragon.width * 0.3, dragon.y + dragon.height * 0.7
        );
        ctx.quadraticCurveTo(
            dragon.x + dragon.width + dragon.width * 0.2, dragon.y + dragon.height * 0.9, 
            dragon.x + dragon.width, dragon.y + dragon.height * 0.7
        );
    } else {
        // Staart links (standaard)
        ctx.moveTo(dragon.x, dragon.y + dragon.height * 0.5);
        ctx.quadraticCurveTo(
            dragon.x - dragon.width * 0.5, dragon.y + dragon.height * 0.5, 
            dragon.x - dragon.width * 0.3, dragon.y + dragon.height * 0.7
        );
        ctx.quadraticCurveTo(
            dragon.x - dragon.width * 0.2, dragon.y + dragon.height * 0.9, 
            dragon.x, dragon.y + dragon.height * 0.7
        );
    }
    
    ctx.fill();
    
    // Vuur (als de draak rondvliegt)
    if (dragon.patrolDistance > 0) {
        const time = Date.now() / 100;
        // Bepaal waar het vuur vandaan komt op basis van richting
        const fireX = facingLeft ? dragon.x : dragon.x + dragon.width;
        
        // Gele buitenste vlam
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.15, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Oranje middelste vlam
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.1, 
            0, Math.PI * 2
        );
        ctx.fill();
        
        // Rode binnenste vlam
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(
            fireX, 
            dragon.y + dragon.height * 0.3, 
            dragon.width * 0.05, 
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

// Game loop
function gameLoop() {
    if (gameState.running) {
        // Canvas leegmaken
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Achtergrond tekenen
        drawBackground();
        
        // Level objecten tekenen
        const currentLevelData = levels[currentLevel];
        
        // Update de puppy en vijanden
        updatePuppy();
        updateEnemies();
        
        // Platforms tekenen
        currentLevelData.platforms.forEach(platform => {
            drawPlatform(platform);
        });
        
        // Valstrikken tekenen
        currentLevelData.traps.forEach(trap => {
            drawTrap(trap);
        });
        
        // Vijanden tekenen
        drawEnemies();
        
        // Puppy tekenen
        if (currentLevelData.puppy) {
            drawPuppy(currentLevelData.puppy);
        }
        
        // Collectibles tekenen
        currentLevelData.collectibles.forEach(collectible => {
            drawCollectible(collectible);
        });
        
        // Grond tekenen
        drawGround();
        
        // Spelers updaten en tekenen
        player1.update(player2, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        player2.update(player1, currentLevelData.platforms, currentLevelData.traps, currentLevelData.collectibles);
        
        player1.draw();
        player2.draw();
        
        // Game berichten
        if (gameState.message) {
            ctx.font = '20px Comic Sans MS';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(gameState.message, canvas.width/2, 100);
        }
        
        // Level naam
        ctx.font = '16px Comic Sans MS';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.fillText("Level " + (currentLevel + 1) + ": " + currentLevelData.name, 10, 20);
    }
    
    requestAnimationFrame(gameLoop);
}

// Achtergrond tekenen
function drawBackground() {
    // Lucht
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Achtergrondwolken (wit en semi-transparant)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(130, 70, 30, 0, Math.PI * 2);
    ctx.arc(160, 80, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(600, 100, 35, 0, Math.PI * 2);
    ctx.arc(650, 90, 30, 0, Math.PI * 2);
    ctx.arc(690, 100, 25, 0, Math.PI * 2);
    ctx.fill();
}

// Grond tekenen
function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_LEVEL, canvas.width, canvas.height - GROUND_LEVEL);
    
    // Gras bovenop
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(0, GROUND_LEVEL, canvas.width, 10);
}

// Platform tekenen
function drawPlatform(platform) {
    switch(platform.type) {
        case "NORMAL":
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Gras bovenop
            ctx.fillStyle = '#2E8B57';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
            break;
        case "WATER":
            // Duidelijker water achtergrond
            ctx.fillStyle = 'rgba(0, 120, 255, 0.7)';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Animeer de golven met de game time
            const time = Date.now() / 1000;
            const waveHeight = 3;
            const waveFreq = 0.2;
            
            // Golven
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            
            // Bovenste golven
            ctx.beginPath();
            for (let i = 0; i < platform.width; i += 5) {
                const y = platform.y + Math.sin((i + time * 50) * waveFreq) * waveHeight;
                if (i === 0) {
                    ctx.moveTo(platform.x + i, y);
                } else {
                    ctx.lineTo(platform.x + i, y);
                }
            }
            ctx.stroke();
            
            // Kleine bubbels
            for (let i = 0; i < 5; i++) {
                const bubbleX = platform.x + Math.sin(time * (i+1)) * platform.width/4 + platform.width/2;
                const bubbleY = platform.y + ((time * 20 + i * 30) % platform.height);
                const size = 2 + Math.sin(time * 2) * 1;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
                ctx.fill();
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
                ctx.fillStyle = cloudColors[i];
                ctx.globalAlpha = 0.3 - (i * 0.04);
                ctx.beginPath();
                ctx.arc(
                    platform.x + platform.width / 2,
                    platform.y + platform.height / 2 + offsetY,
                    glowSize,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;
            
            // Teken nu de witte wolk erbovenop
            // Hoofddeel van de wolk
            const centerX = platform.x + platform.width / 2;
            const centerY = platform.y + platform.height / 2 + offsetY;
            const radiusX = platform.width / 2;
            const radiusY = platform.height / 2;
            
            // Teken meerdere cirkels om een wolkachtige vorm te maken
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radiusY, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(centerX - radiusX * 0.6, centerY, radiusY * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(centerX + radiusX * 0.6, centerY, radiusY * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(centerX - radiusX * 0.3, centerY - radiusY * 0.5, radiusY * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(centerX + radiusX * 0.3, centerY - radiusY * 0.4, radiusY * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            // Glinster-effect voor de magische wolken (alleen te gebruiken door eenhoorns)
            const starColors = ['#FFD700', '#FF00FF', '#00FFFF', '#FF69B4', '#ADFF2F'];
            for (let i = 0; i < 5; i++) {
                const twinkleX = centerX + Math.cos(cloudTime * 5 + i * 2) * radiusX * 0.7;
                const twinkleY = centerY + Math.sin(cloudTime * 7 + i * 2) * radiusY * 0.7;
                const twinkleSize = 3 + Math.sin(cloudTime * 10 + i) * 2;
                
                // Sterretje tekenen
                ctx.fillStyle = starColors[i % starColors.length];
                ctx.beginPath();
                
                // Teken een 5-puntige ster
                for (let j = 0; j < 5; j++) {
                    const angle = (j * 2 * Math.PI / 5) - Math.PI / 2 + cloudTime * 3;
                    const x = twinkleX + Math.cos(angle) * twinkleSize;
                    const y = twinkleY + Math.sin(angle) * twinkleSize;
                    
                    if (j === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
            }
            
            
            break;
        case "CLIMB":
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Klimpatroon
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            for (let i = 10; i < platform.height; i += 20) {
                ctx.beginPath();
                ctx.moveTo(platform.x, platform.y + i);
                ctx.lineTo(platform.x + platform.width, platform.y + i);
                ctx.stroke();
            }
            break;
        case "TREE":
            // Boomstam tekenen
            ctx.fillStyle = '#8B4513'; // Bruine stam
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Boomschors textuur
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            for (let i = 10; i < platform.height; i += 25) {
                ctx.beginPath();
                ctx.moveTo(platform.x + 5, platform.y + i);
                ctx.lineTo(platform.x + platform.width - 5, platform.y + i + 5);
                ctx.stroke();
            }
            
            // Bladeren/kroon bovenop
            const leafSize = platform.width * 2.5;
            ctx.fillStyle = '#228B22'; // Donkergroen
            ctx.beginPath();
            ctx.arc(platform.x + platform.width / 2, platform.y - leafSize / 2, leafSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#32CD32'; // Lichtergroen
            ctx.beginPath();
            ctx.arc(platform.x + platform.width / 2 - 15, platform.y - leafSize / 2 - 10, leafSize / 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(platform.x + platform.width / 2 + 15, platform.y - leafSize / 2 - 5, leafSize / 3, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

// Valstrik tekenen
function drawTrap(trap) {
    if (trap.type === "SPIKES") {
        ctx.fillStyle = '#888';
        
        // Basis van de spikes
        ctx.fillRect(trap.x, trap.y + trap.height - 5, trap.width, 5);
        
        // Punten tekenen
        ctx.fillStyle = '#555';
        const spikeWidth = 8;
        const numSpikes = Math.floor(trap.width / spikeWidth);
        
        for (let i = 0; i < numSpikes; i++) {
            ctx.beginPath();
            ctx.moveTo(trap.x + i * spikeWidth, trap.y + trap.height - 5);
            ctx.lineTo(trap.x + i * spikeWidth + spikeWidth/2, trap.y);
            ctx.lineTo(trap.x + i * spikeWidth + spikeWidth, trap.y + trap.height - 5);
            ctx.fill();
        }
    }
}

// Verzamelobject tekenen
function drawCollectible(collectible) {
    // Redden sterretje
    ctx.fillStyle = 'gold';
    
    // Ster tekenen
    const centerX = collectible.x + collectible.width/2;
    const centerY = collectible.y + collectible.height/2;
    const spikes = 5;
    const outerRadius = collectible.width/2;
    const innerRadius = collectible.width/4;
    
    ctx.beginPath();
    for(let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = Math.PI * i / spikes - Math.PI / 2;
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
    
    // Glinstering
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX - collectible.width/5, centerY - collectible.height/5, 
            collectible.width/10, 0, Math.PI * 2);
    ctx.fill();
}

// Naar volgend level gaan
function nextLevel() {
    currentLevel++;
    if (currentLevel >= levels.length) {
        currentLevel = 0; // Terug naar eerste level of eindscherm tonen
    }
    
    // Reset spelers
    player1.animalType = "SQUIRREL";
    player1.updateAnimalProperties();
    player1.x = levels[currentLevel].startPositions[0].x;
    player1.y = levels[currentLevel].startPositions[0].y;
    
    player2.animalType = "TURTLE";
    player2.updateAnimalProperties();
    player2.x = levels[currentLevel].startPositions[1].x;
    player2.y = levels[currentLevel].startPositions[1].y;
    
    // Reset game state
    levelCompleted = false;
    gameState.message = "";
    gameState.puppySaved = false;
    gameState.gameOver = false;
    
    // Update de URL fragment zonder de pagina opnieuw te laden
    window.location.hash = `level=${currentLevel}`;
    
    // Update de editor link
    updateEditorLink();
}

// Update de editor link om terug te gaan naar hetzelfde level
function updateEditorLink() {
    const editorLink = document.getElementById('editor-link');
    if (editorLink) {
        editorLink.href = `editor.html#level=${currentLevel}`;
    }
}

// Game starten
gameLoop();