// memory.js - Logic for the memory card game

// Game state
let memoryState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    score: 0,
    moves: 0,
    level: 0,
    gameActive: false,
    timeElapsed: 0, // Time elapsed in seconds
    timer: null,
    gameStartTime: 0,
    difficulty: 'easy', // 'easy', 'medium', 'hard'
    selectedCardIndex: -1, // Index of the currently selected card (-1 means no selection)
    gridDimensions: { rows: 0, cols: 0 } // Dimensions of the grid for keyboard navigation
};

// Animal emoji for the cards
// Checklist of animals we want to include:
// - [x] Kat (🐱)
// - [x] Hond (🐶)
// - [x] Konijn (🐰)
// - [x] Cavia (Guinea pig - using 🐹)
// - [x] Hamster (🐹)
// - [x] Papagaai (using 🦜)
// - [x] Schildpad (🐢)
// - [x] Eekhoorn (Squirrel - using 🐿️)
// - [x] Eenhoorn (🦄)
// - [x] Mol (Mole - removed as too similar to mouse)
// - [x] Leeuw (🦁)
// - [x] Draak (Dragon - using 🐉)
// - [x] Kip (🐔)
// - [x] Geit (Goat - using 🐐)
// - [x] Koe (🐮)
// - [x] Paard (🐴)
// - [x] Vis (Fish - using 🐠)
// - [x] Schaap (Sheep - using 🐑)
// - [x] Vos (Fox - using 🦊)
// - [x] Slang (Snake - using 🐍)
// - [x] Vogelspin (Spider - using 🕷️)
// - [x] Kikker (Frog - using 🐸)
// - [x] Muis (Mouse - using 🐭)

const animalEmojis = [
    '🐱', '🐶', '🐰', '🐹', '🦜', '🐢', '🐿️', '🦄',
    '🦁', '🐉', '🐔', '🐐', '🐮', '🐴', '🐠',
    '🐑', '🦊', '🐍', '🕷️', '🐸', '🦇', '🦉', '🐭'
];

// Get level from URL hash
function getLevelFromHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#level=')) {
        return parseInt(hash.substring(7));
    }
    return 101; // Default to level 101 if not specified
}

// Initialize memory game
function initMemoryGame() {
    // Get level from URL hash
    const level = getLevelFromHash();
    memoryState.level = level;
    
    // Set difficulty based on level
    setDifficultyByLevel(level);
    
    // Update level display
    document.getElementById('memory-level').textContent = `Level ${level}`;
    
    // Create game grid
    createGrid();
    
    // Add event listener for restart button
    document.getElementById('continue-button').addEventListener('click', function() {
        window.location.href = 'map.html';
    });
    
    // Add keyboard event listeners
    setupKeyboardControls();
    
    // Start game after a slight delay
    setTimeout(startGame, 800);
}

// Set difficulty based on level
function setDifficultyByLevel(level) {
    if (level === 101) {
        memoryState.difficulty = 'beginner'; // 3x3 grid, very easy
    } else if (level === 102) {
        memoryState.difficulty = 'easy';     // 4x4 grid
    } else if (level === 103) {
        memoryState.difficulty = 'medium';   // 5x4 grid
    }
    
    // Initialize time display
    memoryState.timeElapsed = 0;
    document.getElementById('memory-time').textContent = `Tijd: ${formatTime(memoryState.timeElapsed)}`;
}

