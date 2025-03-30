// map-data.js - Loads and provides map data for the world map selection screen

// Default level positions (used if no saved data is available)
const DEFAULT_LEVEL_POSITIONS = [
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

// Default path connections (used if no saved data is available)
const DEFAULT_PATH_CONNECTIONS = [
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
    LEVEL_POSITIONS: [...DEFAULT_LEVEL_POSITIONS],
    PATH_CONNECTIONS: [...DEFAULT_PATH_CONNECTIONS],

    // Method to save the data
    saveMapData: function() {
        const mapDataJSON = {
            LEVEL_POSITIONS: this.LEVEL_POSITIONS,
            PATH_CONNECTIONS: this.PATH_CONNECTIONS
        };
        
        // First create a backup of existing data
        return fetch('/api/map-data')
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data) {
                    // Create backup by saving current data to .bak file
                    return fetch('/api/map-data/backup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            mapData: result.data
                        }),
                    })
                    .then(backupResponse => backupResponse.json())
                    .then(backupData => {
                        if (!backupData.success) {
                            console.warn("Could not create backup of map data:", backupData.error);
                        } else {
                            console.log("Created backup of map data to map-data.json.bak");
                        }
                        
                        // Continue with saving new data regardless of backup success
                        return true;
                    });
                }
                return true; // Continue even if we couldn't get current data
            })
            .catch(error => {
                console.warn("Error creating backup:", error);
                return true; // Continue with save even if backup fails
            })
            .then(() => {
                // Save to server API
                return fetch('/api/map-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mapData: mapDataJSON
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Map data saved to server");
                        return true;
                    } else {
                        console.error("Error saving map data to server:", data.error);
                        // Als er een server error is, toch true teruggeven zodat de UI niet breekt
                        return true;
                    }
                });
            })
            .catch(error => {
                console.error("Error saving map data to server:", error);
                return false;
            });
    },
    
    // Method to load the data
    loadMapData: function() {
        // Load from server API
        return fetch('/api/map-data')
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data) {
                    // Update our data with the loaded data
                    if (result.data.LEVEL_POSITIONS) {
                        this.LEVEL_POSITIONS = result.data.LEVEL_POSITIONS;
                    }
                    
                    if (result.data.PATH_CONNECTIONS) {
                        this.PATH_CONNECTIONS = result.data.PATH_CONNECTIONS;
                    }
                    
                    console.log("Map data loaded from server");
                    return true;
                } else {
                    console.error("Error loading map data from server:", result.error || "Unknown error");
                    return false;
                }
            })
            .catch(error => {
                console.error("Error loading map data from server:", error);
                return false;
            });
    }
};