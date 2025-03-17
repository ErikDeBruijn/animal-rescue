// Dieren Redders - Level Editor (Modular) - Level Module
// Handles all level operations (loading, saving, etc.)

// Add to the global editor namespace
window.editor = window.editor || {};

// Populate the level selector dropdown
editor.populateLevelSelector = function(levels) {
    const levelSelect = document.getElementById('level-select');
    if (!levelSelect) return;
    
    // Remove existing options
    while (levelSelect.firstChild) {
        levelSelect.removeChild(levelSelect.firstChild);
    }
    
    // Add all levels to the selector (user-friendly numbering from 1)
    levels.forEach((level, index) => {
        const option = document.createElement('option');
        option.value = index; // Keep using 0-based indexing internally
        option.textContent = `Level ${index + 1} - ${level.name}`; // Display 1-based
        levelSelect.appendChild(option);
    });
    
    // Add the "New level" option
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = 'Nieuw level';
    levelSelect.appendChild(newOption);
};

// Load a level into the editor
editor.loadLevel = function(levelIndex) {
    // Check for unsaved changes first
    if (editor.state.hasUnsavedChanges) {
        if (!confirm('Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je naar een ander level wilt gaan? Klik op Annuleren om terug te gaan en op te slaan.')) {
            // User cancelled, reset level selector to current level
            const levelSelect = document.getElementById('level-select');
            if (levelSelect) {
                levelSelect.value = editor.state.currentLevel;
            }
            return;
        }
    }

    const levels = getLevels(editor.GROUND_LEVEL);
    
    if (levelIndex === 'new') {
        // Create a new empty level
        editor.state.editingLevel = {
            name: "Nieuw Level",
            allowedAnimals: ["SQUIRREL", "TURTLE", "UNICORN", "CAT"], // Default to all animals
            startPositions: [{x: 50, y: editor.GROUND_LEVEL - 50}, {x: 100, y: editor.GROUND_LEVEL - 50}],
            platforms: [],
            traps: [],
            enemies: [],
            puppy: {
                x: 350, 
                y: editor.GROUND_LEVEL - 25, 
                width: 30, 
                height: 25, 
                saved: false
            },
            collectibles: []
        };
    } else {
        // Clone the level object to avoid modifying the original
        editor.state.editingLevel = JSON.parse(JSON.stringify(levels[levelIndex]));
    }
    
    // Update the level name input
    const levelNameInput = document.getElementById('level-name');
    if (levelNameInput) {
        levelNameInput.value = editor.state.editingLevel.name;
    }
    
    // Update current level
    editor.state.currentLevel = levelIndex;
    
    // Reset selection state
    editor.state.selectedObject = null;
    editor.state.selectedObjectType = null;
    
    // Reset unsaved changes state
    editor.resetUnsavedChanges();
    
    // Update UI elements
    editor.updatePlayButton();
    editor.updateAnimalCheckboxes();
    editor.updateDeleteButton();
    editor.updateObjectList();
    
    // Render the level
    editor.render();
};

// Update the animal checkboxes based on the current level
editor.updateAnimalCheckboxes = function() {
    // Initialize animals array if it doesn't exist in the level
    if (!editor.state.editingLevel.allowedAnimals) {
        editor.state.editingLevel.allowedAnimals = ["SQUIRREL", "TURTLE", "UNICORN", "CAT"];
    }
    
    // Set all checkboxes based on saved values
    const squirrelCheckbox = document.getElementById('animal-squirrel');
    const turtleCheckbox = document.getElementById('animal-turtle');
    const unicornCheckbox = document.getElementById('animal-unicorn');
    const catCheckbox = document.getElementById('animal-cat');
    
    if (squirrelCheckbox) {
        squirrelCheckbox.checked = editor.state.editingLevel.allowedAnimals.includes("SQUIRREL");
    }
    
    if (turtleCheckbox) {
        turtleCheckbox.checked = editor.state.editingLevel.allowedAnimals.includes("TURTLE");
    }
    
    if (unicornCheckbox) {
        unicornCheckbox.checked = editor.state.editingLevel.allowedAnimals.includes("UNICORN");
    }
    
    if (catCheckbox) {
        catCheckbox.checked = editor.state.editingLevel.allowedAnimals.includes("CAT");
    }
};