// Create the game grid and cards
function createGrid() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    // Determine grid size based on difficulty
    let rows, cols, totalCards;
    
    switch (memoryState.difficulty) {
        case 'beginner':
            rows = 3;
            cols = 3;
            grid.className = 'grid-3x3';
            break;
        case 'easy':
            rows = 4;
            cols = 4;
            grid.className = 'grid-4x4';
            break;
        case 'medium':
            rows = 4;
            cols = 5;
            grid.className = 'grid-5x4';
            break;
        case 'hard':
            rows = 5;
            cols = 6;
            grid.className = 'grid-6x5';
            break;
        default:
            rows = 3;
            cols = 3;
            grid.className = 'grid-3x3';
    }
    
    // Store grid dimensions for keyboard navigation
    memoryState.gridDimensions.rows = rows;
    memoryState.gridDimensions.cols = cols;
    
    totalCards = rows * cols;
    
    // Make sure we have an even number of cards
    if (totalCards % 2 !== 0) {
        totalCards--;
    }
    
    memoryState.totalPairs = totalCards / 2;
    
    // Create shuffled array of card values (pairs of animal emojis)
    const cardValues = [];
    for (let i = 0; i < totalCards / 2; i++) {
        const animal = animalEmojis[i];
        cardValues.push(animal, animal); // Add each animal twice
    }
    
    // Shuffle the cards
    shuffle(cardValues);
    
    // Create cards and add to grid
    for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.value = cardValues[i];
        card.dataset.index = i;
        
        // Create inner container for 3D effect
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        // Create card front (facing down - the ? side)
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.innerHTML = '<span>?</span>';
        
        // Create card back (animal emoji side)
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.innerHTML = `<div class="card-content">${cardValues[i]}</div>`;
        
        // Build the card structure
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        // Add click event
        card.addEventListener('click', handleCardClick);
        
        // Add to grid
        grid.appendChild(card);
        
        // Store card reference
        memoryState.cards.push(card);
    }
}

// Start the game
function startGame() {
    memoryState.gameActive = true;
    memoryState.score = 0;
    memoryState.moves = 0;
    memoryState.matchedPairs = 0;
    memoryState.flippedCards = [];
    memoryState.gameStartTime = Date.now();
    memoryState.selectedCardIndex = 0; // Start with the first card selected
    
    // Reset score and moves display
    updateScoreDisplay();
    updateMovesDisplay();
    
    // Update selection visual
    updateCardSelection();
    
    // Start timer
    memoryState.timer = setInterval(updateTimer, 1000);
}

// Format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update the timer display
function updateTimer() {
    memoryState.timeElapsed++;
    document.getElementById('memory-time').textContent = `Tijd: ${formatTime(memoryState.timeElapsed)}`;
}

// Handle card click
function handleCardClick(event) {
    // Ignore clicks if game is not active
    if (!memoryState.gameActive) return;
    
    const card = this;
    
    // Ignore clicks on already flipped or matched cards
    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    // Ignore clicks if two cards are already flipped and being checked
    if (memoryState.flippedCards.length >= 2) {
        return;
    }
    
    // Flip the card - use a slight delay to ensure proper rendering
    setTimeout(() => {
        card.classList.add('flipped');
    }, 50);
    
    // Play flip sound
    playSound('blip-8-bit.mp3');
    
    // Add to flipped cards
    memoryState.flippedCards.push(card);
    
    // If we have 2 flipped cards, check for a match
    if (memoryState.flippedCards.length === 2) {
        memoryState.moves++;
        updateMovesDisplay();
        
        // Get the two flipped cards
        const card1 = memoryState.flippedCards[0];
        const card2 = memoryState.flippedCards[1];
        
        // Check if they match
        if (card1.dataset.value === card2.dataset.value) {
            // Match found
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                
                // Play match sound
                playSound('powerup-8-bit.mp3');
                
                // Clear flipped cards array
                memoryState.flippedCards = [];
                
                // Update score and matched pairs
                memoryState.score += 10;
                memoryState.matchedPairs++;
                updateScoreDisplay();
                
                // Check if all pairs are matched
                if (memoryState.matchedPairs >= memoryState.totalPairs) {
                    endGame(true);
                }
            }, 500);
        } else {
            // No match, flip cards back
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                
                // Play unmatch sound
                playSound('bubble-pop.mp3');
                
                // Clear flipped cards array
                memoryState.flippedCards = [];
            }, 1000);
        }
    }
}

// End the game
function endGame(won) {
    memoryState.gameActive = false;
    clearInterval(memoryState.timer);
    
    if (won) {
        // Calculate final score based on moves
        // Lower moves = higher score, with a base of points for completing
        const baseScore = 100; // Base score for completing
        const movesEfficiency = Math.max(0, 100 - (memoryState.moves - memoryState.totalPairs) * 5);
        const finalScore = baseScore + movesEfficiency;
        
        memoryState.score = Math.max(20, finalScore); // Minimum score of 20 points
        
        // Add completion time to the score display
        const completionTime = formatTime(memoryState.timeElapsed);
        document.getElementById('final-score').textContent = `${memoryState.score} (Tijd: ${completionTime})`;
        document.getElementById('level-complete-message').style.display = 'block';
        
        // Play victory sound
        playSound('level-up-8-bit.mp3');
        
        // Save completion to localStorage
        saveGameProgress();
    }
}

