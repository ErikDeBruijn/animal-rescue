// map.js - Logic for the world map selection screen

// Constants
const PLAYER_SPEED = 5;
const MAP_UPDATE_INTERVAL = 20; // milliseconds

// Map state
let mapState = {
    playerX: 100,
    playerY: 100,
    targetX: 100,
    targetY: 100,
    keys: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    totalScore: 0,
    completedLevels: [],
    currentLevel: 1, // Default to level 1
    unlockedLevels: [1], // Level 1 is always unlocked
    lastPlayedLevel: 1,
    levelNodes: []
};

// Initialize the map
function initMap() {
    // First ensure mapData exists
    if (!window.mapData) {
        console.error("Map data not loaded! Make sure map-data.js is included before map.js");
        return;
    }
    
    // Try to load map data if it exists
    Promise.resolve(window.mapData.loadMapData())
        .then(() => {
            // Load game progress from localStorage
            loadGameProgress();
            
            // Create the map elements
            createMapNodes();
            
            // Set up player character at the current/last played level
            setupPlayerCharacter();
            
            // Set up event listeners for keyboard controls
            setupControls();
            
            // Start the game loop
            startMapLoop();
        })
        .catch(error => {
            console.error("Error loading map data:", error);
            // Continue with default data if loading fails
            loadGameProgress();
            createMapNodes();
            setupPlayerCharacter();
            setupControls();
            startMapLoop();
        });
}

// Load game progress from localStorage
function loadGameProgress() {
    // Load completed levels
    const completedLevelsStr = localStorage.getItem('completedLevels');
    if (completedLevelsStr) {
        mapState.completedLevels = JSON.parse(completedLevelsStr);
    }
    
    // Load total score
    const totalScore = localStorage.getItem('totalScore');
    if (totalScore) {
        mapState.totalScore = parseInt(totalScore) || 0;
    }
    
    // Load last played level
    const lastPlayedLevel = localStorage.getItem('lastPlayedLevel');
    if (lastPlayedLevel) {
        mapState.lastPlayedLevel = parseInt(lastPlayedLevel) || 1;
        mapState.currentLevel = parseInt(lastPlayedLevel) || 1;
    }
    
    // Reset unlocked levels list and start with just level 1
    mapState.unlockedLevels = [1]; // Level 1 is always unlocked
    
    // Add all completed levels to unlocked levels
    mapState.completedLevels.forEach(level => {
        if (!mapState.unlockedLevels.includes(level)) {
            mapState.unlockedLevels.push(level);
        }
    });
    
    // Only unlock connected levels through proper progression
    let changed = true;
    while (changed) {
        changed = false;
        
        // For each path connection, check if the start level is unlocked or completed
        window.mapData.PATH_CONNECTIONS.forEach(([startLevel, endLevel, requiredLevel]) => {
            // To unlock a level:
            // 1. The start level must be unlocked or completed
            // 2. The required level must be completed
            if (mapState.unlockedLevels.includes(startLevel) && 
                mapState.completedLevels.includes(requiredLevel)) {
                
                // If endLevel isn't already unlocked, add it and mark as changed
                if (!mapState.unlockedLevels.includes(endLevel)) {
                    mapState.unlockedLevels.push(endLevel);
                    changed = true;
                    console.log(`Unlocked level ${endLevel} via path from ${startLevel}`);
                }
            }
        });
    }
    
    // Update score display
    updateScoreDisplay();
}

