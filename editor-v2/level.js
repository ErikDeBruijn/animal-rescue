// Dieren Redders - Level Editor (Modular) - Level Module
// Handles level loading, saving, and exporting

// Add to the global editor namespace
window.editor = window.editor || {};

// Load level data
editor.loadLevel = function(levelIndex) {
    // Get levels data
    const levels = getLevels(editor.GROUND_LEVEL);
    
    // For 'new' level, create a template
    if (levelIndex === 'new') {
        console.log('Creating new level template');
        
        const newLevel = {
            name: "Nieuw Level",
            allowedAnimals: ["SQUIRREL", "TURTLE", "UNICORN", "CAT"],
            platforms: [],
            enemies: [],
            traps: [],
            collectibles: [],
            puppy: {
                x: 700,
                y: editor.GROUND_LEVEL - 40,
                width: 32,
                height: 24
            },
            startPositions: [
                {
                    x: 50,
                    y: editor.GROUND_LEVEL - 30,
                    radius: 15
                }
            ]
        };
        
        // Set as current editing level
        editor.state.currentLevel = 'new';
        editor.state.editingLevel = newLevel;
        editor.state.tempNewLevelIndex = levels.length;
        
        // Reset the unsaved changes state
        editor.resetUnsavedChanges();
        
        // Update level name in the UI
        document.getElementById('level-name').value = newLevel.name;
        
        // Update UI buttons
        editor.updatePlayButton();
        editor.updateDeleteButton();
        
        // Update animal checkboxes
        editor.updateAnimalCheckboxes();
        
        // Clear selection
        editor.state.selectedObject = null;
        editor.state.selectedObjectType = null;
        
        // Update the properties panel
        editor.updatePropertiesPanel();
        
        // Update the object list
        editor.updateObjectList();
        
        // Render the preview
        editor.render();
        
        return;
    }
    
    // Convert to number if it's a string
    levelIndex = parseInt(levelIndex);
    
    // Check if levelIndex is valid
    if (isNaN(levelIndex) || levelIndex < 0 || levelIndex >= levels.length) {
        console.error('Invalid level index:', levelIndex);
        return;
    }
    
    console.log('Loading level', levelIndex + 1);
    
    // Get the level data
    const level = levels[levelIndex];
    
    // Set as current editing level
    editor.state.currentLevel = levelIndex;
    editor.state.editingLevel = JSON.parse(JSON.stringify(level)); // Deep copy to avoid modifying original
    
    // Reset the unsaved changes state
    editor.resetUnsavedChanges();
    
    // Update level name in the UI
    document.getElementById('level-name').value = level.name || `Level ${levelIndex + 1}`;
    
    // Update UI buttons
    editor.updatePlayButton();
    editor.updateDeleteButton();
    
    // Update animal checkboxes
    editor.updateAnimalCheckboxes();
    
    // Clear selection
    editor.state.selectedObject = null;
    editor.state.selectedObjectType = null;
    
    // Update the properties panel
    editor.updatePropertiesPanel();
    
    // Update the object list
    editor.updateObjectList();
    
    // Render the preview
    editor.render();
};

// Save the current level
editor.saveLevelToServer = function() {
    // Get current level data
    const level = editor.state.editingLevel;
    if (!level) {
        alert('Geen level data om op te slaan!');
        return;
    }
    
    // Update the level name from the UI
    level.name = document.getElementById('level-name').value || 'Onbenoemd Level';
    
    // For new level, we need to create a new entry
    if (editor.state.currentLevel === 'new') {
        console.log('Saving new level to server');
        
        // Send the new level to the server
        fetch('/api/save_new_level', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(level)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Nieuw level opgeslagen, nieuwe index:', data.levelIndex);
                
                // Update the local state
                editor.state.currentLevel = data.levelIndex;
                
                // Reset unsaved changes state
                editor.resetUnsavedChanges();
                
                // Update save button text
                const saveBtn = document.getElementById('save-level-btn');
                if (saveBtn) {
                    saveBtn.textContent = 'Opslaan';
                }
                
                // Update level selector
                editor.populateLevelSelector(getLevels(editor.GROUND_LEVEL));
                
                // Zet de selector op het nieuwe level
                const levelSelect = document.getElementById('level-select');
                if (levelSelect) {
                    levelSelect.value = data.levelIndex;
                }
                
                // Update UI buttons
                editor.updatePlayButton();
                editor.updateDeleteButton();
                
                alert('Nieuw level succesvol opgeslagen!');
            } else {
                console.error('Fout bij opslaan van nieuw level:', data.error);
                alert('Fout bij opslaan van level: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Network error:', error);
            alert('Netwerk fout bij opslaan van level. Probeer het later opnieuw.');
        });
    } else {
        // Editing existing level
        console.log('Updating existing level', editor.state.currentLevel + 1);
        
        // Send the update to the server
        fetch('/api/update_level', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                levelIndex: editor.state.currentLevel,
                levelData: level
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Level succesvol bijgewerkt');
                
                // Reset unsaved changes state
                editor.resetUnsavedChanges();
                
                // Update save button text
                const saveBtn = document.getElementById('save-level-btn');
                if (saveBtn) {
                    saveBtn.textContent = 'Opslaan';
                }
                
                // Refresh the level selector
                editor.populateLevelSelector(getLevels(editor.GROUND_LEVEL));
                
                alert('Level succesvol opgeslagen!');
            } else {
                console.error('Fout bij bijwerken van level:', data.error);
                alert('Fout bij opslaan van level: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Network error:', error);
            alert('Netwerk fout bij opslaan van level. Probeer het later opnieuw.');
        });
    }
};