// Update the Play button based on the current level
editor.updatePlayButton = function() {
    const playBtn = document.getElementById('play-level-btn');
    if (!playBtn) return;
    
    // Hide button if this is a new unsaved level
    if (editor.state.currentLevel === 'new') {
        playBtn.textContent = 'Sla dit level eerst op om het te spelen';
        playBtn.disabled = true;
    } else {
        // For existing levels, create a link to the level (with 1-based index for display)
        const displayLevelNum = Number(editor.state.currentLevel) + 1;
        playBtn.textContent = `Speel Level ${displayLevelNum}`;
        playBtn.disabled = false;
    }
};

// Update the delete button status
editor.updateDeleteButton = function() {
    const deleteBtn = document.getElementById('delete-level-btn');
    if (!deleteBtn) return;
    
    // Hide delete option for new levels
    if (editor.state.currentLevel === 'new') {
        deleteBtn.disabled = true;
        deleteBtn.style.opacity = '0.5';
    } else {
        deleteBtn.disabled = false;
        deleteBtn.style.opacity = '1';
    }
};

// Navigate to the game with the current level
editor.playCurrentLevel = function() {
    if (editor.state.currentLevel === 'new') {
        alert('Sla het level eerst op voordat je het kunt spelen!');
        return;
    }
    
    // Save the level first and then play
    const saveBtn = document.getElementById('save-level-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "Opslaan...";
    saveBtn.disabled = true;
    
    // Save the level using the existing function, but without an alert
    const levelCode = editor.exportLevelCode();
    
    fetch('/api/levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            levelIndex: editor.state.currentLevel,
            levelCode: levelCode
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Reset button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        if (data.success) {
            // Navigate to the game with the correct level (using fragment identifier)
            window.location.href = `index.html#level=${editor.state.currentLevel}`;
        } else {
            alert('Fout bij het opslaan van het level voordat het gespeeld kan worden: ' + data.error);
        }
    })
    .catch((error) => {
        alert('Fout bij het opslaan van het level: ' + error);
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    });
};

// Validate a level before saving
editor.validateLevel = function() {
    const level = editor.state.editingLevel;
    const errors = [];
    
    // Check if the level has a valid name
    if (!level.name || level.name.trim() === '') {
        errors.push('Level moet een naam hebben');
    }
    
    // Check if at least 1 animal is allowed
    if (!level.allowedAnimals || level.allowedAnimals.length === 0) {
        errors.push('Er moet minstens één dier toegestaan zijn');
    }
    
    // Check if there are 2 start positions
    if (!level.startPositions || level.startPositions.length < 2) {
        errors.push('Level moet 2 startposities hebben voor beide spelers');
    }
    
    // Check if there are collectibles (stars) to complete the level
    if (!level.collectibles || level.collectibles.length === 0) {
        errors.push('Level moet minstens één ster hebben om te kunnen voltooien');
    }
    
    // Geen vereiste meer voor platforms bij de puppy - verwijderd
    
    // Return if the level is valid
    return {
        valid: errors.length === 0,
        errors: errors
    };
};

