// map-data.js - Loads and provides map data for the world map selection screens

// Available maps configuration
const AVAILABLE_MAPS = [
    {
        id: 'map1',
        name: 'Eilandenavontuur',
        background: 'adventure-map-background.jpg',
        description: 'De eerste avonturenkaart met eilanden en rivieren'
    },
    {
        id: 'map2',
        name: 'Dromenland',
        background: 'map-dromenland.jpg',
        description: 'Een magische kaart in het land van dromen'
    }
];

// Default level positions for map 1 (loaded from map-data.json or fallback to these)
const DEFAULT_LEVEL_POSITIONS_MAP1 = [
    // [x, y, level, gameType]
    [96.20001220703125, 856.1999969482422, 1, 'animalRescue'],
    [261, 745, 2, 'animalRescue'],
    [401.08123779296875, 649.0812377929688, 101, 'memoryGame'],
    [170, 671, 3, 'animalRescue'],
    [188.5, 583.5, 4, 'animalRescue'],
    [122.19061279296875, 556.1906127929688, 102, 'memoryGame'],
    [227.0059814453125, 479.0059814453125, 5, 'animalRescue'],
    [299.75, 421.75, 6, 'animalRescue'],
    [25, 411.92498779296875, 103, 'memoryGame'],
    [337.25, 369.25, 7, 'animalRescue'],
    [377.75, 337.75, 8, 'animalRescue'],
    [439.25, 346.25, 9, 'animalRescue'],
    [487.19061279296875, 258.19061279296875, 104, 'memoryGame'],
    [528.75, 363.75, 10, 'animalRescue'],
    [663.25, 332.25, 11, 'animalRescue'],
    [850.034423828125, 257.03436279296875, 105, 'memoryGame'],
    [914.5, 352.5, 12, 'animalRescue'],
    [919.549072265625, 431.549072265625, 13, 'animalRescue'],
    [896.015625, 523.015625, 14, 'animalRescue'],
    [878.796875, 596.796875, 15, 'animalRescue'],
    [909, 685, 16, 'animalRescue'],
    [997, 794, 17, 'animalRescue'],
    [862, 893, 18, 'animalRescue'],
    [674.25, 774.25, 19, 'animalRescue'],
    [828.25, 700.25, 20, 'animalRescue'],
    [764.643798828125, 607.6437377929688, 106, 'memoryGame'],
    [708.75, 613.75, 21, 'animalRescue'],
    [696.75, 548.75, 22, 'animalRescue'],
    [593.5, 574.5, 23, 'animalRescue']
];

// Default path connections for map 1 (loaded from map-data.json or fallback to these)
const DEFAULT_PATH_CONNECTIONS_MAP1 = [
    [1, 2, 1],
    [2, 3, 2],
    [3, 4, 3],
    [4, 5, 4],
    [5, 6, 5],
    [6, 7, 6],
    [2, 101, 2],
    [4, 102, 4],
    [6, 103, 6],
    [7, 8, 7],
    [8, 9, 8],
    [9, 104, 9],
    [9, 10, 9],
    [10, 11, 10],
    [11, 105, 11],
    [11, 12, 11],
    [12, 13, 12],
    [13, 14, 13],
    [14, 15, 14],
    [15, 16, 15],
    [16, 17, 16],
    [17, 18, 17],
    [18, 19, 18],
    [19, 20, 19],
    [20, 106, 20],
    [20, 21, 20],
    [21, 22, 21],
    [22, 23, 22]
];

// Default level positions for map 2 (used if no saved data is available)
const DEFAULT_LEVEL_POSITIONS_MAP2 = [
    // [x, y, level, gameType]
    [100, 100, 50, 'animalRescue'],  // Start with level 50 for map 2
    [200, 150, 51, 'animalRescue'],
    [300, 200, 150, 'memoryGame'],  // Memory games on map 2 start at 150
    [400, 100, 52, 'animalRescue'],
    [500, 150, 53, 'animalRescue'],
    [450, 250, 151, 'memoryGame']
];

// Default path connections for map 2 (used if no saved data is available)
const DEFAULT_PATH_CONNECTIONS_MAP2 = [
    // Main path
    [50, 51, 50],
    [51, 52, 51],
    [52, 53, 52],
    
    // Memory game branches
    [51, 150, 51], // Branch to memory game after level 51
    [52, 151, 52]  // Branch to memory game after level 52
];

// Default map data structure (used if no saved data is available)
const DEFAULT_MAP_DATA = {
    currentMap: 'map1',
    maps: {
        'map1': {
            LEVEL_POSITIONS: [...DEFAULT_LEVEL_POSITIONS_MAP1],
            PATH_CONNECTIONS: [...DEFAULT_PATH_CONNECTIONS_MAP1]
        },
        'map2': {
            LEVEL_POSITIONS: [...DEFAULT_LEVEL_POSITIONS_MAP2],
            PATH_CONNECTIONS: [...DEFAULT_PATH_CONNECTIONS_MAP2]
        }
    }
};

