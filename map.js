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
    levelNodes: [],
    walkableMask: {
        points: [],  // Will be loaded from server
        loaded: false
    }
};

// Initialize the world map when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing world map...");
    
    // Check for player character element
    const playerChar = document.getElementById('player-character');
    if (!playerChar) {
        console.log("Creating player character element...");
        const newPlayerChar = document.createElement('div');
        newPlayerChar.id = 'player-character';
        document.getElementById('map-container').appendChild(newPlayerChar);
    }
    
    // Check if we need to show map transition message
    if (localStorage.getItem('showMapTransitionMessage') === 'true') {
        showMapTransitionMessage();
        localStorage.removeItem('showMapTransitionMessage');
    }
    
    // Initialize map
    initMap();
});

// Show a message when transitioning to a new map
function showMapTransitionMessage() {
    // Create the message element
    const messageContainer = document.createElement('div');
    messageContainer.className = 'map-transition-message';
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '50%';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translate(-50%, -50%)';
    messageContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    messageContainer.style.color = 'white';
    messageContainer.style.padding = '20px 30px';
    messageContainer.style.borderRadius = '10px';
    messageContainer.style.boxShadow = '0 0 20px gold';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.zIndex = '1000';
    messageContainer.style.maxWidth = '80%';
    
    // Add the content
    messageContainer.innerHTML = `
        <h2 style="color: gold; margin-top: 0;">Gefeliciteerd!</h2>
        <p>Je hebt alle levels op de eerste kaart voltooid!</p>
        <p>Nu wordt een nieuwe kaart met nieuwe avonturen ontgrendeld.</p>
        <button id="continue-btn" style="background-color: gold; border: none; padding: 10px 20px; margin-top: 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">Doorgaan naar nieuwe kaart</button>
    `;
    
    // Add to the document
    document.body.appendChild(messageContainer);
    
    // Add event listener to the continue button
    document.getElementById('continue-btn').addEventListener('click', function() {
        document.body.removeChild(messageContainer);
    });
}

