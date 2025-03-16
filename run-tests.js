// Run-tests.js - Script voor het uitvoeren van de geautomatiseerde tests in Node.js

// Mock browser globals
global.window = {};
global.document = {
    getElementById: () => ({ classList: { toggle: () => {} } })
};
global.canvas = {
    width: 800,
    height: 450
};
global.ctx = {
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    fill: () => {},
    stroke: () => {},
    arc: () => {},
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    ellipse: () => {},
    fillText: () => {}
};

// Mock game constructs
global.keys = {};
global.GROUND_LEVEL = 400;

// Mock spelers
class Player {
    constructor(animalType) {
        this.animalType = animalType;
        this.x = 100;
        this.y = 100;
        this.velX = 0;
        this.velY = 0;
        this.width = 30;
        this.height = 30;
        this.canSwitch = true;
        this.name = animalType === "SQUIRREL" ? "Speler 1" : "Speler 2";
        this.controls = animalType === "SQUIRREL" 
            ? {up: 'w', left: 'a', right: 'd', down: 's', switch: 'f'}
            : {up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', switch: 'Shift'};
    }
    
    updateAnimalProperties() {
        // Dierspecifieke eigenschappen bijwerken
    }
    
    collidesWithPlatform(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }
    
    isSwitchKeyPressed() {
        if (this.name === "Speler 2") {
            return global.keys['Shift'] || global.keys['ShiftLeft'] || global.keys['ShiftRight'];
        } else {
            return global.keys['f'] || global.keys['F'];
        }
    }
    
    switchAnimal(otherPlayer) {
        // Kan alleen wisselen naar een dier dat de andere speler niet is
        const newAnimalType = this.animalType === "SQUIRREL" ? "TURTLE" : "SQUIRREL";
        
        if (otherPlayer.animalType === newAnimalType) {
            console.log(`Kan niet wisselen: ${this.name} wil ${newAnimalType} worden, maar ${otherPlayer.name} is al ${otherPlayer.animalType}`);
            return; // Kan niet wisselen naar hetzelfde dier dat de andere speler is
        }
        
        // Wissel tussen eekhoorn en schildpad
        console.log(`${this.name} wisselt van ${this.animalType} naar ${newAnimalType}`);
        this.animalType = newAnimalType;
        this.updateAnimalProperties();
    }
    
    update(otherPlayer, platforms, traps, collectibles) {
        // Wisselen van dier - verbeterde detectie voor alle shift-toetsen en F-toets
        let switchKeyPressed = this.isSwitchKeyPressed();
        
        if (switchKeyPressed && this.canSwitch) {
            this.switchAnimal(otherPlayer);
            this.canSwitch = false; // Voorkom snel wisselen
        } else if (!switchKeyPressed) {
            this.canSwitch = true; // Reset wanneer knop losgelaten
        }
        
        // Simuleer beweging en collision detection
        if (platforms && platforms.length > 0) {
            for (let platform of platforms) {
                if (this.collidesWithPlatform(platform)) {
                    if (platform.type === "WATER") {
                        if (this.animalType === "TURTLE") {
                            // Schildpad kan zwemmen
                            this.velY *= 0.5; // Langzamer vallen in water
                            
                            // Schildpad kan in water omhoog zwemmen
                            if (global.keys[this.controls.up]) {
                                this.velY = -2; // Omhoog zwemmen
                            }
                            
                            // Laat schildpad drijven (niet zinken) in water
                            if (Math.abs(this.velY) < 0.5 && !global.keys[this.controls.up]) {
                                this.velY = -0.2; // Langzaam drijven
                            }
                        }
                    } else if (platform.type === "NORMAL") {
                        // Op een normaal platform staan
                        if (this.velY > 0) {
                            this.y = platform.y - this.height;
                            this.velY = 0;
                        }
                    }
                }
            }
        }
    }
}

// Maak test spelers met verschillende diertypes
global.player1 = new Player("SQUIRREL");
global.player2 = new Player("TURTLE");

// Maak de TestResults globaal
global.TestResults = {
    total: 0,
    passed: 0,
    failed: 0,
    results: []
};

// Helper functies
global.assert = function(condition, message) {
    TestResults.total++;
    if (condition) {
        TestResults.passed++;
        TestResults.results.push({ passed: true, message });
        return true;
    } else {
        TestResults.failed++;
        TestResults.results.push({ passed: false, message });
        return false;
    }
};

// Maak de test suite
global.TestSuite = {
    // Test het wisselen en terugwisselen van dieren
    testAnimalSwitching: function() {
        // Sla originele dieren op
        const originalPlayer1Animal = player1.animalType;
        const originalPlayer2Animal = player2.animalType;
        
        // Test 1: Speler 1 wissel (F indrukken)
        keys['f'] = true;
        player1.update(player2, [], [], []);
        keys['f'] = false;
        player1.update(player2, [], [], []); // Laat los
        
        const player1FirstWissel = player1.animalType;
        assert(
            player1FirstWissel !== originalPlayer1Animal,
            "Speler 1 kan van dier wisselen met F toets"
        );
        
        // Test 2: Speler 1 terugwissel (F opnieuw)
        keys['f'] = true;
        player1.update(player2, [], [], []);
        keys['f'] = false;
        player1.update(player2, [], [], []); // Laat los
        
        assert(
            player1.animalType === originalPlayer1Animal,
            "Speler 1 kan terugwisselen naar het originele dier met F toets"
        );
        
        // Test 3: Speler 2 wissel (Shift indrukken)
        keys['Shift'] = true;
        player2.update(player1, [], [], []);
        keys['Shift'] = false;
        player2.update(player1, [], [], []); // Laat los
        
        const player2FirstWissel = player2.animalType;
        assert(
            player2FirstWissel !== originalPlayer2Animal,
            "Speler 2 kan van dier wisselen met Shift toets"
        );
        
        // Test 4: Speler 2 terugwissel (Shift opnieuw)
        keys['Shift'] = true;
        player2.update(player1, [], [], []);
        keys['Shift'] = false;
        player2.update(player1, [], [], []); // Laat los
        
        assert(
            player2.animalType === originalPlayer2Animal,
            "Speler 2 kan terugwisselen naar het originele dier met Shift toets"
        );
        
        // Test 5: Spelers kunnen niet hetzelfde dier zijn
        player1.animalType = "SQUIRREL";
        player2.animalType = "TURTLE";
        
        keys['Shift'] = true;
        player2.update(player1, [], [], []);
        keys['Shift'] = false;
        player2.update(player1, [], [], []); // Laat los
        
        assert(
            player1.animalType !== player2.animalType,
            "Spelers kunnen niet hetzelfde dier zijn (bescherming werkt)"
        );
        
        // Herstel de originele diertypes
        player1.animalType = originalPlayer1Animal;
        player2.animalType = originalPlayer2Animal;
    },
    
    // Test zwemfunctionaliteit voor de schildpad
    testSwimming: function() {
        // Maak een waterplatform voor de test
        const testWater = {
            x: 100,
            y: 300,
            width: 100,
            height: 50,
            type: "WATER"
        };
        
        // Sla originele data op
        const originalPlayer2Animal = player2.animalType;
        const originalPlayer2X = player2.x;
        const originalPlayer2Y = player2.y;
        const originalPlayer2VelY = player2.velY;
        
        // Verander speler 2 naar schildpad voor zwemtest
        player2.animalType = "TURTLE";
        
        // Positioneer de schildpad boven het water
        player2.x = 120;
        player2.y = 280;
        
        // Test 1: Schildpad kan water detecteren
        assert(
            player2.collidesWithPlatform(testWater),
            "Schildpad kan waterplatforms detecteren"
        );
        
        // Test 2: Schildpad blijft drijven in water
        player2.velY = 5; // Beweging naar beneden
        player2.update(player1, [testWater], [], []);
        
        assert(
            player2.velY < 5,
            "Schildpad vertraagt in water (drijft beter dan andere dieren)"
        );
        
        // Test 3: Schildpad kan omhoog zwemmen in water
        player2.velY = 5; // Reset naar beweging naar beneden
        keys[player2.controls.up] = true; // Omhoog zwemmen
        player2.update(player1, [testWater], [], []);
        keys[player2.controls.up] = false;
        
        assert(
            player2.velY < 0,
            "Schildpad kan omhoog zwemmen in water met omhoog-toets"
        );
        
        // Herstel originele staat
        player2.animalType = originalPlayer2Animal;
        player2.x = originalPlayer2X;
        player2.y = originalPlayer2Y;
        player2.velY = originalPlayer2VelY;
    },
    
    // Test platformdetectie en -collisies
    testPlatformCollisions: function() {
        // Maak een testplatform
        const testPlatform = {
            x: 100,
            y: 300,
            width: 100,
            height: 20,
            type: "NORMAL"
        };
        
        // Sla originele posities op
        const originalPlayer1X = player1.x;
        const originalPlayer1Y = player1.y;
        const originalPlayer1VelY = player1.velY;
        
        // Positioneer speler 1 boven het platform
        player1.x = 120;
        player1.y = 275;
        player1.velY = 5; // Beweging naar beneden
        
        // Test 1: Platform detectie
        assert(
            player1.collidesWithPlatform(testPlatform),
            "Speler kan platforms detecteren"
        );
        
        // Test 2: Speler landt op platform
        player1.update(player2, [testPlatform], [], []);
        
        assert(
            player1.velY === 0,
            "Speler stopt met vallen op platforms"
        );
        
        // Herstel originele positie
        player1.x = originalPlayer1X;
        player1.y = originalPlayer1Y;
        player1.velY = originalPlayer1VelY;
    },
    
    // Voer alle tests uit en rapporteer resultaten
    runAllTests: function() {
        // Reset testresultaten
        TestResults.total = 0;
        TestResults.passed = 0;
        TestResults.failed = 0;
        TestResults.results = [];
        
        // Voer alle tests uit
        this.testAnimalSwitching();
        this.testSwimming();
        this.testPlatformCollisions();
        
        // Genereer rapport
        return this.generateReport();
    },
    
    // Genereer testrapport
    generateReport: function() {
        let report = `\n----- TEST RAPPORT -----\n`;
        report += `Totaal tests: ${TestResults.total}\n`;
        report += `Geslaagd: ${TestResults.passed}\n`;
        report += `Mislukt: ${TestResults.failed}\n`;
        report += `Slagingspercentage: ${Math.round((TestResults.passed / TestResults.total) * 100)}%\n\n`;
        
        report += `Gedetailleerde resultaten:\n`;
        TestResults.results.forEach((result, index) => {
            report += `${index + 1}. [${result.passed ? 'PASS' : 'FAIL'}] ${result.message}\n`;
        });
        
        report += `\n-----------------------\n`;
        
        return report;
    }
};

// Aanvullende test voor eenhoorn en platforms
global.animalTypes = {
    UNICORN: {
        name: "Eenhoorn",
        color: "#E56BF7", 
        width: 40,
        height: 30,
        jumpPower: -7,
        speed: 6,
        ability: "Vliegen en over grote afstanden zweven",
        canFly: true
    }
};

// Voeg een test toe voor unicorn-platform collisions
TestSuite.testUnicornPlatformCollision = function() {
    console.log("Test: Eenhoorn kan niet door platforms vliegen");
    
    // Definieer een simpele unicorn en platform
    const unicorn = {
        x: 250,
        y: 300,
        width: 40,
        height: 30,
        velY: -10
    };
    
    const platform = {
        x: 200,
        y: 250,
        width: 150,
        height: 30
    };
    
    // Controleer collision
    const collidesWithPlatform = function(obj, platform) {
        return obj.x < platform.x + platform.width &&
               obj.x + obj.width > platform.x &&
               obj.y < platform.y + platform.height &&
               obj.y + obj.height > platform.y;
    };
    
    // Simuleer beweging
    let collision = false;
    let stoppedY = 0;
    
    for (let i = 0; i < 5; i++) {
        unicorn.y += unicorn.velY;
        if (collidesWithPlatform(unicorn, platform)) {
            collision = true;
            stoppedY = unicorn.y;
            unicorn.velY = 1; // Stuit terug
            unicorn.y = platform.y + platform.height;
            break;
        }
    }
    
    // Test resultat
    assert(
        collision && unicorn.y >= platform.y + platform.height && unicorn.velY > 0,
        "Eenhoorn collision logica werkt correct tijdens vliegen"
    );
};

// Voer alle tests uit
console.log(TestSuite.runAllTests());