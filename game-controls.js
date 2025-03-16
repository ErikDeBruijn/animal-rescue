// game-controls.js
// Bevat alle besturingsfuncties voor het spel: toetsenbord input, click handling, etc.

// Object om de status van toetsen bij te houden
const keys = {};

// Object om de status van klikken/touches bij te houden
const clicks = {
    active: false,
    x: 0,
    y: 0
};

// Toetsenbord event handlers
function handleKeyDown(e) {
    keys[e.key] = true;
    
    // Voorkom standaard gedrag van specifieke toetsen
    if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
    }
    
    // Verwerk spatie toets voor level resten/voltooien
    if (e.key === " ") {
        // Level voltooien als het level is afgerond
        if (gameCore.levelCompleted) {
            gameCore.nextLevel();
        }
        
        // Spel resetten als het game over is
        if (gameCore.gameState.gameOver) {
            gameCore.resetCurrentLevel();
        }
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

// Muisclick event handlers
function handleMouseDown(e) {
    clicks.active = true;
    clicks.x = e.clientX;
    clicks.y = e.clientY;
}

function handleMouseUp(e) {
    clicks.active = false;
}

function handleMouseMove(e) {
    if (clicks.active) {
        clicks.x = e.clientX;
        clicks.y = e.clientY;
    }
}

// Touch event handlers (voor mobiele apparaten)
function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        clicks.active = true;
        clicks.x = e.touches[0].clientX;
        clicks.y = e.touches[0].clientY;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    clicks.active = false;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0 && clicks.active) {
        clicks.x = e.touches[0].clientX;
        clicks.y = e.touches[0].clientY;
    }
}

// Eventlisteners instellen
function setupInputListeners() {
    // Toetsenbord
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Muis
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);
        
        // Touch (mobiel)
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
}

// Exporteer de benodigde functies
window.gameControls = {
    keys,
    clicks,
    setupInputListeners
};