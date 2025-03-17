// Dieren Redders - Level Editor (Modular) - Objects Module
// Handles object creation, manipulation, and deletion

// Add to the global editor namespace
window.editor = window.editor || {};

// Create a new object in the level
editor.createNewObject = function(type, subtype, x, y) {
    if (!editor.state.editingLevel) return null;
    
    // Create object based on type
    let newObject;
    const blockSize = editor.BLOCK_SIZE;
    
    // Free positioning without grid snapping
    
    // Create object based on type
    switch(type) {
        case 'platform':
            newObject = {
                x: x - blockSize * 1.5, // Center around cursor
                y: y - blockSize / 2,
                width: blockSize * 3,
                height: blockSize,
                platformType: subtype || 'NORMAL'
            };
            
            // Special dimensions for different platform types
            if (subtype === 'WATER') {
                newObject.height = blockSize * 2;
            } else if (subtype === 'LASER') {
                newObject.height = blockSize / 4;
            }
            
            // Add to level
            editor.state.editingLevel.platforms = editor.state.editingLevel.platforms || [];
            editor.state.editingLevel.platforms.push(newObject);
            break;
            
        case 'enemy':
            newObject = {
                x: x - blockSize / 2, // Center around cursor
                y: y - blockSize / 2,
                width: blockSize,
                height: blockSize,
                enemyType: subtype || 'LION',
                patrolDistance: blockSize * 3,
                speed: 1.0
            };
            
            // Add to level
            editor.state.editingLevel.enemies = editor.state.editingLevel.enemies || [];
            editor.state.editingLevel.enemies.push(newObject);
            break;
            
        case 'trap':
            newObject = {
                x: x - blockSize, // Center around cursor
                y: y - blockSize / 4,
                width: blockSize * 2,
                height: blockSize / 2,
                trapType: subtype || 'SPIKES'
            };
            
            // Add to level
            editor.state.editingLevel.traps = editor.state.editingLevel.traps || [];
            editor.state.editingLevel.traps.push(newObject);
            break;
            
        case 'collectible':
            newObject = {
                x: x - blockSize / 4, // Center around cursor
                y: y - blockSize / 4,
                width: blockSize / 2,
                height: blockSize / 2,
                collectibleType: subtype || 'STAR'
            };
            
            // Add to level
            editor.state.editingLevel.collectibles = editor.state.editingLevel.collectibles || [];
            editor.state.editingLevel.collectibles.push(newObject);
            break;
            
        case 'puppy':
            // Can only have one puppy
            newObject = {
                x: x - blockSize * 0.4, // Center around cursor
                y: y - blockSize * 0.3,
                width: blockSize * 0.8,
                height: blockSize * 0.6
            };
            
            // Replace existing puppy
            editor.state.editingLevel.puppy = newObject;
            break;
            
        case 'startPos':
            // Convert to numeric index
            const index = parseInt(subtype) || 0;
            
            newObject = {
                x: x,
                y: y,
                radius: 15
            };
            
            // Ensure startPositions array exists
            editor.state.editingLevel.startPositions = editor.state.editingLevel.startPositions || [];
            
            // Update existing or add new
            if (index < editor.state.editingLevel.startPositions.length) {
                editor.state.editingLevel.startPositions[index] = newObject;
            } else {
                // Pad with null values if needed
                while (editor.state.editingLevel.startPositions.length < index) {
                    editor.state.editingLevel.startPositions.push({
                        x: 100,
                        y: editor.GROUND_LEVEL - 30,
                        radius: 15
                    });
                }
                editor.state.editingLevel.startPositions.push(newObject);
            }
            break;
    }
    
    // Mark that the level has unsaved changes
    editor.markUnsavedChanges();
    
    // Update object list
    editor.updateObjectList();
    
    return newObject;
};

// Find an object at a given position
editor.findObjectAtPosition = function(x, y) {
    const level = editor.state.editingLevel;
    if (!level) return null;
    
    // Check puppy first (always on top)
    if (level.puppy && this.isPointInObject(x, y, level.puppy)) {
        return {
            type: 'puppy',
            object: level.puppy
        };
    }
    
    // Check collectibles
    if (level.collectibles) {
        for (let i = level.collectibles.length - 1; i >= 0; i--) {
            if (this.isPointInObject(x, y, level.collectibles[i])) {
                return {
                    type: 'collectible',
                    index: i,
                    object: level.collectibles[i]
                };
            }
        }
    }
    
    // Check enemies
    if (level.enemies) {
        for (let i = level.enemies.length - 1; i >= 0; i--) {
            if (this.isPointInObject(x, y, level.enemies[i])) {
                return {
                    type: 'enemy',
                    index: i,
                    object: level.enemies[i]
                };
            }
        }
    }
    
    // Check traps
    if (level.traps) {
        for (let i = level.traps.length - 1; i >= 0; i--) {
            if (this.isPointInObject(x, y, level.traps[i])) {
                return {
                    type: 'trap',
                    index: i,
                    object: level.traps[i]
                };
            }
        }
    }
    
    // Check platforms
    if (level.platforms) {
        for (let i = level.platforms.length - 1; i >= 0; i--) {
            if (this.isPointInObject(x, y, level.platforms[i])) {
                return {
                    type: 'platform',
                    index: i,
                    object: level.platforms[i]
                };
            }
        }
    }
    
    // Check start positions
    if (level.startPositions) {
        for (let i = level.startPositions.length - 1; i >= 0; i--) {
            if (this.isPointInStartPosition(x, y, level.startPositions[i])) {
                return {
                    type: 'startPos',
                    index: i,
                    object: level.startPositions[i]
                };
            }
        }
    }
    
    return null;
};