// Export the code for the current level
editor.exportLevelCode = function() {
    // Clone the level to make modifications
    const level = JSON.parse(JSON.stringify(editor.state.editingLevel));
    
    // Format specific fields
    
    // Round position and dimension values to whole numbers for better readability
    const roundNumericProps = (obj) => {
        if (obj.x !== undefined) obj.x = Math.round(obj.x);
        if (obj.y !== undefined) obj.y = Math.round(obj.y);
        if (obj.width !== undefined) obj.width = Math.round(obj.width);
        if (obj.height !== undefined) obj.height = Math.round(obj.height);
        if (obj.patrolDistance !== undefined) obj.patrolDistance = Math.round(obj.patrolDistance);
        return obj;
    };
    
    // Apply rounding to all objects
    if (level.platforms) level.platforms = level.platforms.map(roundNumericProps);
    if (level.enemies) level.enemies = level.enemies.map(roundNumericProps);
    if (level.traps) level.traps = level.traps.map(roundNumericProps);
    if (level.collectibles) level.collectibles = level.collectibles.map(roundNumericProps);
    if (level.startPositions) level.startPositions = level.startPositions.map(roundNumericProps);
    if (level.puppy) level.puppy = roundNumericProps(level.puppy);
    
    // Ensure the level number is correct
    let levelIndex = editor.state.currentLevel;
    
    // If this is a new level, determine an index (usually the next available one)
    if (levelIndex === 'new') {
        const levels = getLevels(editor.GROUND_LEVEL);
        levelIndex = levels.length;
        // Save temporarily for later use
        editor.state.tempNewLevelIndex = levelIndex;
    }
    
    // Convert level object to JSON string
    let levelJson = JSON.stringify(level, null, 4);
    
    // Create the full JavaScript code for the level
    return `levels[${levelIndex}] = ${levelJson};`;
};

// Save the level to the server
editor.saveLevelToServer = function() {
    // Update level name from input
    const levelNameInput = document.getElementById('level-name');
    if (levelNameInput) {
        editor.state.editingLevel.name = levelNameInput.value;
    }
    
    // Validate the level first
    const validation = editor.validateLevel();
    if (!validation.valid) {
        alert('Level kan niet worden opgeslagen vanwege de volgende problemen:\n\n' + validation.errors.join('\n'));
        return;
    }
    
    // Get the level code
    const levelCode = editor.exportLevelCode();
    
    // Show loading indicator
    const saveBtn = document.getElementById('save-level-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "Opslaan...";
    saveBtn.disabled = true;
    
    // POST request to the server
    fetch('/api/levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            levelIndex: editor.state.currentLevel === 'new' ? 
                        editor.state.tempNewLevelIndex : 
                        editor.state.currentLevel,
            levelCode: levelCode
        }),
    })
    .then(response => {
        // Check if the response status is OK (200-299)
        if (!response.ok) {
            // If there's a 404, it means the editor API is not available (no dev mode)
            if (response.status === 404) {
                throw new Error("Editor API niet beschikbaar. Start de server met --dev flag om de editor te gebruiken.");
            }
            // For other errors, try to read the error text
            return response.text().then(text => {
                throw new Error(`Server fout (${response.status}): ${text}`);
            });
        }
        // Try to parse the response as JSON
        return response.json().catch(e => {
            throw new Error("Ongeldig antwoord van server - kon JSON niet verwerken");
        });
    })
    .then(data => {
        // Reset button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        if (data.success) {
            alert('Level succesvol opgeslagen!');
            
            // If this was a new level, reload all levels
            if (editor.state.currentLevel === 'new') {
                const levels = getLevels(editor.GROUND_LEVEL);
                editor.populateLevelSelector(levels);
                
                // Update to the new level
                editor.state.currentLevel = editor.state.tempNewLevelIndex;
                
                // Update the level selector
                const levelSelect = document.getElementById('level-select');
                if (levelSelect) {
                    levelSelect.value = editor.state.currentLevel;
                }
                
                // Reset the tempNewLevelIndex
                editor.state.tempNewLevelIndex = -1;
            }
            
            // Update the Play button (now active for new levels)
            editor.updatePlayButton();
            
            // Reset unsaved changes status
            editor.resetUnsavedChanges();
            
            // Update delete button status (now active for new levels)
            editor.updateDeleteButton();
        } else {
            alert('Fout bij het opslaan van het level: ' + data.error);
        }
    })
    .catch((error) => {
        alert('Fout bij het opslaan van het level: ' + error);
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    });
};

