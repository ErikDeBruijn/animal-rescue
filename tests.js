// Tests voor Dieren Redders
// Dit bestand bevat geautomatiseerde tests om de functionaliteit van het spel te verifiëren

// Automatische testuitvoering is uitgeschakeld 
// Tests worden nu gestart via het testpanel
// Uncomment de volgende code om tests automatisch uit te voeren bij laden:
/*
window.addEventListener('load', function() {
    // Wacht even tot het spel volledig geïnitialiseerd is
    setTimeout(runTests, 1000);
});
*/

// Hoofdtestfunctie
function runTests() {
    console.log('%c--- DIEREN REDDERS TESTS ---', 'font-weight: bold; font-size: 14px; color: blue;');
    
    // Test het wisselen van dieren
    testAnimalSwitching();
    
    // Test waterdetectie
    testWaterDetection();
    
    // Test platformcollisies
    testPlatformCollisions();
}

// Test voor het wisselen van dieren
function testAnimalSwitching() {
    console.log('%cTest: Animal Switching', 'font-weight: bold; color: #333;');
    
    // Sla originele toetsenstatus op
    const originalKeysState = Object.assign({}, keys);
    
    // Sla de originele diertypes op
    const player1OriginalAnimal = player1.animalType;
    const player2OriginalAnimal = player2.animalType;
    
    console.log(`Initiële situatie: Speler 1 is ${player1.animalType}, Speler 2 is ${player2.animalType}`);
    
    // Test Speler 1 wissel (F indrukken)
    console.log('Test: Speler 1 wisselt van dier (F-toets)');
    keys['f'] = true;
    player1.update(player2, [], [], []);
    keys['f'] = false;
    player1.update(player2, [], [], []); // Laat de toets los
    
    const player1FirstSwitch = player1.animalType;
    console.log(`Na eerste wissel: Speler 1 is nu ${player1.animalType}`);
    
    if (player1FirstSwitch !== player1OriginalAnimal) {
        console.log('%c✓ Speler 1 eerste wissel succesvol', 'color: green');
    } else {
        console.log('%c✗ Speler 1 wissel mislukt', 'color: red');
    }
    
    // Test Speler 1 terugwissel (F opnieuw indrukken)
    console.log('Test: Speler 1 wisselt terug (F-toets opnieuw)');
    keys['f'] = true;
    player1.update(player2, [], [], []);
    keys['f'] = false;
    player1.update(player2, [], [], []); // Laat de toets los
    
    const player1SecondSwitch = player1.animalType;
    console.log(`Na tweede wissel: Speler 1 is nu ${player1.animalType}`);
    
    if (player1SecondSwitch === player1OriginalAnimal) {
        console.log('%c✓ Speler 1 tweede wissel succesvol (terug naar origineel)', 'color: green');
    } else {
        console.log('%c✗ Speler 1 terugwissel mislukt', 'color: red');
    }
    
    // Test Speler 2 wissel (Shift indrukken)
    console.log('Test: Speler 2 wisselt van dier (Shift-toets)');
    
    // Reset speler 1 naar originele staat voor deze test
    player1.animalType = player1OriginalAnimal;
    player1.updateAnimalProperties();
    
    keys['Shift'] = true;
    player2.update(player1, [], [], []);
    keys['Shift'] = false;
    player2.update(player1, [], [], []); // Laat de toets los
    
    const player2FirstSwitch = player2.animalType;
    console.log(`Na eerste wissel: Speler 2 is nu ${player2.animalType}`);
    
    if (player2FirstSwitch !== player2OriginalAnimal) {
        console.log('%c✓ Speler 2 eerste wissel succesvol', 'color: green');
    } else {
        console.log('%c✗ Speler 2 wissel mislukt', 'color: red');
    }
    
    // Test Speler 2 terugwissel (Shift opnieuw indrukken)
    console.log('Test: Speler 2 wisselt terug (Shift-toets opnieuw)');
    keys['Shift'] = true;
    player2.update(player1, [], [], []);
    keys['Shift'] = false;
    player2.update(player1, [], [], []); // Laat de toets los
    
    const player2SecondSwitch = player2.animalType;
    console.log(`Na tweede wissel: Speler 2 is nu ${player2.animalType}`);
    
    if (player2SecondSwitch === player2OriginalAnimal) {
        console.log('%c✓ Speler 2 tweede wissel succesvol (terug naar origineel)', 'color: green');
    } else {
        console.log('%c✗ Speler 2 terugwissel mislukt', 'color: red');
    }
    
    // Test dat spelers niet hetzelfde dier kunnen zijn
    console.log('Test: Spelers kunnen niet hetzelfde dier zijn');
    
    // Zet beide spelers naar verschillende dieren
    player1.animalType = "SQUIRREL";
    player1.updateAnimalProperties();
    player2.animalType = "TURTLE";
    player2.updateAnimalProperties();
    
    console.log(`Situatie: Speler 1 is ${player1.animalType}, Speler 2 is ${player2.animalType}`);
    
    // Probeer speler 2 naar hetzelfde dier als speler 1 te wisselen
    keys['Shift'] = true;
    player2.update(player1, [], [], []);
    keys['Shift'] = false;
    player2.update(player1, [], [], []); // Laat de toets los
    
    if (player1.animalType !== player2.animalType) {
        console.log('%c✓ Bescherming tegen dezelfde dieren werkt', 'color: green');
    } else {
        console.log('%c✗ Spelers kunnen hetzelfde dier zijn', 'color: red');
    }
    
    // Herstel originele toetsenstatus
    Object.keys(originalKeysState).forEach(key => {
        keys[key] = originalKeysState[key];
    });
    
    // Herstel de originele diertypes
    player1.animalType = player1OriginalAnimal;
    player1.updateAnimalProperties();
    player2.animalType = player2OriginalAnimal;
    player2.updateAnimalProperties();
}

