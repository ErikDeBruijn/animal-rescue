// Dieren Redders - Level Editor (Modular) - UI Module
// Handles all UI event handling and interaction

// Add to the global editor namespace
window.editor = window.editor || {};

// Set up all event listeners
editor.setupUI = function() {
    // Canvas event listeners - make sure to bind 'this' correctly
    if (editor.canvas) {
        editor.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        editor.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        editor.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    // Tool button event listeners
    const selectToolBtn = document.getElementById('select-tool');
    const moveToolBtn = document.getElementById('move-tool');
    const resizeToolBtn = document.getElementById('resize-tool');
    
    if (selectToolBtn) selectToolBtn.addEventListener('click', () => this.setActiveTool('select'));
    if (moveToolBtn) moveToolBtn.addEventListener('click', () => this.setActiveTool('move'));
    if (resizeToolBtn) resizeToolBtn.addEventListener('click', () => this.setActiveTool('resize'));
    
    // Object type button event listeners
    // Platform types
    const platformButtons = {
        'NORMAL': document.getElementById('platform-normal-btn'),
        'WATER': document.getElementById('platform-water-btn'),
        'TREE': document.getElementById('platform-tree-btn'),
        'CLOUD': document.getElementById('platform-cloud-btn'),
        'CLIMB': document.getElementById('platform-climb-btn'),
        'TRAMPOLINE': document.getElementById('platform-trampoline-btn'),
        'LASER': document.getElementById('platform-laser-btn'),
        'ICE': document.getElementById('platform-ice-btn')
    };
    
    for (const [type, button] of Object.entries(platformButtons)) {
        if (button) {
            button.addEventListener('click', () => this.setActiveObjectType('platform', type));
        }
    }
    
    // Enemy types
    const enemyButtons = {
        'LION': document.getElementById('enemy-lion-btn'),
        'DRAGON': document.getElementById('enemy-dragon-btn')
    };
    
    for (const [type, button] of Object.entries(enemyButtons)) {
        if (button) {
            button.addEventListener('click', () => this.setActiveObjectType('enemy', type));
        }
    }
    
    // Trap types
    const trapBtn = document.getElementById('trap-spikes-btn');
    if (trapBtn) {
        trapBtn.addEventListener('click', () => this.setActiveObjectType('trap', 'SPIKES'));
    }
    
    // Collectible types
    const starBtn = document.getElementById('collectible-star-btn');
    const pepperBtn = document.getElementById('collectible-pepper-btn');
    
    if (starBtn) starBtn.addEventListener('click', () => this.setActiveObjectType('collectible', 'STAR'));
    if (pepperBtn) pepperBtn.addEventListener('click', () => this.setActiveObjectType('collectible', 'PEPPER'));
    
    // Puppy and start positions
    const puppyBtn = document.getElementById('puppy-btn');
    const startPos1Btn = document.getElementById('startpos-1-btn');
    const startPos2Btn = document.getElementById('startpos-2-btn');
    
    if (puppyBtn) puppyBtn.addEventListener('click', () => this.setActiveObjectType('puppy'));
    if (startPos1Btn) startPos1Btn.addEventListener('click', () => this.setActiveObjectType('startPos', '0'));
    if (startPos2Btn) startPos2Btn.addEventListener('click', () => this.setActiveObjectType('startPos', '1'));
    
    // Level selector
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) {
        levelSelect.addEventListener('change', function(e) {
            // Check for unsaved changes first
            if (editor.hasUnsavedChanges()) {
                if (!confirm('Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je naar een ander level wilt gaan? Klik op Annuleren om terug te gaan en op te slaan.')) {
                    // User cancelled, reset level selector to current level
                    e.target.value = editor.state.currentLevel;
                    return;
                }
            }
            
            editor.loadLevel(e.target.value);
            // updatePlayButton is already called in loadLevel function
        });
    }
    
    // New level button
    const newLevelBtn = document.getElementById('new-level-btn');
    if (newLevelBtn) {
        newLevelBtn.addEventListener('click', function() {
            editor.loadLevel('new');
            if (levelSelect) levelSelect.value = 'new';
        });
    }
    
    // Save level button
    const saveLevelBtn = document.getElementById('save-level-btn');
    if (saveLevelBtn) {
        saveLevelBtn.addEventListener('click', function() {
            editor.saveLevelToServer();
        });
    }
    
    // Delete level button
    const deleteLevelBtn = document.getElementById('delete-level-btn');
    if (deleteLevelBtn) {
        deleteLevelBtn.addEventListener('click', function() {
            // Only show delete option for existing levels, not for new ones
            if (editor.state.currentLevel === 'new') {
                alert('Je kunt een nieuw level niet verwijderen. Sla het eerst op.');
                return;
            }
            
            // Show the confirmation dialog
            editor.showDeleteConfirmation();
        });
    }
    
    // Confirmation dialog handlers
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            editor.hideDeleteConfirmation();
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            editor.deleteLevelFromServer();
        });
    }
    
    // Play level button
    const playLevelBtn = document.getElementById('play-level-btn');
    if (playLevelBtn) {
        playLevelBtn.addEventListener('click', function() {
            editor.playCurrentLevel();
        });
    }
    
    // Animal checkbox event listeners
    const animalCheckboxes = [
        document.getElementById('animal-squirrel'),
        document.getElementById('animal-turtle'),
        document.getElementById('animal-unicorn'),
        document.getElementById('animal-cat')
    ];
    
    animalCheckboxes.forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', this.updateAllowedAnimals);
        }
    });
    
    // Back to game link
    const backToGameLink = document.getElementById('back-to-game-link');
    if (backToGameLink) {
        backToGameLink.addEventListener('click', function(e) {
            e.preventDefault();
            editor.handleBackToGame();
        });
    }
    
    // Global keyboard event listener for delete key
    document.addEventListener('keydown', function(e) {
        // Check if the delete or backspace key is pressed
        if ((e.key === 'Delete' || e.key === 'Backspace') && 
            editor.state.selectedObject && 
            (editor.state.selectedTool === 'select' || editor.state.selectedTool === 'move' || editor.state.selectedTool === 'resize')) {
            editor.deleteSelectedObject();
        }
    });
};

