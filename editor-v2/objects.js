// Dieren Redders - Level Editor (Modular) - Objects Module
// Handles all object manipulation (create, delete, find, etc.)

// Add to the global editor namespace
window.editor = window.editor || {};

// Find an object at the given position
editor.findObjectAtPosition = function(x, y) {
    const level = editor.state.editingLevel;
    if (!level) return null;
    
    // Check start positions
    for (let i = 0; i < level.startPositions.length; i++) {
        const pos = level.startPositions[i];
        // For start positions, create a wider hitbox that represents the arrow
        const arrowWidth = 30;
        const arrowHeight = 30;
        
        if (x >= pos.x - arrowWidth/2 && x <= pos.x + arrowWidth/2 &&
            y >= pos.y - arrowHeight && y <= pos.y) {
            return {
                object: pos,
                type: 'startPos',
                index: i
            };
        }
    }
    
    // Check puppy
    if (level.puppy) {
        const puppy = level.puppy;
        if (x >= puppy.x && x <= puppy.x + puppy.width &&
            y >= puppy.y && y <= puppy.y + puppy.height) {
            return {
                object: puppy,
                type: 'puppy',
                index: 0
            };
        }
    }
    
    // Check collectibles (smallest objects first)
    if (level.collectibles) {
        for (let i = 0; i < level.collectibles.length; i++) {
            const collectible = level.collectibles[i];
            if (x >= collectible.x && x <= collectible.x + collectible.width &&
                y >= collectible.y && y <= collectible.y + collectible.height) {
                return {
                    object: collectible,
                    type: 'collectible',
                    index: i
                };
            }
        }
    }
    
    // Check enemies
    if (level.enemies) {
        for (let i = 0; i < level.enemies.length; i++) {
            const enemy = level.enemies[i];
            if (x >= enemy.x && x <= enemy.x + enemy.width &&
                y >= enemy.y && y <= enemy.y + enemy.height) {
                return {
                    object: enemy,
                    type: 'enemy',
                    index: i
                };
            }
        }
    }
    
    // Check traps
    if (level.traps) {
        for (let i = 0; i < level.traps.length; i++) {
            const trap = level.traps[i];
            if (x >= trap.x && x <= trap.x + trap.width &&
                y >= trap.y && y <= trap.y + trap.height) {
                return {
                    object: trap,
                    type: 'trap',
                    index: i
                };
            }
        }
    }
    
    // Check platforms (largest objects, check last)
    if (level.platforms) {
        for (let i = 0; i < level.platforms.length; i++) {
            const platform = level.platforms[i];
            if (x >= platform.x && x <= platform.x + platform.width &&
                y >= platform.y && y <= platform.y + platform.height) {
                return {
                    object: platform,
                    type: 'platform',
                    index: i
                };
            }
        }
    }
    
    // No object found
    return null;
};

// Check if the cursor is on a resize handle
editor.checkResizeHandles = function(x, y) {
    if (!editor.state.selectedObject) return null;
    
    const obj = editor.state.selectedObject;
    const handleSize = 10;
    
    // Helper function to check if the cursor is inside a handle
    function isInHandle(handleX, handleY) {
        return (
            x >= handleX - handleSize/2 && 
            x <= handleX + handleSize/2 && 
            y >= handleY - handleSize/2 && 
            y <= handleY + handleSize/2
        );
    }
    
    // Check corners
    if (isInHandle(obj.x, obj.y)) {
        return 'topLeft';
    } else if (isInHandle(obj.x + obj.width, obj.y)) {
        return 'topRight';
    } else if (isInHandle(obj.x, obj.y + obj.height)) {
        return 'bottomLeft';
    } else if (isInHandle(obj.x + obj.width, obj.y + obj.height)) {
        return 'bottomRight';
    }
    
    // Check sides
    if (isInHandle(obj.x + obj.width/2, obj.y)) {
        return 'top';
    } else if (isInHandle(obj.x + obj.width, obj.y + obj.height/2)) {
        return 'right';
    } else if (isInHandle(obj.x + obj.width/2, obj.y + obj.height)) {
        return 'bottom';
    } else if (isInHandle(obj.x, obj.y + obj.height/2)) {
        return 'left';
    }
    
    return null;
};

// Set the active object type and enter placement mode
editor.setActiveObjectType = function(type, subtype) {
    editor.state.selectedObjectType = { type, subtype };
    editor.enterPlacementMode(type, subtype);
};