// Create level nodes and paths on the map
function createMapNodes() {
    const mapContainer = document.getElementById('map-container');
    
    // Clear existing nodes but preserve the background
    const mapBackground = mapContainer.querySelector('.map-background');
    mapContainer.innerHTML = '';
    mapContainer.appendChild(mapBackground);
    
    mapState.levelNodes = [];
    
    // Create a nodemap for quick lookup
    const nodeMap = {};
    window.mapData.LEVEL_POSITIONS.forEach(([x, y, level, gameType]) => {
        nodeMap[level] = { x, y, level, gameType };
    });
    
    // First, create paths between connected nodes based on PATH_CONNECTIONS
    window.mapData.PATH_CONNECTIONS.forEach(([startLevelNum, endLevelNum, requiredLevel]) => {
        const startNode = nodeMap[startLevelNum];
        const endNode = nodeMap[endLevelNum];
        
        if (!startNode || !endNode) {
            console.warn(`Missing nodes for path: ${startLevelNum} -> ${endLevelNum}`);
            return;
        }
        
        // Calculate path properties
        const x1 = startNode.x;
        const y1 = startNode.y;
        const x2 = endNode.x;
        const y2 = endNode.y;
        
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Create path element
        const path = document.createElement('div');
        path.className = 'level-path';
        
        // Set path status class based on progression:
        if (mapState.completedLevels.includes(startLevelNum)) {
            // Path from a completed level
            path.classList.add('path-completed');
        } else if (mapState.unlockedLevels.includes(startLevelNum)) {
            // Path from an unlocked but not completed level
            path.classList.add('path-available');
        } else {
            // Path is not yet available
            path.classList.add('path-locked');
        }
        
        // Position and rotate the path - center on both ends
        path.style.width = `${length}px`;
        path.style.left = `${x1}px`;
        path.style.top = `${y1}px`; // Center vertically (no extra offset)
        path.style.transformOrigin = 'center left';
        path.style.transform = `rotate(${angle}deg)`;
        
        // Store the level info in the path dataset
        path.dataset.startLevel = startLevelNum;
        path.dataset.endLevel = endLevelNum;
        path.dataset.requiredLevel = requiredLevel;
        
        mapContainer.appendChild(path);
    });
    
    // Then, create level nodes
    window.mapData.LEVEL_POSITIONS.forEach(([x, y, level, gameType]) => {
        // Create node element
        const node = document.createElement('div');
        node.className = 'level-node';
        
        // Set text content based on game type
        if (gameType === 'memoryGame') {
            node.textContent = 'M';
            node.classList.add('memory-level');
            node.title = `Memory Level ${level} (Optioneel)`;
            
            // Add card deck visuals for memory games
            const cardStack = document.createElement('div');
            cardStack.className = 'memory-card-stack';
            cardStack.style.left = `${x + 20}px`;
            cardStack.style.top = `${y - 35}px`;
            
            // Create 3 stacked cards
            for (let i = 0; i < 3; i++) {
                const card = document.createElement('div');
                card.className = 'memory-card-icon';
                card.style.left = `${i * 3}px`;
                card.style.top = `${-i * 3}px`;
                cardStack.appendChild(card);
            }
            
            mapContainer.appendChild(cardStack);
        } else if (level === 1) {
            // Special handling for Level 1 (START)
            node.textContent = ''; // Will be replaced by ::before content in CSS
            node.title = `Start het spel`;
        } else {
            node.textContent = level;
            node.title = `Level ${level}`;
        }
        
        node.id = `level-${level}`;
        node.dataset.level = level;
        node.dataset.gameType = gameType;
        
        // Position the node
        node.style.left = `${x - 25}px`; // Center horizontally
        node.style.top = `${y - 25}px`;  // Center vertically
        
        // Set appearance based on state
        if (mapState.completedLevels.includes(level)) {
            node.classList.add('level-completed');
            
            // Keep memory styling even when completed
            if (gameType === 'memoryGame') {
                node.classList.add('memory-level');
            }
        } else if (level === mapState.currentLevel) {
            node.classList.add('level-current');
            
            // Keep memory styling even when current
            if (gameType === 'memoryGame') {
                node.classList.add('memory-level');
            }
        } else if (mapState.unlockedLevels.includes(level)) {
            node.classList.add('level-unlocked');
            
            // Keep memory styling even when unlocked
            if (gameType === 'memoryGame') {
                node.classList.add('memory-level');
            }
        } else {
            node.classList.add('level-locked');
        }
        
        // Add click event for level selection
        node.addEventListener('click', function() {
            if (mapState.unlockedLevels.includes(level)) {
                selectLevel(level, gameType);
            } else {
                // If level is locked, inform the player
                const requiredPath = window.mapData.PATH_CONNECTIONS.find(([start, end]) => end === level);
                if (requiredPath) {
                    const requiredLevel = requiredPath[2];
                    alert(`Je moet eerst level ${requiredLevel} voltooien om dit level te ontgrendelen.`);
                } else {
                    alert('Dit level is nog niet beschikbaar.');
                }
            }
        });
        
        mapContainer.appendChild(node);
        mapState.levelNodes.push({ level, x, y, element: node, gameType });
    });
}