// Check if a point is inside a rectangular object
editor.isPointInObject = function(x, y, obj) {
    // Ensure object has necessary properties
    if (!obj || obj.x === undefined || obj.y === undefined || 
        obj.width === undefined || obj.height === undefined) {
        return false;
    }
    
    return x >= obj.x && x <= obj.x + obj.width &&
           y >= obj.y && y <= obj.y + obj.height;
};

// Check if a point is inside a start position (circular)
editor.isPointInStartPosition = function(x, y, pos) {
    // Ensure position object has necessary properties
    if (!pos || pos.x === undefined || pos.y === undefined) {
        return false;
    }
    
    // Get radius (default to 15 if not specified)
    const radius = pos.radius || 15;
    
    // Calculate distance from point to center
    const dx = x - pos.x;
    const dy = y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Point is inside if distance is less than radius
    return distance <= radius;
};

// Check if cursor is over a resize handle
editor.checkResizeHandles = function(x, y) {
    if (!editor.state.selectedObject) return null;
    
    const obj = editor.state.selectedObject;
    const handleSize = 8;
    
    // Define handle positions
    const handles = [
        { name: 'topLeft', x: obj.x - handleSize/2, y: obj.y - handleSize/2 },
        { name: 'top', x: obj.x + (obj.width || 30)/2 - handleSize/2, y: obj.y - handleSize/2 },
        { name: 'topRight', x: obj.x + (obj.width || 30) - handleSize/2, y: obj.y - handleSize/2 },
        { name: 'right', x: obj.x + (obj.width || 30) - handleSize/2, y: obj.y + (obj.height || 30)/2 - handleSize/2 },
        { name: 'bottomRight', x: obj.x + (obj.width || 30) - handleSize/2, y: obj.y + (obj.height || 30) - handleSize/2 },
        { name: 'bottom', x: obj.x + (obj.width || 30)/2 - handleSize/2, y: obj.y + (obj.height || 30) - handleSize/2 },
        { name: 'bottomLeft', x: obj.x - handleSize/2, y: obj.y + (obj.height || 30) - handleSize/2 },
        { name: 'left', x: obj.x - handleSize/2, y: obj.y + (obj.height || 30)/2 - handleSize/2 }
    ];
    
    // Check each handle
    for (const handle of handles) {
        if (x >= handle.x && x <= handle.x + handleSize &&
            y >= handle.y && y <= handle.y + handleSize) {
            return handle.name;
        }
    }
    
    return null;
};

// Delete the currently selected object
editor.deleteSelectedObject = function() {
    if (!editor.state.selectedObject || !editor.state.selectedObjectType) {
        console.log('No object selected to delete');
        return;
    }
    
    const type = editor.state.selectedObjectType.type;
    const index = editor.state.selectedObjectType.index;
    const level = editor.state.editingLevel;
    
    if (!level) return;
    
    console.log('Deleting object of type:', type, 'at index:', index);
    
    switch(type) {
        case 'platform':
            if (level.platforms && index !== undefined) {
                level.platforms.splice(index, 1);
            }
            break;
            
        case 'enemy':
            if (level.enemies && index !== undefined) {
                level.enemies.splice(index, 1);
            }
            break;
            
        case 'trap':
            if (level.traps && index !== undefined) {
                level.traps.splice(index, 1);
            }
            break;
            
        case 'collectible':
            if (level.collectibles && index !== undefined) {
                level.collectibles.splice(index, 1);
            }
            break;
            
        case 'puppy':
            // Don't completely remove puppy, just move it off-screen
            if (level.puppy) {
                level.puppy.x = -100;
                level.puppy.y = -100;
            }
            break;
            
        case 'startPos':
            // Don't completely remove start position, just move it off-screen
            if (level.startPositions && index !== undefined) {
                level.startPositions[index].x = -100;
                level.startPositions[index].y = -100;
            }
            break;
    }
    
    // Mark that the level has unsaved changes
    editor.markUnsavedChanges();
    
    // Clear selection
    editor.state.selectedObject = null;
    editor.state.selectedObjectType = null;
    
    // Update the properties panel
    editor.updatePropertiesPanel();
    
    // Update the object list
    editor.updateObjectList();
    
    // Render again
    editor.render();
};