// Create a new object of the given type
editor.createNewObject = function(type, subtype, x, y) {
    const blockSize = editor.BLOCK_SIZE;
    
    // Free positioning without grid snapping
    // Make sure the level exists
    if (!editor.state.editingLevel) return;
    
    // Center objects on the click position
    // Calculate object center offsets based on type
    let offsetX = 0, offsetY = 0;
    
    switch (type) {
        case 'platform':
            offsetX = blockSize * 1.5; // Half the default width
            offsetY = blockSize / 2;   // Half the default height
            break;
        case 'enemy':
            offsetX = blockSize / 2;
            offsetY = blockSize / 2;
            break;
        case 'trap':
            offsetX = blockSize;
            offsetY = blockSize / 4;
            break;
        case 'collectible':
            offsetX = blockSize / 4;
            offsetY = blockSize / 4;
            break;
        case 'puppy':
            offsetX = blockSize * 0.4;
            offsetY = blockSize * 0.3;
            break;
        case 'startPos':
            offsetX = 15;  // half of 30
            offsetY = 15;  // half of 30
            break;
    }
    
    // Position with cursor at center of object
    const centerX = x - offsetX;
    const centerY = y - offsetY;
    
    // Add object based on type
    switch (type) {
        case 'platform':
            // Create the new platform with the correct subtype
            const platform = {
                x: centerX,
                y: centerY,
                width: blockSize * 3,
                height: blockSize,
                type: subtype || 'NORMAL'
            };
            
            // If it's water, make it taller for better appearance
            if (subtype === 'WATER') {
                platform.height = blockSize * 2;
            }
            // If it's a laser, make it thinner
            if (subtype === 'LASER') {
                platform.height = blockSize / 4;
            }
            
            editor.state.editingLevel.platforms.push(platform);
            
            // Mark changes as unsaved
            editor.markUnsavedChanges();
            
            // Return the new object
            return platform;
            
        case 'enemy':
            // Create the new enemy with the correct subtype
            const enemy = {
                x: centerX,
                y: centerY,
                width: blockSize,
                height: blockSize,
                type: subtype || 'LION', // Default is lion
                patrolDistance: blockSize * 5 // Default patrol distance
            };
            
            editor.state.editingLevel.enemies.push(enemy);
            
            // Mark changes as unsaved
            editor.markUnsavedChanges();
            
            // Return the new object
            return enemy;
            
        case 'trap':
            // Create the new trap
            const trap = {
                x: centerX,
                y: centerY,
                width: blockSize * 2,
                height: blockSize / 2,
                type: 'SPIKES' // Only spikes for now
            };
            
            editor.state.editingLevel.traps.push(trap);
            
            // Mark changes as unsaved
            editor.markUnsavedChanges();
            
            // Return the new object
            return trap;
            
        case 'collectible':
            // Create the new collectible (star/pepper)
            const collectible = {
                x: centerX,
                y: centerY,
                width: blockSize / 2,
                height: blockSize / 2,
                type: subtype || 'STAR' // Default is star
            };
            
            editor.state.editingLevel.collectibles.push(collectible);
            
            // Mark changes as unsaved
            editor.markUnsavedChanges();
            
            // Return the new object
            return collectible;
            
        case 'puppy':
            // If there's already a puppy, move it to the new location
            if (editor.state.editingLevel.puppy) {
                editor.state.editingLevel.puppy.x = centerX;
                editor.state.editingLevel.puppy.y = centerY;
            } else {
                // Create a new puppy
                editor.state.editingLevel.puppy = {
                    x: centerX,
                    y: centerY,
                    width: blockSize * 0.8,
                    height: blockSize * 0.6,
                    saved: false
                };
            }
            
            // Mark changes as unsaved
            editor.markUnsavedChanges();
            
            // Return the new/updated object
            return editor.state.editingLevel.puppy;
            
        case 'startPos':
            // Check which start position to add/update
            const posIndex = parseInt(subtype) || 0;
            
            // If the position already exists, move it
            if (editor.state.editingLevel.startPositions && 
                editor.state.editingLevel.startPositions[posIndex]) {
                // Move the existing start position
                editor.state.editingLevel.startPositions[posIndex].x = centerX;
                editor.state.editingLevel.startPositions[posIndex].y = centerY;
            } else {
                // Make sure the array exists
                if (!editor.state.editingLevel.startPositions) {
                    editor.state.editingLevel.startPositions = [];
                }
                
                // Create a new start position
                editor.state.editingLevel.startPositions[posIndex] = {
                    x: centerX,
                    y: centerY
                };
            }
            
            // Mark changes as unsaved
            editor.markUnsavedChanges();
            
            // Return the new/updated object
            return editor.state.editingLevel.startPositions[posIndex];
    }
    
    return null;
};

// Delete the selected object
editor.deleteSelectedObject = function() {
    const state = editor.state;
    
    if (!state.selectedObject || !state.selectedObjectType) {
        return;
    }
    
    const type = state.selectedObjectType.type;
    const index = state.selectedObjectType.index;
    
    // Remove the object based on type
    switch(type) {
        case 'platform':
            state.editingLevel.platforms.splice(index, 1);
            break;
        case 'enemy':
            state.editingLevel.enemies.splice(index, 1);
            break;
        case 'trap':
            state.editingLevel.traps.splice(index, 1);
            break;
        case 'collectible':
            state.editingLevel.collectibles.splice(index, 1);
            break;
        case 'puppy':
            state.editingLevel.puppy = null;
            break;
        case 'startPos':
            // Start positions can't be deleted, only moved
            alert("Startposities kunnen niet worden verwijderd, alleen verplaatst.");
            return;
    }
    
    // Reset selection
    state.selectedObject = null;
    state.selectedObjectType = null;
    
    // Mark that there are changes
    editor.markUnsavedChanges();
    
    // Update UI
    editor.updatePropertiesPanel();
    editor.updateObjectList();
    
    // Render again
    editor.render();
};