// Update allowed animals based on checkboxes
editor.updateAllowedAnimals = function() {
    const allowedAnimals = [];
    
    const squirrelCheckbox = document.getElementById('animal-squirrel');
    const turtleCheckbox = document.getElementById('animal-turtle');
    const unicornCheckbox = document.getElementById('animal-unicorn');
    const catCheckbox = document.getElementById('animal-cat');
    
    if (squirrelCheckbox && squirrelCheckbox.checked) allowedAnimals.push('SQUIRREL');
    if (turtleCheckbox && turtleCheckbox.checked) allowedAnimals.push('TURTLE');
    if (unicornCheckbox && unicornCheckbox.checked) allowedAnimals.push('UNICORN');
    if (catCheckbox && catCheckbox.checked) allowedAnimals.push('CAT');
    
    // Update the level data
    editor.state.editingLevel.allowedAnimals = allowedAnimals;
    
    // Mark as unsaved changes
    editor.markUnsavedChanges();
};

// Handle mouse down event
editor.handleMouseDown = function(e) {
    const canvas = editor.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update cursor position for use by other functions
    editor.state.cursorPosition = { x, y };
    
    // In placement mode, try to place an object
    if (editor.state.placementMode) {
        const newObject = editor.createNewObject(
            editor.state.selectedObjectType.type, 
            editor.state.selectedObjectType.subtype, 
            x, y
        );
        
        // Stay in placement mode to place multiple objects
        editor.state.selectedObject = newObject;
        editor.render();
        return;
    }
    
    // In selection mode, try to select an object
    if (editor.state.selectedTool === 'select' || 
        editor.state.selectedTool === 'move' || 
        editor.state.selectedTool === 'resize') {
        
        // If resize mode, check if a resize handle was clicked first
        if (editor.state.selectedTool === 'resize' && editor.state.selectedObject) {
            const handle = editor.checkResizeHandles(x, y);
            if (handle) {
                editor.state.isResizing = true;
                editor.state.resizeHandle = handle;
                editor.state.dragStart = { x, y };
                return;
            }
        }
        
        // Find object under cursor
        const objectAtPosition = editor.findObjectAtPosition(x, y);
        
        // If an object was found, select it
        if (objectAtPosition) {
            editor.state.selectedObject = objectAtPosition.object;
            editor.state.selectedObjectType = {
                type: objectAtPosition.type,
                index: objectAtPosition.index
            };
            
            // In move/resize mode, start dragging
            if (editor.state.selectedTool === 'move') {
                editor.state.isDragging = true;
                editor.state.dragStart = { x, y };
                editor.state.dragOffset = { 
                    x: x - objectAtPosition.object.x, 
                    y: y - objectAtPosition.object.y 
                };
            } else if (editor.state.selectedTool === 'select') {
                // If we already have an object selected and click on it again,
                // toggle between move and resize tools
                if (editor.state.selectedObject === objectAtPosition.object) {
                    if (editor.state.selectedTool === 'select') {
                        editor.setActiveTool('move');
                    } else if (editor.state.selectedTool === 'move') {
                        editor.setActiveTool('resize');
                    } else {
                        editor.setActiveTool('select');
                    }
                }
            }
            
            // Update UI
            editor.updatePropertiesPanel();
            editor.updateObjectList();
        } else {
            // If no object was found, deselect the current object
            editor.state.selectedObject = null;
            editor.state.selectedObjectType = null;
            
            // Update UI
            editor.updatePropertiesPanel();
            editor.updateObjectList();
        }
        
        // Render again to show the selection
        editor.render();
    }
};

