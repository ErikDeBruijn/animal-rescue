// Dieren Redders - Level Editor (Modular) - Properties Module
// Handles the properties panel, object property updates and selection

// Add to the global editor namespace
window.editor = window.editor || {};

// Update the properties panel based on currently selected object
editor.updatePropertiesPanel = function() {
    // First, hide all property panels
    editor.hideAllPropertyPanels();
    
    // If no object is selected, return
    if (!editor.state.selectedObject) {
        return;
    }
    
    // Get the selected object and its type
    const object = editor.state.selectedObject;
    const objectType = editor.state.selectedObjectType;
    
    if (!objectType) return;
    
    // Based on the object type, show and configure the appropriate panel
    switch(objectType.type) {
        case 'platform':
            this.showPlatformProperties(object);
            break;
            
        case 'enemy':
            this.showEnemyProperties(object);
            break;
            
        case 'trap':
            this.showTrapProperties(object);
            break;
            
        case 'collectible':
            this.showCollectibleProperties(object);
            break;
            
        case 'puppy':
            this.showPuppyProperties(object);
            break;
            
        case 'startPos':
            this.showStartPosProperties(object, objectType.index);
            break;
    }
};

// Show platform properties in the panel
editor.showPlatformProperties = function(platform) {
    const panel = document.getElementById('platform-props');
    if (!panel) return;
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set the values
    const typeSelect = document.getElementById('platform-type');
    const widthInput = document.getElementById('platform-width');
    const heightInput = document.getElementById('platform-height');
    
    if (typeSelect) typeSelect.value = platform.platformType || 'NORMAL';
    if (widthInput) widthInput.value = Math.round(platform.width);
    if (heightInput) heightInput.value = Math.round(platform.height);
    
    // Add event listeners to update platform properties
    if (typeSelect) {
        typeSelect.onchange = function() {
            platform.platformType = typeSelect.value;
            editor.markUnsavedChanges();
            editor.render();
        };
    }
    
    if (widthInput) {
        widthInput.onchange = function() {
            platform.width = parseInt(widthInput.value);
            editor.markUnsavedChanges();
            editor.render();
        };
    }
    
    if (heightInput) {
        heightInput.onchange = function() {
            platform.height = parseInt(heightInput.value);
            editor.markUnsavedChanges();
            editor.render();
        };
    }
};

// Show enemy properties in the panel
editor.showEnemyProperties = function(enemy) {
    const panel = document.getElementById('enemy-props');
    if (!panel) return;
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set the values
    const typeSelect = document.getElementById('enemy-type');
    const patrolInput = document.getElementById('enemy-patrol');
    const speedInput = document.getElementById('enemy-speed');
    
    if (typeSelect) typeSelect.value = enemy.enemyType || 'LION';
    if (patrolInput) patrolInput.value = enemy.patrolDistance || 0;
    if (speedInput) speedInput.value = enemy.speed || 1.0;
    
    // Add event listeners to update enemy properties
    if (typeSelect) {
        typeSelect.onchange = function() {
            enemy.enemyType = typeSelect.value;
            editor.markUnsavedChanges();
            editor.render();
        };
    }
    
    if (patrolInput) {
        patrolInput.onchange = function() {
            enemy.patrolDistance = parseInt(patrolInput.value);
            editor.markUnsavedChanges();
            editor.render();
        };
    }
    
    if (speedInput) {
        speedInput.onchange = function() {
            enemy.speed = parseFloat(speedInput.value);
            editor.markUnsavedChanges();
            editor.render();
        };
    }
};

// Show trap properties in the panel
editor.showTrapProperties = function(trap) {
    const panel = document.getElementById('trap-props');
    if (!panel) return;
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set the values
    const typeSelect = document.getElementById('trap-type');
    const widthInput = document.getElementById('trap-width');
    const heightInput = document.getElementById('trap-height');
    
    if (typeSelect) typeSelect.value = trap.trapType || 'SPIKES';
    if (widthInput) widthInput.value = Math.round(trap.width);
    if (heightInput) heightInput.value = Math.round(trap.height);
    
    // Add event listeners to update trap properties
    if (typeSelect) {
        typeSelect.onchange = function() {
            trap.trapType = typeSelect.value;
            editor.markUnsavedChanges();
            editor.render();
        };
    }
    
    if (widthInput) {
        widthInput.onchange = function() {
            trap.width = parseInt(widthInput.value);
            editor.markUnsavedChanges();
            editor.render();
        };
    }
    
    if (heightInput) {
        heightInput.onchange = function() {
            trap.height = parseInt(heightInput.value);
            editor.markUnsavedChanges();
            editor.render();
        };
    }
};

