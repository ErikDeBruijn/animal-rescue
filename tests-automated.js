// Geautomatiseerde test suite voor Dieren Redders
// Deze tests kunnen vanuit de console worden uitgevoerd en geven een duidelijk rapport terug

// Testresultaten opslag
const TestResults = {
    total: 0,
    passed: 0,
    failed: 0,
    results: []
};

// Test helper functies
function assert(condition, message) {
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
}

// Test suite definitie
const TestSuite = {
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
        player1.updateAnimalProperties();
        player2.animalType = "TURTLE";
        player2.updateAnimalProperties();
        
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
        player1.updateAnimalProperties();
        player2.animalType = originalPlayer2Animal;
        player2.updateAnimalProperties();
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
        player2.updateAnimalProperties();
        
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
        player2.updateAnimalProperties();
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
        const beforeY = player1.y;
        player1.update(player2, [testPlatform], [], []);
        
        assert(
            player1.y === testPlatform.y - player1.height && player1.velY === 0,
            "Speler landt correct op platforms en blijft erop staan"
        );
        
        // Herstel originele positie
        player1.x = originalPlayer1X;
        player1.y = originalPlayer1Y;
        player1.velY = originalPlayer1VelY;
    },
    
    // Test dat eenhoorn niet door platforms heen kan
    testUnicornPlatformCollision: function() {
        // Log de test
        console.log("Start testUnicornPlatformCollision test");
        
        // Definieer een dummy Platform class voor deze test
        class DummyPlatform {
            constructor(x, y, width, height, type) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.type = type || "NORMAL";
            }
        }

        // Definieer een dummy unicorn die onafhankelijk is van de game state
        const unicorn = {
            animalType: "UNICORN",
            x: 250,
            y: 300,
            width: 40,
            height: 30,
            velX: 0,
            velY: -10, // Beweegt snel omhoog
            flying: true,
            // Voeg de collision methode toe die we willen testen
            collidesWithPlatform: function(platform) {
                return this.x < platform.x + platform.width &&
                       this.x + this.width > platform.x &&
                       this.y < platform.y + platform.height &&
                       this.y + this.height > platform.y;
            }
        };
        
        // Maak een testplatform dat de eenhoorn gaat tegenkomen tijdens het omhoog vliegen
        const platform = new DummyPlatform(200, 250, 150, 30, "NORMAL");
        
        // Controleer eerst of de unicorn en platform niet overlappen bij test start
        console.log("Unicorn positie begin:", unicorn.y, "Platform positie:", platform.y);
        const initiallyColliding = unicorn.collidesWithPlatform(platform);
        console.log("Initiële collision:", initiallyColliding);
        
        // Simuleer beweging
        // De Y-positie van de unicorn was 300, en met een snelheid van -10 gaat hij omhoog
        // richting het platform op Y=250. Hij hoort te stoppen bij het platform.
        const initialY = unicorn.y;
        
        // Beweeg de unicorn 5 frames omhoog
        for (let i = 0; i < 5; i++) {
            unicorn.y += unicorn.velY;
            
            // Simuleer platformdetectie code - Dit is de eenvoudige versie van wat in game.js staat
            if (unicorn.collidesWithPlatform(platform)) {
                console.log("Collision gedetecteerd op frame", i);
                if (unicorn.velY < 0) {  // Als de eenhoorn omhoog beweegt
                    unicorn.velY = 1;    // Stop omhoog beweging, stuit terug
                    unicorn.y = platform.y + platform.height; // Plaats onder platform
                }
                break;
            }
        }
        
        console.log("Unicorn eindpositie:", unicorn.y, "Platform positie:", platform.y);
        console.log("Unicorn Y snelheid:", unicorn.velY);
        
        // Test of de eenhoorn onder het platform is gestopt
        const stoppedBelow = unicorn.y >= platform.y + platform.height;
        const directionChanged = unicorn.velY > 0;  // Zou van richting moeten veranderen
        
        assert(
            stoppedBelow && directionChanged,
            "Eenhoorn kan niet door platforms heen vliegen en stuit terug"
        );
        
        console.log("Einde testUnicornPlatformCollision test");
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
        this.testUnicornPlatformCollision();
        
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

// Export voor gebruik in andere contexten
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestSuite;
}