// Delete a level from the server
editor.deleteLevelFromServer = function() {
    const levelIndex = editor.state.currentLevel;
    
    // Check for unsaved changes
    if (editor.state.hasUnsavedChanges) {
        if (!confirm('Je hebt niet-opgeslagen wijzigingen aan dit level. Wil je het nog steeds verwijderen en je wijzigingen verliezen?')) {
            editor.hideDeleteConfirmation();
            return;
        }
    }
    
    // Show spinner or loading text
    const deleteBtn = document.getElementById('delete-level-btn');
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = "Verwijderen...";
    deleteBtn.disabled = true;
    
    // Send the delete request to the server
    fetch(`/api/levels/${levelIndex}`, {
        method: 'DELETE'
    })
    .then(response => {
        // Check if the response status is OK (200-299)
        if (!response.ok) {
            // If there's a 404, it means the editor API is not available (no dev mode)
            if (response.status === 404) {
                throw new Error("Editor API niet beschikbaar. Start de server met --dev flag om de editor te gebruiken.");
            }
            // For other errors, try to read the error text
            return response.text().then(text => {
                throw new Error(`Server fout (${response.status}): ${text}`);
            });
        }
        // Try to parse the response as JSON
        return response.json().catch(e => {
            throw new Error("Ongeldig antwoord van server - kon JSON niet verwerken");
        });
    })
    .then(data => {
        if (data.success) {
            // Refresh the list of levels
            const levels = getLevels(editor.GROUND_LEVEL);
            editor.populateLevelSelector(levels);
            
            // If the level we deleted was the last one, go to the new last level
            if (levelIndex >= levels.length) {
                if (levels.length > 0) {
                    // If there are still levels left, go to the last one
                    editor.state.currentLevel = levels.length - 1;
                } else {
                    // If there are no levels left, create a new level
                    editor.state.currentLevel = 'new';
                }
            }
            
            // Hide the confirmation dialog
            editor.hideDeleteConfirmation();
            
            // Show success message
            alert('Level succesvol verwijderd');
            
            // Load the new active level
            editor.loadLevel(editor.state.currentLevel);
        } else {
            alert('Fout bij het verwijderen van het level: ' + data.error);
            
            // Reset the button
            deleteBtn.textContent = originalText;
            deleteBtn.disabled = false;
            
            // Hide the confirmation dialog
            editor.hideDeleteConfirmation();
        }
    })
    .catch((error) => {
        alert('Fout bij het verwijderen van het level: ' + error);
        
        // Reset the button
        deleteBtn.textContent = originalText;
        deleteBtn.disabled = false;
        
        // Hide the confirmation dialog
        editor.hideDeleteConfirmation();
    });
};

// Show confirmation dialog for level deletion
editor.showDeleteConfirmation = function() {
    const dialog = document.getElementById('delete-confirmation-dialog');
    if (dialog) {
        dialog.style.display = 'flex';
        
        // Show the level number in the confirmation text
        const displayLevelNum = Number(editor.state.currentLevel) + 1;
        const confirmText = document.querySelector('#delete-confirmation-dialog p');
        if (confirmText) {
            confirmText.textContent = `Weet je zeker dat je Level ${displayLevelNum} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`;
        }
    }
};

// Hide confirmation dialog for level deletion
editor.hideDeleteConfirmation = function() {
    const dialog = document.getElementById('delete-confirmation-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
};

// Function for the "Back to Game" link
editor.handleBackToGame = function() {
    // Check if there are unsaved changes
    if (editor.state.hasUnsavedChanges) {
        // If there are unsaved changes, ask for confirmation
        if (confirm('Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je terug wilt naar het spel? Klik op Annuleren om terug te gaan en op te slaan.')) {
            // User confirmed, navigate to game with current level
            if (editor.state.currentLevel !== 'new') {
                window.location.href = `index.html#level=${editor.state.currentLevel}`;
            } else {
                window.location.href = 'index.html';
            }
        }
    } else {
        // No unsaved changes, navigate directly to game with current level
        if (editor.state.currentLevel !== 'new') {
            window.location.href = `index.html#level=${editor.state.currentLevel}`;
        } else {
            window.location.href = 'index.html';
        }
    }
};