// Test voor waterdetectie
function testWaterDetection() {
    console.log('%cTest: Water Detection', 'font-weight: bold; color: #333;');
    
    // Maak een test-waterplatform
    const testWater = {
        x: 100,
        y: 300,
        width: 100,
        height: 50,
        type: "WATER"
    };
    
    // Test schildpad in water (zou moeten kunnen zwemmen)
    const originalPlayer2Animal = player2.animalType;
    player2.animalType = "TURTLE";
    player2.updateAnimalProperties();
    
    // Positioneer schildpad boven water
    player2.x = 120;
    player2.y = 280;
    
    // Simuleer botsingsdetectie
    if (player2.collidesWithPlatform(testWater)) {
        console.log('%c✓ Schildpad detecteert water correct', 'color: green');
    } else {
        console.log('%c✗ Probleem met waterdetectie voor schildpad', 'color: red');
    }
    
    // Test of de schildpad kan zwemmen
    const originalVelY = player2.velY;
    player2.velY = 5; // Beweging naar beneden
    
    // Simuleer update in water
    keys[player2.controls.up] = true; // Simuleer omhoog zwemmen
    player2.update(player1, [testWater], [], []);
    
    if (player2.velY < 0) {
        console.log('%c✓ Schildpad kan omhoog zwemmen in water', 'color: green');
    } else {
        console.log('%c✗ Schildpad kan niet omhoog zwemmen in water', 'color: red');
    }
    
    keys[player2.controls.up] = false;
    
    // Herstel originele staat
    player2.animalType = originalPlayer2Animal;
    player2.updateAnimalProperties();
    player2.velY = originalVelY;
}

// Test voor platformcollisies
function testPlatformCollisions() {
    console.log('%cTest: Platform Collisions', 'font-weight: bold; color: #333;');
    
    // Maak een testplatform
    const testPlatform = {
        x: 100,
        y: 300,
        width: 100,
        height: 20,
        type: "NORMAL"
    };
    
    // Test speler op platform (moet bovenop staan)
    player1.x = 120;
    player1.y = 275;
    player1.velY = 5; // Beweging naar beneden
    
    if (player1.collidesWithPlatform(testPlatform)) {
        console.log('%c✓ Platformdetectie werkt correct', 'color: green');
        
        // Simuleer update op platform
        const originalY = player1.y;
        player1.update(player2, [testPlatform], [], []);
        
        if (player1.y === testPlatform.y - player1.height && player1.velY === 0) {
            console.log('%c✓ Speler blijft correct op platform staan', 'color: green');
        } else {
            console.log('%c✗ Probleem met speler op platform plaatsen', 'color: red');
        }
        
        // Herstel positie
        player1.y = originalY;
    } else {
        console.log('%c✗ Probleem met platformdetectie', 'color: red');
    }
}