// Handle mouse move event
editor.handleMouseMove = function(e) {
    const canvas = editor.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update cursor position
    editor.state.cursorPosition = { x, y };
    
    // In placement mode, update the preview position
    if (editor.state.placementMode && editor.state.placementPreview) {
        editor.render(); // This will update the preview with the new cursor position
        return;
    }
    
    // In drag mode, move the selected object
    if (editor.state.isDragging && editor.state.selectedObject) {
        // Update object position with free positioning (no grid snapping)
        const oldX = editor.state.selectedObject.x;
        const oldY = editor.state.selectedObject.y;
        
        // Direct positioning without grid snapping
        editor.state.selectedObject.x = x - editor.state.dragOffset.x;
        editor.state.selectedObject.y = y - editor.state.dragOffset.y;
        
        // Ensure objects don't go outside the canvas
        editor.state.selectedObject.x = Math.max(0, Math.min(editor.canvas.width - editor.state.selectedObject.width, editor.state.selectedObject.x));
        editor.state.selectedObject.y = Math.max(0, Math.min(editor.canvas.height - editor.state.selectedObject.height, editor.state.selectedObject.y));
        
        // Mark changes as unsaved if position changed
        if (oldX !== editor.state.selectedObject.x || oldY !== editor.state.selectedObject.y) {
            editor.markUnsavedChanges();
        }
        
        // Update properties panel
        editor.updatePropertiesPanel();
        
        // Render again
        editor.render();
    }
    
    // In resize mode, adjust the size of the selected object
    if (editor.state.isResizing && editor.state.selectedObject) {
        const blockSize = editor.BLOCK_SIZE;
        const obj = editor.state.selectedObject;
        const handle = editor.state.resizeHandle;
        
        // Calculate new size/position based on the resize handle
        let newX = obj.x;
        let newY = obj.y;
        let newWidth = obj.width;
        let newHeight = obj.height;
        
        // Free positioning without snapping to grid
        // Adjust position/size based on the handle
        switch (handle) {
            case 'topLeft':
                newWidth = obj.x + obj.width - x;
                newHeight = obj.y + obj.height - y;
                newX = x;
                newY = y;
                break;
            case 'topRight':
                newWidth = x - obj.x;
                newHeight = obj.y + obj.height - y;
                newY = y;
                break;
            case 'bottomLeft':
                newWidth = obj.x + obj.width - x;
                newHeight = y - obj.y;
                newX = x;
                break;
            case 'bottomRight':
                newWidth = x - obj.x;
                newHeight = y - obj.y;
                break;
            case 'top':
                newHeight = obj.y + obj.height - y;
                newY = y;
                break;
            case 'right':
                newWidth = x - obj.x;
                break;
            case 'bottom':
                newHeight = y - obj.y;
                break;
            case 'left':
                newWidth = obj.x + obj.width - x;
                newX = x;
                break;
        }
        
        // Make sure the size doesn't become negative
        if (newWidth < blockSize) newWidth = blockSize;
        if (newHeight < blockSize/2) newHeight = blockSize/2;
        
        // Update object
        obj.x = newX;
        obj.y = newY;
        obj.width = newWidth;
        obj.height = newHeight;
        
        // Mark changes as unsaved
        editor.markUnsavedChanges();
        
        // Update properties panel
        editor.updatePropertiesPanel();
        
        // Render again
        editor.render();
    }
    
    // If an object is selected, render again to show e.g. resize handles
    if (editor.state.selectedObject) {
        editor.render();
    }
};

