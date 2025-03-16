// game-core.js
// Bevat de kern functionaliteit van het spel: canvas setup, game loop, state management

// Canvas en context referenties (worden ingesteld vanuit game.js)

// Spelconstanten
const GRAVITY = 0.5;
const JUMP_POWER = -12;
let GROUND_LEVEL;
const BLOCK_SIZE = 40;
const MAX_FALL_SPEED = 10; // Maximale valsnelheid om door platforms vallen te voorkomen

// Level variabelen
let currentLevel = 0;
let levelCompleted = false;

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
    },
    CAT: {
        name: "Kat",
        color: "#888888", // Grijs
        width: 35,
        height: 30,
        jumpPower: -7,
        speed: 4,
        ability: "Klauwen voor aanvallen"
    }
};

// Helpers voor collision detection
function collidesWithObjects(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Reset het huidige level (na game over door puppy verlies)
function resetCurrentLevel() {
    // Deze functie zal worden geïmplementeerd in game.js
    // omdat deze toegang nodig heeft tot de spelers
}

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

// Update de editor link om terug te gaan naar hetzelfde level
function updateEditorLink() {
    const editorLink = document.getElementById('editor-link');
    if (editorLink) {
        editorLink.href = `editor.html#level=${gameCore.currentLevel}`;
    }
}

// Naar volgend level gaan
function nextLevel() {
    // Deze functie zal worden geïmplementeerd in game.js
    // omdat deze toegang nodig heeft tot de spelers
}

// Exporteer de benodigde functies en objecten
window.gameCore = {
    // Constants
    GRAVITY,
    JUMP_POWER,
    MAX_FALL_SPEED,
    BLOCK_SIZE,
    
    // State
    currentLevel,
    levelCompleted,
    gameState,
    animalTypes,
    
    // Functions
    getStartLevel,
    updateEditorLink,
    collidesWithObjects,
    
    // Canvas properties
    canvas: null,
    ctx: null,
    GROUND_LEVEL: null,
    
    // Functions that will be implemented elsewhere but exposed here
    nextLevel: null,
    resetCurrentLevel: null
};