// Export the data to be used in other files
window.mapData = {
    AVAILABLE_MAPS: AVAILABLE_MAPS,
    // Check localStorage for saved currentMap, otherwise use default
    currentMap: localStorage.getItem('currentMap') || DEFAULT_MAP_DATA.currentMap,
    LEVEL_POSITIONS: [...DEFAULT_MAP_DATA.maps.map1.LEVEL_POSITIONS],
    PATH_CONNECTIONS: [...DEFAULT_MAP_DATA.maps.map1.PATH_CONNECTIONS],
    maps: JSON.parse(JSON.stringify(DEFAULT_MAP_DATA.maps)), // Deep copy

    // Get the available maps
    getAvailableMaps: function() {
        return this.AVAILABLE_MAPS;
    },
    
    // Switch to a different map
    switchMap: function(mapId) {
        if (this.maps[mapId]) {
            // Store the current map data before switching
            this.maps[this.currentMap] = {
                LEVEL_POSITIONS: [...this.LEVEL_POSITIONS],
                PATH_CONNECTIONS: [...this.PATH_CONNECTIONS]
            };
            
            // Switch to the new map
            this.currentMap = mapId;
            this.LEVEL_POSITIONS = [...this.maps[mapId].LEVEL_POSITIONS];
            this.PATH_CONNECTIONS = [...this.maps[mapId].PATH_CONNECTIONS];
            
            // Save the current map to localStorage so it persists across page reloads
            localStorage.setItem('currentMap', mapId);
            
            // If we're on the map page, update the background
            if (typeof updateMapBackground === 'function') {
                updateMapBackground();
            }
            
            // Return true to indicate successful switch
            return true;
        }
        return false; // Map not found
    },
    
    // Get the background image for the current map
    getCurrentMapBackground: function() {
        const mapInfo = this.AVAILABLE_MAPS.find(map => map.id === this.currentMap);
        return mapInfo ? mapInfo.background : 'adventure-map-background.jpg'; // Default if not found
    },
    
    // Method to save the data
    saveMapData: function() {
        // Save current map data to the maps object
        this.maps[this.currentMap] = {
            LEVEL_POSITIONS: [...this.LEVEL_POSITIONS],
            PATH_CONNECTIONS: [...this.PATH_CONNECTIONS]
        };
        
        // IMPORTANT: The server expects the format with LEVEL_POSITIONS and PATH_CONNECTIONS directly
        // We need to make sure these fields are at the top level of the object
        const mapDataJSON = {
            // These fields must be present for server validation
            LEVEL_POSITIONS: this.LEVEL_POSITIONS,
            PATH_CONNECTIONS: this.PATH_CONNECTIONS,
            // Also include new data structure for future-proofing the format
            currentMap: this.currentMap,
            maps: this.maps
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
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}, text: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        console.log("Map data saved to server successfully");
                        return true;
                    } else {
                        console.error("Error saving map data to server:", data.error);
                        alert("Error saving map data: " + data.error);
                        // Return true to prevent UI from breaking
                        return true;
                    }
                })
                .catch(error => {
                    console.error("Error saving map data to server:", error);
                    alert("Error saving map data: " + error.message);
                    return false;
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
                    // Check if we have the new format with maps structure
                    if (result.data.maps && result.data.currentMap) {
                        console.log("Loading new multi-map format data");
                        this.maps = result.data.maps;
                        this.currentMap = result.data.currentMap;
                        
                        // Load the current map data
                        if (this.maps[this.currentMap]) {
                            if (this.maps[this.currentMap].LEVEL_POSITIONS) {
                                this.LEVEL_POSITIONS = [...this.maps[this.currentMap].LEVEL_POSITIONS];
                            }
                            
                            if (this.maps[this.currentMap].PATH_CONNECTIONS) {
                                this.PATH_CONNECTIONS = [...this.maps[this.currentMap].PATH_CONNECTIONS];
                            }
                        }
                    } 
                    // Otherwise, load the legacy format (direct LEVEL_POSITIONS and PATH_CONNECTIONS)
                    else {
                        console.log("Loading legacy format map data");
                        
                        // Update our data with the loaded data
                        if (result.data.LEVEL_POSITIONS) {
                            this.LEVEL_POSITIONS = [...result.data.LEVEL_POSITIONS];
                            // Also update the map1 data
                            this.maps['map1'].LEVEL_POSITIONS = [...result.data.LEVEL_POSITIONS];
                        }
                        
                        if (result.data.PATH_CONNECTIONS) {
                            this.PATH_CONNECTIONS = [...result.data.PATH_CONNECTIONS];
                            // Also update the map1 data
                            this.maps['map1'].PATH_CONNECTIONS = [...result.data.PATH_CONNECTIONS];
                        }
                        
                        // Set current map to map1 for legacy data unless we have a stored map
                        const storedMap = localStorage.getItem('currentMap');
                        if (storedMap && this.maps[storedMap]) {
                            this.currentMap = storedMap;
                            // Make sure we load the correct map data
                            if (this.maps[this.currentMap]) {
                                this.LEVEL_POSITIONS = [...this.maps[this.currentMap].LEVEL_POSITIONS];
                                this.PATH_CONNECTIONS = [...this.maps[this.currentMap].PATH_CONNECTIONS];
                            }
                        } else {
                            this.currentMap = 'map1';
                        }
                    }
                    
                    console.log("Map data loaded from server");
                    
                    // If we're on the map page, make sure to update the background image
                    if (typeof updateMapBackground === 'function') {
                        updateMapBackground();
                    }
                    
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