// Handle mouse up event
editor.handleMouseUp = function(e) {
    // Reset dragging state
    editor.state.isDragging = false;
    editor.state.isResizing = false;
    editor.state.resizeHandle = null;
};

// Set the active tool
editor.setActiveTool = function(toolName) {
    // Remove the active class from all tools first
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add the active class to the selected tool
    const selectedToolBtn = document.getElementById(`${toolName}-tool`);
    if (selectedToolBtn) {
        selectedToolBtn.classList.add('active');
    }
    
    // Set the tool
    editor.state.selectedTool = toolName;
    
    // If we're not in placement mode anymore, reset the placement status
    if (toolName !== 'place') {
        editor.exitPlacementMode();
    }
    
    // Render again
    editor.render();
};

// Set the active object type and enter placement mode
editor.setActiveObjectType = function(type, subtype) {
    editor.state.selectedObjectType = { type, subtype };
    editor.enterPlacementMode(type, subtype);
};

// Enter placement mode
editor.enterPlacementMode = function(type, subtype) {
    // Set the active tool to 'place'
    editor.state.selectedTool = 'place';
    editor.state.placementMode = true;
    
    // Remove the active class from all tools
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mark the active object type button
    const objectButtons = document.querySelectorAll('.object-btn');
    objectButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    let buttonId;
    switch(type) {
        case 'platform':
            buttonId = `platform-${subtype.toLowerCase()}-btn`;
            break;
        case 'enemy':
            buttonId = `enemy-${subtype.toLowerCase()}-btn`;
            break;
        case 'trap':
            buttonId = `trap-${subtype.toLowerCase()}-btn`;
            break;
        case 'collectible':
            buttonId = `collectible-${subtype.toLowerCase()}-btn`;
            break;
        case 'puppy':
            buttonId = 'puppy-btn';
            break;
        case 'startPos':
            buttonId = `startpos-${parseInt(subtype) + 1}-btn`;
            break;
    }
    
    if (buttonId) {
        const selectedBtn = document.getElementById(buttonId);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    }
    
    // Create a preview object for placement
    this.createPlacementPreview(type, subtype);
    
    // Render the preview
    editor.render();
};

// Exit placement mode
editor.exitPlacementMode = function() {
    editor.state.placementMode = false;
    editor.state.placementPreview = null;
    
    // Remove the active class from all object buttons
    const objectButtons = document.querySelectorAll('.object-btn');
    objectButtons.forEach(btn => {
        btn.classList.remove('active');
    });
};

// Create a placement preview object
editor.createPlacementPreview = function(type, subtype) {
    const blockSize = editor.BLOCK_SIZE;
    const x = editor.state.cursorPosition.x || 0;
    const y = editor.state.cursorPosition.y || 0;
    
    // Free positioning without grid snapping
    
    // Create the right type of preview object
    let preview;
    
    switch(type) {
        case 'platform':
            preview = {
                type: 'platform',
                x: x,
                y: y,
                width: blockSize * 3,
                height: blockSize,
                platformType: subtype || 'NORMAL'
            };
            
            // Special dimensions for different platform types
            if (subtype === 'WATER') {
                preview.height = blockSize * 2;
            } else if (subtype === 'LASER') {
                preview.height = blockSize / 4;
            }
            break;
            
        case 'enemy':
            preview = {
                type: 'enemy',
                x: x,
                y: y,
                width: blockSize,
                height: blockSize,
                enemyType: subtype || 'LION'
            };
            break;
            
        case 'trap':
            preview = {
                type: 'trap',
                x: x,
                y: y,
                width: blockSize * 2,
                height: blockSize / 2,
                trapType: 'SPIKES'
            };
            break;
            
        case 'collectible':
            preview = {
                type: 'collectible',
                x: x,
                y: y,
                width: blockSize / 2,
                height: blockSize / 2,
                collectibleType: subtype || 'STAR'
            };
            break;
            
        case 'puppy':
            preview = {
                type: 'puppy',
                x: x,
                y: y,
                width: blockSize * 0.8,
                height: blockSize * 0.6
            };
            break;
            
        case 'startPos':
            preview = {
                type: 'startPos',
                x: x,
                y: y,
                width: 30,
                height: 30,
                index: parseInt(subtype) || 0
            };
            break;
    }
    
    // Save the preview object
    editor.state.placementPreview = preview;
};