// Delete level from server
editor.deleteLevelFromServer = function() {
    // Check if this is a new level (can't delete unsaved new level)
    if (editor.state.currentLevel === 'new') {
        alert('Je kunt een nieuw level niet verwijderen voordat het is opgeslagen.');
        editor.hideDeleteConfirmation();
        return;
    }
    
    console.log('Deleting level', editor.state.currentLevel + 1);
    
    // Send delete request to the server
    fetch('/api/delete_level', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            levelIndex: editor.state.currentLevel
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Level succesvol verwijderd');
            
            // Hide the confirmation dialog
            editor.hideDeleteConfirmation();
            
            // Update the level selector
            editor.populateLevelSelector(getLevels(editor.GROUND_LEVEL));
            
            // Load the first level
            editor.loadLevel(0);
            
            // Update the level selector value
            const levelSelect = document.getElementById('level-select');
            if (levelSelect) {
                levelSelect.value = 0;
            }
            
            alert('Level succesvol verwijderd!');
        } else {
            console.error('Fout bij verwijderen van level:', data.error);
            alert('Fout bij verwijderen van level: ' + data.error);
            
            // Hide the confirmation dialog
            editor.hideDeleteConfirmation();
        }
    })
    .catch(error => {
        console.error('Network error:', error);
        alert('Netwerk fout bij verwijderen van level. Probeer het later opnieuw.');
        
        // Hide the confirmation dialog
        editor.hideDeleteConfirmation();
    });
};

// Play the current level
editor.playCurrentLevel = function() {
    // Check if this is a new level (can't play unsaved new level)
    if (editor.state.currentLevel === 'new') {
        alert('Je moet het level eerst opslaan voordat je het kunt spelen.');
        return;
    }
    
    // Redirect to the game with the level parameter
    window.location.href = `index.html#level=${editor.state.currentLevel}`;
};

// Export level data to JSON
editor.exportLevelToJson = function() {
    // Get current level data
    const level = editor.state.editingLevel;
    if (!level) {
        alert('Geen level data om te exporteren!');
        return;
    }
    
    // Convert to JSON
    const jsonData = JSON.stringify(level, null, 2);
    
    // Update export code area
    const exportCode = document.getElementById('export-code');
    if (exportCode) {
        exportCode.textContent = jsonData;
        exportCode.style.display = 'block';
    }
};

// Export all levels to JSON
editor.exportAllLevelsToJson = function() {
    // Get all levels
    const levels = getLevels(editor.GROUND_LEVEL);
    
    // Convert to JSON
    const jsonData = JSON.stringify(levels, null, 2);
    
    // Update export code area
    const exportCode = document.getElementById('export-code');
    if (exportCode) {
        exportCode.textContent = jsonData;
        exportCode.style.display = 'block';
    }
};

// Populate level selector with options
editor.populateLevelSelector = function(levels) {
    const levelSelect = document.getElementById('level-select');
    if (!levelSelect) return;
    
    // Clear existing options
    levelSelect.innerHTML = '';
    
    // Add an option for each level
    levels.forEach((level, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Level ${index + 1} - ${level.name || 'Onbenoemd'}`;
        levelSelect.appendChild(option);
    });
    
    // Add new level option
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = 'Nieuw level';
    levelSelect.appendChild(newOption);
};