// Update the selected object property
editor.updateSelectedObjectProperty = function(property, value) {
    const state = editor.state;
    
    if (!state.selectedObject || !state.selectedObjectType) {
        return;
    }
    
    // Update the property in the object
    state.selectedObject[property] = value;
    
    // Mark that there are changes
    editor.markUnsavedChanges();
    
    // Update the object list and render again
    editor.updateObjectList();
    editor.render();
};

// Update the object list in the UI
editor.updateObjectList = function() {
    const listElement = document.getElementById('object-list');
    if (!listElement) return;
    
    // Clear the list
    listElement.innerHTML = '';
    
    // Check if a level is loaded
    if (!editor.state.editingLevel) return;
    
    // Add all objects to the list
    editor.addObjectsToList(listElement, 'platforms', 'Platforms');
    editor.addObjectsToList(listElement, 'enemies', 'Vijanden');
    editor.addObjectsToList(listElement, 'traps', 'Vallen');
    editor.addObjectsToList(listElement, 'collectibles', 'Collectibles');
    
    // Add puppy to the list if it exists
    if (editor.state.editingLevel.puppy) {
        const puppyItem = document.createElement('li');
        puppyItem.textContent = 'Puppy';
        puppyItem.classList.add('object-list-item');
        
        // Highlight the selected puppy
        if (editor.state.selectedObjectType && 
            editor.state.selectedObjectType.type === 'puppy') {
            puppyItem.classList.add('selected');
        }
        
        // Click behavior to select the puppy
        puppyItem.addEventListener('click', () => {
            editor.state.selectedObject = editor.state.editingLevel.puppy;
            editor.state.selectedObjectType = {
                type: 'puppy',
                index: 0
            };
            editor.setActiveTool('select');
            editor.updateObjectList();
            editor.updatePropertiesPanel();
            editor.render();
        });
        
        listElement.appendChild(puppyItem);
    }
    
    // Add start positions to the list
    if (editor.state.editingLevel.startPositions) {
        const startPosCategory = document.createElement('div');
        startPosCategory.classList.add('object-category');
        startPosCategory.textContent = 'Startposities';
        listElement.appendChild(startPosCategory);
        
        editor.state.editingLevel.startPositions.forEach((pos, index) => {
            const startPosItem = document.createElement('li');
            startPosItem.textContent = `Startpositie ${index + 1}`;
            startPosItem.classList.add('object-list-item');
            
            // Highlight the selected start position
            if (editor.state.selectedObjectType && 
                editor.state.selectedObjectType.type === 'startPos' && 
                editor.state.selectedObjectType.index === index) {
                startPosItem.classList.add('selected');
            }
            
            // Click behavior to select the start position
            startPosItem.addEventListener('click', () => {
                editor.state.selectedObject = pos;
                editor.state.selectedObjectType = {
                    type: 'startPos',
                    index: index
                };
                editor.setActiveTool('select');
                editor.updateObjectList();
                editor.updatePropertiesPanel();
                editor.render();
            });
            
            listElement.appendChild(startPosItem);
        });
    }
};

// Helper function to add objects to the list
editor.addObjectsToList = function(listElement, arrayName, categoryName) {
    const objects = editor.state.editingLevel[arrayName];
    if (!objects || objects.length === 0) return;
    
    // Add category title
    const categoryElement = document.createElement('div');
    categoryElement.classList.add('object-category');
    categoryElement.textContent = categoryName;
    listElement.appendChild(categoryElement);
    
    // Add each object
    objects.forEach((obj, index) => {
        const objectItem = document.createElement('li');
        objectItem.classList.add('object-list-item');
        
        // Determine the name of the object
        let name;
        if (obj.type) {
            name = `${obj.type} (${index + 1})`;
        } else {
            name = `${arrayName.slice(0, -1)} ${index + 1}`;
        }
        objectItem.textContent = name;
        
        // Highlight the selected object
        if (editor.state.selectedObjectType && 
            editor.state.selectedObjectType.type === arrayName.slice(0, -1) && 
            editor.state.selectedObjectType.index === index) {
            objectItem.classList.add('selected');
        }
        
        // Click behavior to select the object
        objectItem.addEventListener('click', () => {
            editor.state.selectedObject = obj;
            editor.state.selectedObjectType = {
                type: arrayName.slice(0, -1), // Remove the 's' at the end
                index: index
            };
            editor.setActiveTool('select');
            editor.updateObjectList();
            editor.updatePropertiesPanel();
            editor.render();
        });
        
        listElement.appendChild(objectItem);
    });
};