// Show collectible properties in the panel
editor.showCollectibleProperties = function(collectible) {
    // We don't have a specific panel for collectibles yet
    // Use the object panel area to display some info
    const panel = document.getElementById('object-panel');
    if (!panel) return;
    
    // Show the panel
    panel.style.display = 'block';
};

// Show puppy properties in the panel
editor.showPuppyProperties = function(puppy) {
    // We don't have a specific panel for puppy yet
    // Use the object panel area to display some info
    const panel = document.getElementById('object-panel');
    if (!panel) return;
    
    // Show the panel
    panel.style.display = 'block';
};

// Show start position properties in the panel
editor.showStartPosProperties = function(startPos, index) {
    // We don't have a specific panel for start positions yet
    // Use the object panel area to display some info
    const panel = document.getElementById('object-panel');
    if (!panel) return;
    
    // Show the panel
    panel.style.display = 'block';
};

// Update the object list in the sidebar
editor.updateObjectList = function() {
    const objectList = document.getElementById('object-list');
    if (!objectList) return;
    
    // Clear the list
    objectList.innerHTML = '';
    
    // Get level data
    const level = editor.state.editingLevel;
    if (!level) return;
    
    // Create a list item for puppy
    if (level.puppy) {
        const puppyItem = document.createElement('div');
        puppyItem.className = 'object-list-item';
        puppyItem.textContent = 'Puppy';
        puppyItem.addEventListener('click', function() {
            editor.state.selectedObject = level.puppy;
            editor.state.selectedObjectType = { type: 'puppy' };
            editor.updatePropertiesPanel();
            editor.render();
        });
        objectList.appendChild(puppyItem);
    }
    
    // Create list items for platforms
    if (level.platforms) {
        level.platforms.forEach((platform, index) => {
            const platformItem = document.createElement('div');
            platformItem.className = 'object-list-item';
            platformItem.textContent = `Platform ${index + 1} (${platform.platformType || 'NORMAL'})`;
            platformItem.addEventListener('click', function() {
                editor.state.selectedObject = platform;
                editor.state.selectedObjectType = { 
                    type: 'platform',
                    index: index
                };
                editor.updatePropertiesPanel();
                editor.render();
            });
            objectList.appendChild(platformItem);
        });
    }
    
    // Create list items for enemies
    if (level.enemies) {
        level.enemies.forEach((enemy, index) => {
            const enemyItem = document.createElement('div');
            enemyItem.className = 'object-list-item';
            enemyItem.textContent = `Vijand ${index + 1} (${enemy.enemyType || 'LION'})`;
            enemyItem.addEventListener('click', function() {
                editor.state.selectedObject = enemy;
                editor.state.selectedObjectType = { 
                    type: 'enemy',
                    index: index
                };
                editor.updatePropertiesPanel();
                editor.render();
            });
            objectList.appendChild(enemyItem);
        });
    }
    
    // Create list items for traps
    if (level.traps) {
        level.traps.forEach((trap, index) => {
            const trapItem = document.createElement('div');
            trapItem.className = 'object-list-item';
            trapItem.textContent = `Val ${index + 1} (${trap.trapType || 'SPIKES'})`;
            trapItem.addEventListener('click', function() {
                editor.state.selectedObject = trap;
                editor.state.selectedObjectType = { 
                    type: 'trap',
                    index: index
                };
                editor.updatePropertiesPanel();
                editor.render();
            });
            objectList.appendChild(trapItem);
        });
    }
    
    // Create list items for collectibles
    if (level.collectibles) {
        level.collectibles.forEach((collectible, index) => {
            const collectibleItem = document.createElement('div');
            collectibleItem.className = 'object-list-item';
            collectibleItem.textContent = `Collectible ${index + 1} (${collectible.collectibleType || 'STAR'})`;
            collectibleItem.addEventListener('click', function() {
                editor.state.selectedObject = collectible;
                editor.state.selectedObjectType = { 
                    type: 'collectible',
                    index: index
                };
                editor.updatePropertiesPanel();
                editor.render();
            });
            objectList.appendChild(collectibleItem);
        });
    }
    
    // Create list items for start positions
    if (level.startPositions) {
        level.startPositions.forEach((startPos, index) => {
            const startPosItem = document.createElement('div');
            startPosItem.className = 'object-list-item';
            startPosItem.textContent = `Start positie ${index + 1}`;
            startPosItem.addEventListener('click', function() {
                editor.state.selectedObject = startPos;
                editor.state.selectedObjectType = { 
                    type: 'startPos',
                    index: index
                };
                editor.updatePropertiesPanel();
                editor.render();
            });
            objectList.appendChild(startPosItem);
        });
    }
};