// Initialize the map
function initMap() {
    // First ensure mapData exists
    if (!window.mapData) {
        console.error("Map data not loaded! Make sure map-data.js is included before map.js");
        return;
    }
    
    // Function to update the map background
    function updateMapBackground() {
        const mapBackground = document.querySelector('.map-background');
        if (mapBackground) {
            const backgroundImage = window.mapData.getCurrentMapBackground();
            mapBackground.style.backgroundImage = `url('${backgroundImage}')`;
        } else {
            // Apply to the container if there's no dedicated background element
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                const backgroundImage = window.mapData.getCurrentMapBackground();
                mapContainer.style.backgroundImage = `url('${backgroundImage}')`;
            }
        }
    }
    
    // Function to check if player completed all levels and should advance to next map
    window.checkForMapAdvancement = function(completedLevel) {
        console.log("Checking for map advancement with completed level:", completedLevel);
        if (window.mapData && window.mapData.maps) {
            // Check if we're on map1 and need to advance to map2
            if (window.mapData.currentMap === 'map1') {
                // Get all animal rescue (non-memory game) levels on the current map
                const animalRescueLevels = window.mapData.LEVEL_POSITIONS
                    .filter(node => node[3] === 'animalRescue')
                    .map(node => node[2]);
                
                console.log("Animal rescue levels on current map:", animalRescueLevels);
                
                // Load completed levels
                const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
                console.log("Already completed levels:", completedLevels);
                
                // Find the highest level number on the current map to determine the final level
                const highestLevel = Math.max(...animalRescueLevels);
                console.log("Highest level on map:", highestLevel);
                
                // Important: The completedLevel is 1-based (from the game's perspective)
                // So we need to check if it matches the highest level number
                console.log("Checking if", completedLevel, "===", highestLevel);
                
                // If we've completed the highest level on this map, switch to map2
                // This ensures we only transition after the intended final level
                if (parseInt(completedLevel) === parseInt(highestLevel)) {
                    console.log("TRANSITIONING TO MAP 2!");
                    window.mapData.switchMap('map2');
                    window.mapData.saveMapData();
                    
                    // Add a flag that we should show the map transition message
                    localStorage.setItem('showMapTransitionMessage', 'true');
                    console.log("Set showMapTransitionMessage flag");
                }
            }
        }
    }
    
    // Try to load map data if it exists
    Promise.resolve(window.mapData.loadMapData())
        .then(() => {
            // Update the map background based on the current map
            updateMapBackground();
            
            // Load walkable area data
            loadWalkableAreaData()
                .then(() => {
                    console.log("Walkable area data loaded successfully");
                    
                    // Check for debug parameter to visualize walkable areas
                    if (window.location.hash.includes('debug=walkable')) {
                        console.log("Debug mode: Visualizing walkable areas");
                        setTimeout(() => visualizeWalkableArea(), 1000);
                    }
                })
                .catch(error => {
                    console.warn("Error loading walkable area data:", error);
                    console.log("Movement will not be restricted to walkable areas");
                });
            
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

// Load walkable area data from the server
function loadWalkableAreaData() {
    return fetch('/api/walkable-area')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.walkableData && data.walkableData.points) {
                // Store the walkable mask points in mapState
                mapState.walkableMask.points = data.walkableData.points;
                mapState.walkableMask.loaded = true;
                console.log(`Loaded ${mapState.walkableMask.points.length} walkable area points`);
                
                // Optionally visualize the walkable area (commented out for now)
                // visualizeWalkableArea();
                
                return true;
            } else {
                console.warn("No walkable area data found or invalid format");
                return false;
            }
        })
        .catch(error => {
            console.error("Error fetching walkable area data:", error);
            
            // Try to load from localStorage as fallback
            const localData = localStorage.getItem('walkableAreaData');
            if (localData) {
                try {
                    const walkableData = JSON.parse(localData);
                    if (walkableData && walkableData.points) {
                        mapState.walkableMask.points = walkableData.points;
                        mapState.walkableMask.loaded = true;
                        console.log(`Loaded ${mapState.walkableMask.points.length} walkable area points from localStorage`);
                        return true;
                    }
                } catch (e) {
                    console.error('Error parsing walkable area data from localStorage:', e);
                }
            }
            
            return false;
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
    
    // Make sure mapData.PATH_CONNECTIONS exists
    if (window.mapData && window.mapData.PATH_CONNECTIONS && Array.isArray(window.mapData.PATH_CONNECTIONS)) {
        while (changed) {
            changed = false;
            
            // For each path connection, check if the start level is unlocked or completed
            window.mapData.PATH_CONNECTIONS.forEach(connection => {
                // Make sure connection is valid
                if (!Array.isArray(connection) || connection.length < 3) return;
                
                const [startLevel, endLevel, requiredLevel] = connection;
                
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
    } else {
        console.warn("PATH_CONNECTIONS not available, cannot process level unlocks");
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
            
            // Add card deck visuals for memory games - adjusted for smaller level nodes
            const cardStack = document.createElement('div');
            cardStack.className = 'memory-card-stack';
            cardStack.style.left = `${x + 15}px`;
            cardStack.style.top = `${y - 25}px`;
            
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
        
        // Position the node - adjusted for smaller size (35px instead of 50px)
        node.style.left = `${x - 17.5}px`; // Center horizontally
        node.style.top = `${y - 17.5}px`;  // Center vertically
        
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
    // Make sure player character element exists
    let playerChar = document.getElementById('player-character');
    const mapContainer = document.getElementById('map-container');
    
    if (!mapContainer) {
        console.error("Map container not found during player character setup!");
        return;
    }
    
    // If it doesn't exist, create it
    if (!playerChar) {
        playerChar = document.createElement('div');
        playerChar.id = 'player-character';
        mapContainer.appendChild(playerChar);
        console.log("Created player character element");
    }
    
    // Ensure the player character has proper styling
    playerChar.style.display = 'block';
    playerChar.style.backgroundColor = '#FF4500'; // Bright orange
    playerChar.style.width = '30px';
    playerChar.style.height = '30px';
    playerChar.style.borderRadius = '50%';
    playerChar.style.position = 'absolute';
    playerChar.style.zIndex = '1000';
    playerChar.style.boxShadow = '0 0 20px #FF4500, 0 0 10px #FFF, 0 0 30px rgba(255, 69, 0, 0.8)';
    playerChar.style.border = '2px solid white';
    playerChar.style.pointerEvents = 'none';
    
    // Find the node matching the current/last played level
    const currentNode = mapState.levelNodes.find(node => node.level === mapState.currentLevel);
    
    if (currentNode) {
        // Position player at the current level node
        mapState.playerX = currentNode.x;
        mapState.playerY = currentNode.y;
        mapState.targetX = currentNode.x;
        mapState.targetY = currentNode.y;
        
        console.log(`Positioning player at level ${mapState.currentLevel}: (${currentNode.x}, ${currentNode.y})`);
        
        // Check if this position is within a walkable area
        if (mapState.walkableMask.loaded && !isPointInWalkableArea(currentNode.x, currentNode.y)) {
            console.warn("Warning: Current level node is not in a walkable area!");
        }
        
        // Update player position
        updatePlayerPosition();
    } else {
        // If no current node found, set default position
        console.log("No current node found, using default position");
        
        // Try to find a valid walkable area if possible
        if (mapState.walkableMask.loaded && mapState.walkableMask.points.length > 0) {
            // Use the first walkable point as a fallback
            const firstPoint = mapState.walkableMask.points[0];
            mapState.playerX = firstPoint.x;
            mapState.playerY = firstPoint.y;
            console.log(`Using first walkable point as fallback: (${firstPoint.x}, ${firstPoint.y})`);
        } else {
            // Default fallback position
            mapState.playerX = 100;
            mapState.playerY = 100;
        }
        
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
    console.log("Starting map update loop...");
    if (window.mapUpdateInterval) {
        clearInterval(window.mapUpdateInterval);
    }
    window.mapUpdateInterval = setInterval(updateMap, MAP_UPDATE_INTERVAL);
    console.log("Map update loop started with interval:", MAP_UPDATE_INTERVAL);
    
    // Force an immediate update
    updateMap();
}

// Check if a point is within the walkable area
function isPointInWalkableArea(x, y) {
    // If walkable mask isn't loaded, allow movement everywhere
    if (!mapState.walkableMask.loaded || mapState.walkableMask.points.length === 0) {
        return true;
    }
    
    // Check if the point is inside any of the walkable area circles
    return mapState.walkableMask.points.some(point => {
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= point.size / 2;
    });
}

// Update the map state
function updateMap() {
    // Check if player character exists
    const playerChar = document.getElementById('player-character');
    if (!playerChar) {
        console.warn("Player character not found in update loop, creating...");
        const newPlayerChar = document.createElement('div');
        newPlayerChar.id = 'player-character';
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.appendChild(newPlayerChar);
        } else {
            console.error("Map container not found!");
            return;
        }
    }
    
    // Store current position to restore if movement is invalid
    const oldX = mapState.playerX;
    const oldY = mapState.playerY;
    
    // Calculate new position based on key input
    let newX = oldX;
    let newY = oldY;
    
    if (mapState.keys.up) {
        newY -= PLAYER_SPEED;
    }
    if (mapState.keys.down) {
        newY += PLAYER_SPEED;
    }
    if (mapState.keys.left) {
        newX -= PLAYER_SPEED;
    }
    if (mapState.keys.right) {
        newX += PLAYER_SPEED;
    }
    
    // Keep player within map bounds
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        const mapWidth = mapContainer.clientWidth;
        const mapHeight = mapContainer.clientHeight;
        
        newX = Math.max(15, Math.min(newX, mapWidth - 15));
        newY = Math.max(15, Math.min(newY, mapHeight - 15));
    }
    
    // Check if the new position is valid (within walkable area)
    if (isPointInWalkableArea(newX, newY)) {
        // Update position if valid
        mapState.playerX = newX;
        mapState.playerY = newY;
    } else {
        // Try horizontal and vertical movements separately
        if (isPointInWalkableArea(newX, oldY)) {
            mapState.playerX = newX;
        } else if (isPointInWalkableArea(oldX, newY)) {
            mapState.playerY = newY;
        }
        // Otherwise, stay at the old position
    }
    
    // Update player position on screen
    updatePlayerPosition();
    
    // Check if player is over a level node
    checkLevelProximity();
}

// Update player position on screen
function updatePlayerPosition() {
    const playerChar = document.getElementById('player-character');
    if (!playerChar) {
        console.warn("Player character element not found in updatePlayerPosition");
        
        // Try to recreate the player character
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            const newPlayerChar = document.createElement('div');
            newPlayerChar.id = 'player-character';
            newPlayerChar.style.display = 'block';
            newPlayerChar.style.backgroundColor = '#FF4500'; // Bright orange
            newPlayerChar.style.width = '30px';
            newPlayerChar.style.height = '30px';
            newPlayerChar.style.borderRadius = '50%';
            newPlayerChar.style.position = 'absolute';
            newPlayerChar.style.zIndex = '1000';
            newPlayerChar.style.boxShadow = '0 0 20px #FF4500, 0 0 10px #FFF, 0 0 30px rgba(255, 69, 0, 0.8)';
            newPlayerChar.style.border = '2px solid white';
            newPlayerChar.style.pointerEvents = 'none';
            mapContainer.appendChild(newPlayerChar);
            
            // Update position on the newly created element
            newPlayerChar.style.left = `${mapState.playerX - 15}px`; // Center horizontally
            newPlayerChar.style.top = `${mapState.playerY - 15}px`;  // Center vertically
            
            console.log("Recreated player character during position update");
        } else {
            console.error("Map container not found, cannot recreate player character");
        }
        return;
    }
    
    // Update the position of the existing player character
    playerChar.style.left = `${mapState.playerX - 15}px`; // Center horizontally
    playerChar.style.top = `${mapState.playerY - 15}px`;  // Center vertically
}

// Check if player is close to a level node
function checkLevelProximity() {
    const ACTIVATION_DISTANCE = 30; // Distance in pixels to activate a node
    
    if (!mapState.levelNodes || !Array.isArray(mapState.levelNodes)) {
        console.warn("Level nodes array is not available");
        return;
    }
    
    // Check each level node
    mapState.levelNodes.forEach(node => {
        if (!node || !node.element) return;
        
        try {
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
        } catch (error) {
            console.error(`Error processing node ${node.level}:`, error);
        }
    });
}

// Function to visualize the walkable area (for debugging)
function visualizeWalkableArea() {
    // Only visualize if walkable mask is loaded
    if (!mapState.walkableMask.loaded || mapState.walkableMask.points.length === 0) {
        console.log("No walkable area to visualize");
        return;
    }

    // Check if we already have a visualization container
    let visualContainer = document.getElementById('walkable-area-visualization');
    if (visualContainer) {
        // Clear existing visualization
        visualContainer.innerHTML = '';
    } else {
        // Create new visualization container
        visualContainer = document.createElement('div');
        visualContainer.id = 'walkable-area-visualization';
        visualContainer.style.position = 'absolute';
        visualContainer.style.top = '0';
        visualContainer.style.left = '0';
        visualContainer.style.width = '100%';
        visualContainer.style.height = '100%';
        visualContainer.style.pointerEvents = 'none';
        visualContainer.style.zIndex = '5'; // Below player but above most other elements
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.appendChild(visualContainer);
        }
    }

    // Add visual elements for each walkable point
    mapState.walkableMask.points.forEach(point => {
        const pointElement = document.createElement('div');
        pointElement.className = 'walkable-area-visual';
        pointElement.style.position = 'absolute';
        pointElement.style.left = `${point.x - point.size/2}px`;
        pointElement.style.top = `${point.y - point.size/2}px`;
        pointElement.style.width = `${point.size}px`;
        pointElement.style.height = `${point.size}px`;
        pointElement.style.backgroundColor = 'rgba(0, 255, 0, 0.1)'; // Very light green
        pointElement.style.borderRadius = '50%';
        pointElement.style.pointerEvents = 'none';
        visualContainer.appendChild(pointElement);
    });

    console.log(`Visualized ${mapState.walkableMask.points.length} walkable area points`);
}

// Check if player should activate a level
function checkLevelActivation() {
    const ACTIVATION_DISTANCE = 30; // Distance in pixels to activate a node
    
    // Make sure level nodes exist
    if (!mapState.levelNodes || !Array.isArray(mapState.levelNodes) || mapState.levelNodes.length === 0) {
        console.warn("No level nodes available for activation check");
        return;
    }
    
    // Find closest level node
    let closestNode = null;
    let closestDistance = Infinity;
    
    try {
        mapState.levelNodes.forEach(node => {
            if (!node) return;
            
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
                if (window.mapData && window.mapData.PATH_CONNECTIONS) {
                    const requiredPath = window.mapData.PATH_CONNECTIONS.find(([start, end]) => end === closestNode.level);
                    if (requiredPath) {
                        const requiredLevel = requiredPath[2];
                        alert(`Je moet eerst level ${requiredLevel} voltooien om dit level te ontgrendelen.`);
                    } else {
                        alert('Dit level is nog niet beschikbaar.');
                    }
                } else {
                    alert('Dit level is nog niet beschikbaar.');
                }
            }
        }
    } catch (error) {
        console.error("Error in checkLevelActivation:", error);
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
    if (scoreElement) {
        scoreElement.textContent = `Totaal Score: ${mapState.totalScore}`;
    } else {
        console.warn("Score element not found, creating...");
        
        // Try to create the score element if it doesn't exist
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            const newScoreElement = document.createElement('div');
            newScoreElement.id = 'total-score';
            newScoreElement.className = 'score-display';
            newScoreElement.textContent = `Totaal Score: ${mapState.totalScore}`;
            
            // Style it properly
            newScoreElement.style.position = 'fixed';
            newScoreElement.style.top = '70px';
            newScoreElement.style.right = '10px';
            newScoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            newScoreElement.style.color = 'white';
            newScoreElement.style.padding = '5px 15px';
            newScoreElement.style.borderRadius = '20px';
            newScoreElement.style.fontWeight = 'bold';
            newScoreElement.style.zIndex = '1000';
            
            // Add to map container
            mapContainer.appendChild(newScoreElement);
            console.log("Created score display element");
        } else {
            console.error("Map container not found, cannot create score element");
        }
    }
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

// Debug function to test map transition
window.testMapTransition = function() {
    console.log("Testing map transition manually");
    localStorage.setItem('showMapTransitionMessage', 'true');
    showMapTransitionMessage();
};

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