// Set up the player character on the map
function setupPlayerCharacter() {
    const playerChar = document.getElementById('player-character');
    
    // Find the node matching the current/last played level
    const currentNode = mapState.levelNodes.find(node => node.level === mapState.currentLevel);
    
    if (currentNode) {
        // Position player at the current level node
        mapState.playerX = currentNode.x;
        mapState.playerY = currentNode.y;
        mapState.targetX = currentNode.x;
        mapState.targetY = currentNode.y;
        
        // Update player position
        updatePlayerPosition();
    }
}

// Set up keyboard controls
function setupControls() {
    // Add keyboard event listeners
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                mapState.keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                mapState.keys.down = true;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                mapState.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                mapState.keys.right = true;
                break;
            case 'Enter':
            case ' ':
                // Check if player is over a level node and activate it
                checkLevelActivation();
                break;
        }
    });
    
    document.addEventListener('keyup', function(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                mapState.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                mapState.keys.down = false;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                mapState.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                mapState.keys.right = false;
                break;
        }
    });
}

// Start the map update loop
function startMapLoop() {
    setInterval(updateMap, MAP_UPDATE_INTERVAL);
}

// Update the map state
function updateMap() {
    // Update player position based on key input
    if (mapState.keys.up) {
        mapState.playerY -= PLAYER_SPEED;
    }
    if (mapState.keys.down) {
        mapState.playerY += PLAYER_SPEED;
    }
    if (mapState.keys.left) {
        mapState.playerX -= PLAYER_SPEED;
    }
    if (mapState.keys.right) {
        mapState.playerX += PLAYER_SPEED;
    }
    
    // Keep player within map bounds
    const mapContainer = document.getElementById('map-container');
    const mapWidth = mapContainer.clientWidth;
    const mapHeight = mapContainer.clientHeight;
    
    mapState.playerX = Math.max(15, Math.min(mapState.playerX, mapWidth - 15));
    mapState.playerY = Math.max(15, Math.min(mapState.playerY, mapHeight - 15));
    
    // Update player position on screen
    updatePlayerPosition();
    
    // Check if player is over a level node
    checkLevelProximity();
}

// Update player position on screen
function updatePlayerPosition() {
    const playerChar = document.getElementById('player-character');
    playerChar.style.left = `${mapState.playerX - 15}px`; // Center horizontally
    playerChar.style.top = `${mapState.playerY - 15}px`;  // Center vertically
}

// Check if player is close to a level node
function checkLevelProximity() {
    const ACTIVATION_DISTANCE = 30; // Distance in pixels to activate a node
    
    // Check each level node
    mapState.levelNodes.forEach(node => {
        const distance = Math.sqrt(
            Math.pow(mapState.playerX - node.x, 2) + 
            Math.pow(mapState.playerY - node.y, 2)
        );
        
        // If player is close to a node and it's unlocked, highlight it
        if (distance < ACTIVATION_DISTANCE && mapState.unlockedLevels.includes(node.level)) {
            node.element.style.transform = 'scale(1.2)';
        } else {
            node.element.style.transform = 'scale(1)';
        }
    });
}