// Save game progress to localStorage
function saveGameProgress() {
    // Get current level
    const level = memoryState.level;
    
    console.log(`Saving memory game level ${level} completion with score ${memoryState.score}`);
    
    // Save completion to localStorage through mapUtils if available
    if (window.mapUtils && window.mapUtils.markLevelCompleted) {
        window.mapUtils.markLevelCompleted(level, memoryState.score);
    } else {
        // Fallback if mapUtils is not available
        console.log("mapUtils not available, using direct localStorage saving");
        
        // Add to completed levels
        let completedLevels = [];
        const savedLevels = localStorage.getItem('completedLevels');
        if (savedLevels) {
            completedLevels = JSON.parse(savedLevels);
        }
        
        if (!completedLevels.includes(level)) {
            completedLevels.push(level);
            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
            console.log(`Added level ${level} to completed levels: ${completedLevels.join(', ')}`);
        }
        
        // Update total score
        let totalScore = 0;
        const savedScore = localStorage.getItem('totalScore');
        if (savedScore) {
            totalScore = parseInt(savedScore);
        }
        
        totalScore += memoryState.score;
        localStorage.setItem('totalScore', totalScore.toString());
        console.log(`Updated total score to ${totalScore}`);
        
        // Set last played level
        localStorage.setItem('lastPlayedLevel', level.toString());
    }
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('memory-score').textContent = `Score: ${memoryState.score}`;
}

// Update moves display
function updateMovesDisplay() {
    document.getElementById('memory-moves').textContent = `Zetten: ${memoryState.moves}`;
}

// This function is now replaced by the one below

// Fisher-Yates shuffle algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Setup keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', function(event) {
        // Ignore keyboard input if game is not active
        if (!memoryState.gameActive) return;
        
        // Get current grid position
        const currentIndex = memoryState.selectedCardIndex;
        const { rows, cols } = memoryState.gridDimensions;
        
        let row = Math.floor(currentIndex / cols);
        let col = currentIndex % cols;
        let newRow = row;
        let newCol = col;
        
        // Handle navigation keys
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newRow = Math.min(rows - 1, row + 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newCol = Math.min(cols - 1, col + 1);
                break;
            case ' ':
            case 'Enter':
                // Select/flip the current card
                if (memoryState.selectedCardIndex >= 0 && memoryState.selectedCardIndex < memoryState.cards.length) {
                    const cardToFlip = memoryState.cards[memoryState.selectedCardIndex];
                    
                    // Only trigger click if the card is not already flipped or matched
                    if (!cardToFlip.classList.contains('flipped') && !cardToFlip.classList.contains('matched')) {
                        // Simulate a click on the card
                        cardToFlip.click();
                    }
                }
                return; // Exit the function early
            default:
                return; // Exit if not a relevant key
        }
        
        // Calculate new index based on grid position
        const newIndex = newRow * cols + newCol;
        
        // Only update if there's been a change and the new index is valid
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < memoryState.cards.length) {
            memoryState.selectedCardIndex = newIndex;
            updateCardSelection();
            
            // Play sound for navigation
            playSound('blip-8-bit.mp3', 0.2); // Lower volume for navigation sounds
        }
    });
}

// Update the visual selection of cards
function updateCardSelection() {
    // Remove selection class from all cards
    memoryState.cards.forEach(card => {
        card.classList.remove('keyboard-selected');
    });
    
    // Add selection class to the selected card
    if (memoryState.selectedCardIndex >= 0 && memoryState.selectedCardIndex < memoryState.cards.length) {
        memoryState.cards[memoryState.selectedCardIndex].classList.add('keyboard-selected');
    }
}

// Play a sound effect with optional volume control
function playSound(soundFile, volume = 0.5) {
    if (window.gameAudio && window.gameAudio.playSound) {
        window.gameAudio.playSound(soundFile, volume);
    } else {
        // Fallback if gameAudio is not available
        const audio = new Audio(`sounds/${soundFile}`);
        audio.volume = volume;
        audio.play().catch(error => console.error('Sound playback failed:', error));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initMemoryGame);