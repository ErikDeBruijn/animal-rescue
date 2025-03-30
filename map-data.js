// map-data.js - Stores the map data for the world map selection screen

// Level node positions on the map
const LEVEL_POSITIONS = [
    // [x, y, level, gameType]
    [100, 100, 1, 'animalRescue'],
    [200, 150, 2, 'animalRescue'],
    [150, 250, 101, 'memoryGame'], // Memory game after level 2
    [300, 100, 3, 'animalRescue'],
    [400, 150, 4, 'animalRescue'],
    [350, 250, 102, 'memoryGame'], // Memory game after level 4
    [500, 100, 5, 'animalRescue'],
    [600, 150, 6, 'animalRescue'],
    [550, 250, 103, 'memoryGame'], // Memory game after level 6
    [700, 100, 7, 'animalRescue']
];

// Define path connections - which nodes are connected by paths
// Format: [startNode, endNode, required level to unlock]
const PATH_CONNECTIONS = [
    // Main path
    [1, 2, 1],
    [2, 3, 2],
    [3, 4, 3],
    [4, 5, 4],
    [5, 6, 5],
    [6, 7, 6],
    
    // Memory game branches
    [2, 101, 2], // Branch to memory game after level 2
    [4, 102, 4], // Branch to memory game after level 4
    [6, 103, 6]  // Branch to memory game after level 6
];

// Export the data to be used in other files
window.mapData = {
    LEVEL_POSITIONS,
    PATH_CONNECTIONS,

    // Method to save the data
    saveMapData: function() {
        const mapDataJSON = JSON.stringify({
            LEVEL_POSITIONS: this.LEVEL_POSITIONS,
            PATH_CONNECTIONS: this.PATH_CONNECTIONS
        }, null, 2);
        
        localStorage.setItem('mapData', mapDataJSON);
        console.log("Map data saved to localStorage");
        return mapDataJSON;
    },
    
    // Method to load the data
    loadMapData: function() {
        const savedData = localStorage.getItem('mapData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.LEVEL_POSITIONS = parsedData.LEVEL_POSITIONS || this.LEVEL_POSITIONS;
                this.PATH_CONNECTIONS = parsedData.PATH_CONNECTIONS || this.PATH_CONNECTIONS;
                console.log("Map data loaded from localStorage");
                return true;
            } catch (e) {
                console.error("Error parsing saved map data:", e);
                return false;
            }
        }
        return false;
    }
};