// Check if player should activate a level
function checkLevelActivation() {
    const ACTIVATION_DISTANCE = 30; // Distance in pixels to activate a node
    
    // Find closest level node
    let closestNode = null;
    let closestDistance = Infinity;
    
    mapState.levelNodes.forEach(node => {
        const distance = Math.sqrt(
            Math.pow(mapState.playerX - node.x, 2) + 
            Math.pow(mapState.playerY - node.y, 2)
        );
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestNode = node;
        }
    });
    
    // If player is close enough to a node, check if it's unlocked
    if (closestNode && closestDistance < ACTIVATION_DISTANCE) {
        if (mapState.unlockedLevels.includes(closestNode.level)) {
            selectLevel(closestNode.level, closestNode.gameType);
        } else {
            // If level is locked, inform the player
            const requiredPath = window.mapData.PATH_CONNECTIONS.find(([start, end]) => end === closestNode.level);
            if (requiredPath) {
                const requiredLevel = requiredPath[2];
                alert(`Je moet eerst level ${requiredLevel} voltooien om dit level te ontgrendelen.`);
            } else {
                alert('Dit level is nog niet beschikbaar.');
            }
        }
    }
}

// Select and launch a level
function selectLevel(level, gameType) {
    // Store the selected level as the last played level
    localStorage.setItem('lastPlayedLevel', level.toString());
    
    // Redirect to the appropriate game
    if (gameType === 'animalRescue') {
        window.location.href = `index.html#level=${level}`;
    } else if (gameType === 'memoryGame') {
        // Direct redirect to memory game without confirmation
        window.location.href = `memory.html#level=${level}`;
    }
}

// Update the score display
function updateScoreDisplay() {
    const scoreElement = document.getElementById('total-score');
    scoreElement.textContent = `Totaal Score: ${mapState.totalScore}`;
}

// Create a popup to show level details when hovering over a node
function createLevelInfoPopup() {
    const popup = document.createElement('div');
    popup.id = 'level-info-popup';
    popup.style.position = 'absolute';
    popup.style.display = 'none';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    popup.style.color = 'white';
    popup.style.padding = '10px';
    popup.style.borderRadius = '5px';
    popup.style.zIndex = '100';
    popup.style.pointerEvents = 'none';
    document.getElementById('map-container').appendChild(popup);
    
    // Add event listeners to level nodes
    mapState.levelNodes.forEach(node => {
        node.element.addEventListener('mouseenter', function() {
            if (mapState.unlockedLevels.includes(node.level)) {
                // Only show details for unlocked levels
                const levelName = window.levels && window.levels[node.level - 1] ? 
                                  window.levels[node.level - 1].name : `Level ${node.level}`;
                                  
                popup.textContent = `${node.level}: ${levelName}`;
                popup.style.left = `${node.x + 30}px`;
                popup.style.top = `${node.y}px`;
                popup.style.display = 'block';
            }
        });
        
        node.element.addEventListener('mouseleave', function() {
            popup.style.display = 'none';
        });
    });
}

// Initialize the map when the DOM is loaded
document.addEventListener('DOMContentLoaded', initMap);

// Expose utilities for adding game completion in other files
window.mapUtils = {
    // Mark a level as completed and update storage
    markLevelCompleted: function(level, score) {
        // Add to completed levels if not already there
        if (!mapState.completedLevels.includes(level)) {
            mapState.completedLevels.push(level);
            localStorage.setItem('completedLevels', JSON.stringify(mapState.completedLevels));
            
            // Unlock next level
            if (!mapState.unlockedLevels.includes(level + 1)) {
                mapState.unlockedLevels.push(level + 1);
            }
        }
        
        // Update total score
        mapState.totalScore += score;
        localStorage.setItem('totalScore', mapState.totalScore.toString());
        
        // Update last played level
        localStorage.setItem('lastPlayedLevel', level.toString());
    }
};