// Dieren Redders - Level Editor
// Een editor voor het maken van nieuwe levels

// Canvas en context opzetten
const canvas = document.getElementById('editorCanvas');
const ctx = canvas.getContext('2d');

// Constanten
const GROUND_LEVEL = canvas.height - 50;
const BLOCK_SIZE = 40;

// Editor status
let editorState = {
    selectedTool: 'move', // Begin met verplaatsen als default tool
    selectedObjectType: null,
    selectedObject: null,
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    currentLevel: 0,
    editingLevel: null,
    startPositions: [],
    placementMode: false,  // Of we in plaatsings-modus zijn
    placementPreview: null, // Preview object dat we gaan plaatsen
    cursorPosition: { x: 0, y: 0 }, // Huidige muispositie voor preview
    tempNewLevelIndex: -1 // Tijdelijke index voor nieuw levels
};

// Hulpkleuren voor verschillende objecttypes
const objectColors = {
    platform: {
        NORMAL: '#5aa93f',  // Groen voor normale platforms
        WATER: '#4a90e2',   // Blauw voor water
        TREE: '#8B4513',    // Bruin voor bomen
        CLOUD: '#ffffff',   // Wit voor wolken
        CLIMB: '#d3a87d',   // Lichter bruin voor klimoppervlakken
        TRAMPOLINE: '#ff4d4d' // Rood voor trampolines
    },
    enemy: {
        LION: '#ff9800',    // Oranje voor leeuwen
        DRAGON: '#ff0000'   // Rood voor draken
    },
    trap: {
        SPIKES: '#8c8c8c'   // Grijs voor spikes
    },
    puppy: '#BE9B7B',       // Lichtbruin voor puppy
    collectible: '#ffff00', // Geel voor ster
    startPos: '#00ff00'     // Groen voor startposities
};

// Zet het venster op
window.onload = function() {
    initEditor();
    setupEventListeners();
};

// Initialiseer de editor
function initEditor() {
    // Laad levels vanuit levels.js
    const levels = getLevels(GROUND_LEVEL);
    
    // Vul de level selector met alle beschikbare levels
    populateLevelSelector(levels);
    
    // Bepaal het laatste level uit URL fragment (indien aanwezig)
    const hash = window.location.hash;
    let lastLevelParam = null;
    
    // Controleer of er een #level=X in de URL staat
    if (hash && hash.startsWith('#level=')) {
        lastLevelParam = hash.substring(7); // Extraheer het getal na #level=
    }
    
    // Stel het huidige level in (gebruik de parameter of val terug op 0)
    editorState.currentLevel = lastLevelParam !== null ? parseInt(lastLevelParam) : 0;
    
    // Zorg dat de level index geldig is
    if (editorState.currentLevel >= levels.length) {
        editorState.currentLevel = 0;
    }
    
    // Update de selector UI
    const levelSelect = document.getElementById('level-select');
    if (levelSelect.querySelector(`option[value="${editorState.currentLevel}"]`)) {
        levelSelect.value = editorState.currentLevel;
    }
    
    // Laad het geselecteerde level
    loadLevel(editorState.currentLevel);
    
    // Update UI
    updateObjectList();
    updatePropertiesPanel();
    updatePlayButton(); // Initialiseer de speel-knop
    
    // Initialiseer de verwijderknop status
    updateDeleteButton();
}

// Vul de level selector met alle beschikbare levels
function populateLevelSelector(levels) {
    const levelSelect = document.getElementById('level-select');
    
    // Verwijder bestaande opties behalve "Nieuw level"
    while (levelSelect.firstChild) {
        levelSelect.removeChild(levelSelect.firstChild);
    }
    
    // Voeg alle levels toe aan de selector - maar met gebruiksvriendelijke nummering (vanaf 1)
    levels.forEach((level, index) => {
        const option = document.createElement('option');
        option.value = index; // Intern blijven we 0-based gebruiken
        option.textContent = `Level ${index + 1} - ${level.name}`; // Voor de gebruiker tonen we 1-based
        levelSelect.appendChild(option);
    });
    
    // Voeg de "Nieuw level" optie weer toe
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = 'Nieuw level';
    levelSelect.appendChild(newOption);
}

// Laad een level in de editor
function loadLevel(levelIndex) {
    const levels = getLevels(GROUND_LEVEL);
    
    if (levelIndex === 'new') {
        // Maak een nieuw leeg level
        editorState.editingLevel = {
            name: "Nieuw Level",
            startPositions: [{x: 50, y: GROUND_LEVEL - 50}, {x: 100, y: GROUND_LEVEL - 50}],
            platforms: [],
            traps: [],
            enemies: [],
            puppy: {
                x: 350, 
                y: GROUND_LEVEL - 25, 
                width: 30, 
                height: 25, 
                saved: false
            },
            collectibles: []
        };
    } else {
        // Clone het level object om het origineel niet te wijzigen
        editorState.editingLevel = JSON.parse(JSON.stringify(levels[levelIndex]));
    }
    
    document.getElementById('level-name').value = editorState.editingLevel.name;
    editorState.currentLevel = levelIndex;
    
    // Reset selection
    editorState.selectedObject = null;
    editorState.selectedObjectType = null;
    
    // Update de "Speel Dit Level" knop
    updatePlayButton();
    
    // Render het level
    renderEditor();
    updateObjectList();
}

// Update de UI knoppen op basis van het huidige level
function updatePlayButton() {
    const playBtn = document.getElementById('play-level-btn');
    
    if (!playBtn) return; // Veiligheidscontrole
    
    // Verberg de knop als dit een nieuw level is dat nog niet is opgeslagen
    if (editorState.currentLevel === 'new') {
        playBtn.textContent = 'Sla dit level eerst op om het te spelen';
        playBtn.disabled = true;
    } else {
        // Voor bestaande levels, maak een link die naar het level verwijst (met 1-based index voor gebruikers)
        const displayLevelNum = Number(editorState.currentLevel) + 1;
        playBtn.textContent = `Speel Level ${displayLevelNum}`;
        playBtn.disabled = false;
    }
}

// Update de status van de verwijder knop
function updateDeleteButton() {
    const deleteBtn = document.getElementById('delete-level-btn');
    
    if (!deleteBtn) return; // Veiligheidscontrole
    
    // Verberg de verwijderoptie voor nieuwe levels
    if (editorState.currentLevel === 'new') {
        deleteBtn.disabled = true;
        deleteBtn.style.opacity = '0.5';
    } else {
        deleteBtn.disabled = false;
        deleteBtn.style.opacity = '1';
    }
}

// Navigeer naar het spel met het huidige level
function playCurrentLevel() {
    if (editorState.currentLevel === 'new') {
        alert('Sla het level eerst op voordat je het kunt spelen!');
        return;
    }
    
    // Sla het level eerst op en ga dan spelen
    const saveBtn = document.getElementById('save-level-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = "Opslaan...";
    saveBtn.disabled = true;
    
    // Sla het level op via de bestaande functie, maar zonder alert
    const levelCode = exportLevelCode();
    
    fetch('/api/levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            levelIndex: editorState.currentLevel,
            levelCode: levelCode
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Reset button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        if (data.success) {
            // Navigeer naar het spel met het juiste level (gebruik fragment identifier)
            window.location.href = `index.html#level=${editorState.currentLevel}`;
        } else {
            alert('Fout bij het opslaan van het level voordat het gespeeld kan worden: ' + data.error);
        }
    })
    .catch((error) => {
        alert('Fout bij het opslaan van het level: ' + error);
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    });
}

// Setup event listeners voor alle UI elementen
function setupEventListeners() {
    // Level selector
    document.getElementById('level-select').addEventListener('change', function(e) {
        loadLevel(e.target.value);
        // updatePlayButton wordt al aangeroepen in loadLevel functie
        
        // Update verwijderknop status
        updateDeleteButton();
    });
    
    // Nieuwe level knop
    document.getElementById('new-level-btn').addEventListener('click', function() {
        loadLevel('new');
        document.getElementById('level-select').value = 'new';
    });
    
    // Save level knop
    document.getElementById('save-level-btn').addEventListener('click', function() {
        saveLevelToServer();
    });
    
    // Verwijder level knop
    document.getElementById('delete-level-btn').addEventListener('click', function() {
        // Toon alleen delete optie voor bestaande levels, niet voor nieuwe
        if (editorState.currentLevel === 'new') {
            alert('Je kunt een nieuw level niet verwijderen. Sla het eerst op.');
            return;
        }
        
        // Toon de bevestigingsdialog
        showDeleteConfirmation();
    });
    
    // Bevestigingsdialog handlers
    document.getElementById('cancel-delete-btn').addEventListener('click', function() {
        hideDeleteConfirmation();
    });
    
    document.getElementById('confirm-delete-btn').addEventListener('click', function() {
        deleteLevelFromServer();
    });
    
    // Speel level knop
    document.getElementById('play-level-btn').addEventListener('click', function() {
        playCurrentLevel();
    });
    
    // Helper functies voor de bevestigingsdialog
    function showDeleteConfirmation() {
        const dialog = document.getElementById('delete-confirmation-dialog');
        dialog.style.display = 'flex';
        
        // Toon het level nummer in de bevestigingstekst
        const displayLevelNum = Number(editorState.currentLevel) + 1;
        const confirmText = document.querySelector('#delete-confirmation-dialog p');
        confirmText.textContent = `Weet je zeker dat je Level ${displayLevelNum} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`;
    }
    
    function hideDeleteConfirmation() {
        const dialog = document.getElementById('delete-confirmation-dialog');
        dialog.style.display = 'none';
    }
    
    // Functie om een level te verwijderen
    function deleteLevelFromServer() {
        const levelIndex = editorState.currentLevel;
        
        // Toon spinner of laadtekst
        const deleteBtn = document.getElementById('delete-level-btn');
        const originalText = deleteBtn.textContent;
        deleteBtn.textContent = "Verwijderen...";
        deleteBtn.disabled = true;
        
        // Stuur het verwijderverzoek naar de server
        fetch(`/api/levels/${levelIndex}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Ververs de lijst met levels
                const levels = getLevels(GROUND_LEVEL);
                populateLevelSelector(levels);
                
                // Als het level dat we verwijderden de laatste was, ga naar het nieuwe laatste level
                if (levelIndex >= levels.length) {
                    if (levels.length > 0) {
                        // Als er nog levels over zijn, ga naar het laatste
                        editorState.currentLevel = levels.length - 1;
                    } else {
                        // Als er geen levels meer over zijn, maak een nieuw level
                        editorState.currentLevel = 'new';
                    }
                }
                
                // Verberg de bevestigingsdialog
                hideDeleteConfirmation();
                
                // Toon succesmelding en herlaad de pagina
                alert('Level succesvol verwijderd! De pagina wordt nu herladen.');
                
                // Herlaad de pagina om de editor volledig te verversen
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                alert('Fout bij het verwijderen van het level: ' + data.error);
            }
            
            // Reset button
            deleteBtn.textContent = originalText;
            deleteBtn.disabled = false;
        })
        .catch((error) => {
            alert('Fout bij het verwijderen van het level: ' + error);
            deleteBtn.textContent = originalText;
            deleteBtn.disabled = false;
            hideDeleteConfirmation();
        });
    }
    
    // Functie om levels op te slaan naar de server
    function saveLevelToServer() {
        let levelIndex = editorState.currentLevel;
        
        // Maak altijd eerst een nieuwe versie van de code
        exportLevelCode();
        
        const levelCode = document.getElementById('export-code').textContent;
        
        // Valideer het level voor het opslaan
        if (!validateLevel()) {
            return;
        }
        
        // Voor nieuwe levels, bereken wat de nieuwe index zal zijn
        if (levelIndex === 'new') {
            const levels = getLevels(GROUND_LEVEL);
            levelIndex = levels.length;
            // Sla de verwachte nieuwe index op voor later gebruik
            editorState.tempNewLevelIndex = levelIndex;
        }
        
        // Toon spinner of laadtekst
        const saveBtn = document.getElementById('save-level-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = "Opslaan...";
        saveBtn.disabled = true;
        
        // Stuur het level naar de server
        fetch('/api/levels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                levelIndex: editorState.currentLevel, // Gebruik originele index/new voor server
                levelCode: levelCode
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Als dit een nieuw level was, laad de levels opnieuw in
                if (editorState.currentLevel === 'new' && editorState.tempNewLevelIndex !== -1) {
                    // Verkrijg de nieuwe level index
                    const newLevelIndex = editorState.tempNewLevelIndex;
                    
                    // Alle levels opnieuw ophalen om selector te updaten
                    const levels = getLevels(GROUND_LEVEL);
                    populateLevelSelector(levels);
                    
                    // Selecteer het nieuwe level in de dropdown
                    const levelSelect = document.getElementById('level-select');
                    levelSelect.value = newLevelIndex;
                    
                    // Update de huidige level index
                    editorState.currentLevel = newLevelIndex;
                    editorState.tempNewLevelIndex = -1;
                }
                
                // Update de UI knoppen
                updatePlayButton();
                updateDeleteButton();
                
                alert('Level succesvol opgeslagen!');
            } else {
                alert('Fout bij het opslaan van het level: ' + data.error);
            }
            
            // Reset button
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        })
        .catch((error) => {
            alert('Fout bij het opslaan van het level: ' + error);
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        });
    }
    
    // Controleer of het level alle vereiste elementen heeft
    function validateLevel() {
        const level = editorState.editingLevel;
        let errors = [];
        
        // Check of er tenminste één platform is
        if (level.platforms.length === 0) {
            errors.push("Je level moet tenminste één platform hebben.");
        }
        
        // Check of er tenminste één collectible (ster) is
        if (level.collectibles.length === 0) {
            errors.push("Je level moet tenminste één ster hebben om te verzamelen.");
        }
        
        // Check of er een puppy is
        if (!level.puppy) {
            errors.push("Je level moet een puppy hebben om te redden.");
        }
        
        // Check of er twee startposities zijn
        if (level.startPositions.length < 2) {
            errors.push("Je level moet twee startposities hebben voor beide spelers.");
        }
        
        // Als er fouten zijn, toon ze en keer terug
        if (errors.length > 0) {
            alert("Het level kan niet worden opgeslagen:\n\n" + errors.join("\n"));
            return false;
        }
        
        return true;
    }
    
    // Level naam input
    document.getElementById('level-name').addEventListener('input', function(e) {
        editorState.editingLevel.name = e.target.value;
    });
    
    // Tool buttons
    document.getElementById('select-tool').addEventListener('click', function() {
        setActiveTool('select');
        // Sluit object panel als het open is
        exitPlacementMode();
    });
    
    document.getElementById('move-tool').addEventListener('click', function() {
        setActiveTool('move');
        // Sluit object panel als het open is
        exitPlacementMode();
    });
    
    document.getElementById('delete-tool').addEventListener('click', function() {
        setActiveTool('delete');
        // Sluit object panel als het open is
        exitPlacementMode();
    });
    
    document.getElementById('resize-tool').addEventListener('click', function() {
        setActiveTool('resize');
        // Sluit object panel als het open is
        exitPlacementMode();
    });
    
    // Placement mode button
    document.getElementById('place-tool').addEventListener('click', function() {
        setActiveTool('place');
        enterPlacementMode();
    });
    
    // Exit placement button
    document.getElementById('exit-placement-btn').addEventListener('click', function() {
        exitPlacementMode();
        setActiveTool('move');
    });
    
    // Object type buttons
    document.getElementById('platform-btn').addEventListener('click', function() {
        setActiveObjectType('platform');
    });
    
    document.getElementById('enemy-btn').addEventListener('click', function() {
        setActiveObjectType('enemy');
    });
    
    document.getElementById('puppy-btn').addEventListener('click', function() {
        setActiveObjectType('puppy');
    });
    
    document.getElementById('collectible-btn').addEventListener('click', function() {
        setActiveObjectType('collectible');
    });
    
    document.getElementById('start-pos-btn').addEventListener('click', function() {
        setActiveObjectType('startPosition');
    });
    
    document.getElementById('trap-btn').addEventListener('click', function() {
        setActiveObjectType('trap');
    });
    
    // Enter placement mode
    function enterPlacementMode() {
        document.getElementById('object-panel').style.display = 'block';
        editorState.placementMode = true;
        canvas.style.cursor = 'crosshair';
    }
    
    // Exit placement mode
    function exitPlacementMode() {
        document.getElementById('object-panel').style.display = 'none';
        editorState.placementMode = false;
        editorState.placementPreview = null;
        editorState.selectedObjectType = null;
        canvas.style.cursor = 'default';
        
        // Reset knop selecties
        document.getElementById('platform-btn').classList.remove('selected');
        document.getElementById('enemy-btn').classList.remove('selected');
        document.getElementById('puppy-btn').classList.remove('selected');
        document.getElementById('collectible-btn').classList.remove('selected');
        document.getElementById('start-pos-btn').classList.remove('selected');
        document.getElementById('trap-btn').classList.remove('selected');
        
        // Verwijder eventuele instructies
        const instruction = document.getElementById('placement-instruction');
        if (instruction) {
            instruction.remove();
        }
        
        hideAllPropertyPanels();
    }
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportLevelCode);
    
    // Canvas event listeners
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    
    // Property change listeners
    setupPropertyChangeListeners();
}

// Setup event listeners voor object eigenschappen
function setupPropertyChangeListeners() {
    // Platform eigenschappen
    document.getElementById('platform-type').addEventListener('change', updateSelectedObjectProperty);
    document.getElementById('platform-width').addEventListener('input', updateSelectedObjectProperty);
    document.getElementById('platform-height').addEventListener('input', updateSelectedObjectProperty);
    
    // Vijand eigenschappen
    document.getElementById('enemy-type').addEventListener('change', updateSelectedObjectProperty);
    document.getElementById('enemy-patrol').addEventListener('input', updateSelectedObjectProperty);
    document.getElementById('enemy-speed').addEventListener('input', updateSelectedObjectProperty);
    
    // Val eigenschappen
    document.getElementById('trap-type').addEventListener('change', updateSelectedObjectProperty);
    document.getElementById('trap-width').addEventListener('input', updateSelectedObjectProperty);
    document.getElementById('trap-height').addEventListener('input', updateSelectedObjectProperty);
}

// Update de eigenschappen van het geselecteerde object
function updateSelectedObjectProperty() {
    if (!editorState.selectedObject) return;
    
    const objectType = editorState.selectedObjectType;
    const object = editorState.selectedObject;
    
    if (objectType === 'platform') {
        object.type = document.getElementById('platform-type').value;
        const width = parseInt(document.getElementById('platform-width').value);
        const height = parseInt(document.getElementById('platform-height').value);
        
        if (!isNaN(width) && width > 0) object.width = width;
        if (!isNaN(height) && height > 0) object.height = height;
    } else if (objectType === 'enemy') {
        object.type = document.getElementById('enemy-type').value;
        
        const patrolDistance = parseInt(document.getElementById('enemy-patrol').value);
        const speed = parseFloat(document.getElementById('enemy-speed').value);
        
        if (!isNaN(patrolDistance) && patrolDistance >= 0) object.patrolDistance = patrolDistance;
        if (!isNaN(speed) && speed >= 0) object.speed = speed;
        
        // Store the start position if not already set
        if (object.startX === undefined) {
            object.startX = object.x;
        }
    } else if (objectType === 'trap') {
        object.type = document.getElementById('trap-type').value;
        
        const width = parseInt(document.getElementById('trap-width').value);
        const height = parseInt(document.getElementById('trap-height').value);
        
        if (!isNaN(width) && width > 0) object.width = width;
        if (!isNaN(height) && height > 0) object.height = height;
    }
    
    renderEditor();
    updateObjectList();
}

// Zet de actieve tool
function setActiveTool(tool) {
    editorState.selectedTool = tool;
    
    // Update UI
    document.getElementById('select-tool').classList.remove('selected');
    document.getElementById('move-tool').classList.remove('selected');
    document.getElementById('delete-tool').classList.remove('selected');
    document.getElementById('resize-tool').classList.remove('selected');
    document.getElementById('place-tool').classList.remove('selected');
    
    document.getElementById(tool + '-tool').classList.add('selected');
    
    // Als we een selectie-tool kiezen, moeten we uit de plaatsingsmodus
    if (tool === 'select' || tool === 'move' || tool === 'delete' || tool === 'resize') {
        editorState.placementMode = false;
    }
}

// Zet het actieve object type
function setActiveObjectType(type) {
    editorState.selectedObjectType = type;
    
    // Update UI
    document.getElementById('platform-btn').classList.remove('selected');
    document.getElementById('enemy-btn').classList.remove('selected');
    document.getElementById('puppy-btn').classList.remove('selected');
    document.getElementById('collectible-btn').classList.remove('selected');
    document.getElementById('start-pos-btn').classList.remove('selected');
    document.getElementById('trap-btn').classList.remove('selected');
    
    if (type) {
        document.getElementById(type.replace('startPosition', 'start-pos') + '-btn').classList.add('selected');
        
        // We zijn al in plaatsingsmodus (panel is geopend)
        // dus we maken alleen een preview object aan
        
        // Maak een preview object aan, afhankelijk van het type
        createPlacementPreview(type);
        
        // Toon instructie aan de gebruiker
        const instructionElement = document.createElement('div');
        instructionElement.id = 'placement-instruction';
        instructionElement.style.position = 'fixed';
        instructionElement.style.top = '10px';
        instructionElement.style.left = '50%';
        instructionElement.style.transform = 'translateX(-50%)';
        instructionElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        instructionElement.style.color = 'white';
        instructionElement.style.padding = '8px 15px';
        instructionElement.style.borderRadius = '5px';
        instructionElement.style.zIndex = '1000';
        instructionElement.textContent = 'Klik op de canvas om het object te plaatsen';
        
        // Verwijder bestaande instructie als die er is
        const existingInstruction = document.getElementById('placement-instruction');
        if (existingInstruction) {
            existingInstruction.remove();
        }
        
        document.body.appendChild(instructionElement);
    }
    
    // Toon de juiste eigenschappen panel
    hideAllPropertyPanels();
    if (type === 'platform') {
        document.getElementById('platform-props').style.display = 'block';
    } else if (type === 'enemy') {
        document.getElementById('enemy-props').style.display = 'block';
    } else if (type === 'trap') {
        document.getElementById('trap-props').style.display = 'block';
    }
}

// Maak een preview object aan voor plaatsing
function createPlacementPreview(type) {
    switch (type) {
        case 'platform':
            const platformWidth = parseInt(document.getElementById('platform-width').value);
            const platformHeight = parseInt(document.getElementById('platform-height').value);
            const platformType = document.getElementById('platform-type').value;
            
            editorState.placementPreview = {
                type: 'platform',
                width: platformWidth,
                height: platformHeight,
                platformType: platformType
            };
            break;
            
        case 'enemy':
            const enemyType = document.getElementById('enemy-type').value;
            const patrolDistance = parseInt(document.getElementById('enemy-patrol').value);
            const speed = parseFloat(document.getElementById('enemy-speed').value);
            
            let width, height;
            if (enemyType === 'LION') {
                width = 50;
                height = 40;
            } else {
                width = 60;
                height = 50;
            }
            
            editorState.placementPreview = {
                type: 'enemy',
                width: width,
                height: height,
                enemyType: enemyType,
                patrolDistance: patrolDistance,
                speed: speed
            };
            break;
            
        case 'puppy':
            editorState.placementPreview = {
                type: 'puppy',
                width: 30,
                height: 25
            };
            break;
            
        case 'collectible':
            editorState.placementPreview = {
                type: 'collectible',
                width: 30,
                height: 30
            };
            break;
            
        case 'startPosition':
            editorState.placementPreview = {
                type: 'startPosition',
                radius: 15
            };
            break;
            
        case 'trap':
            const trapWidth = parseInt(document.getElementById('trap-width').value);
            const trapHeight = parseInt(document.getElementById('trap-height').value);
            const trapType = document.getElementById('trap-type').value;
            
            editorState.placementPreview = {
                type: 'trap',
                width: trapWidth,
                height: trapHeight,
                trapType: trapType
            };
            break;
    }
}

// Verberg alle eigenschappen panels
function hideAllPropertyPanels() {
    const panels = document.querySelectorAll('.object-props');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });
}

// Handle canvas mousedown event
function handleCanvasMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (editorState.placementMode && editorState.selectedObjectType) {
        // Object plaatsen
        createNewObject(mouseX, mouseY);
        
        // Verwijder instructie na plaatsing
        const instruction = document.getElementById('placement-instruction');
        if (instruction) {
            instruction.remove();
        }
        
        // Reset object selectie na het plaatsen van een puppy of startpositie
        // omdat je daar maar één of twee van kunt hebben
        if (editorState.selectedObjectType === 'puppy' || 
            (editorState.selectedObjectType === 'startPosition' && editorState.editingLevel.startPositions.length >= 2)) {
            
            editorState.selectedObjectType = null;
            
            // Reset de geselecteerde knoppen
            document.getElementById('platform-btn').classList.remove('selected');
            document.getElementById('enemy-btn').classList.remove('selected');
            document.getElementById('puppy-btn').classList.remove('selected');
            document.getElementById('collectible-btn').classList.remove('selected');
            document.getElementById('start-pos-btn').classList.remove('selected');
            document.getElementById('trap-btn').classList.remove('selected');
            
            hideAllPropertyPanels();
            
            // Maak nieuwe instructie die aangeeft dat je een objecttype moet kiezen
            const newInstructionElement = document.createElement('div');
            newInstructionElement.id = 'placement-instruction';
            newInstructionElement.style.position = 'fixed';
            newInstructionElement.style.top = '10px';
            newInstructionElement.style.left = '50%';
            newInstructionElement.style.transform = 'translateX(-50%)';
            newInstructionElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            newInstructionElement.style.color = 'white';
            newInstructionElement.style.padding = '8px 15px';
            newInstructionElement.style.borderRadius = '5px';
            newInstructionElement.style.zIndex = '1000';
            newInstructionElement.textContent = 'Kies een object type om te plaatsen';
            
            document.body.appendChild(newInstructionElement);
        } else {
            // Als het een ander objecttype is, toon dan de eigenschappen
            updatePropertiesPanel();
        }
    } else if (editorState.selectedTool === 'select' || editorState.selectedTool === 'move' || 
        editorState.selectedTool === 'resize' || editorState.selectedTool === 'delete') {
        
        // Probeer een object te selecteren
        const selectedObj = findObjectAtPosition(mouseX, mouseY);
        
        if (selectedObj) {
            editorState.selectedObject = selectedObj.object;
            editorState.selectedObjectType = selectedObj.type;
            
            if (editorState.selectedTool === 'delete') {
                deleteSelectedObject();
                return;
            }
            
            if (editorState.selectedTool === 'move') {
                editorState.isDragging = true;
                editorState.dragStart = { x: mouseX, y: mouseY };
                editorState.dragOffset = { 
                    x: mouseX - selectedObj.object.x, 
                    y: mouseY - selectedObj.object.y 
                };
            }
            
            if (editorState.selectedTool === 'resize') {
                const resizeHandle = checkResizeHandles(mouseX, mouseY, selectedObj.object);
                if (resizeHandle) {
                    editorState.isResizing = true;
                    editorState.resizeHandle = resizeHandle;
                    editorState.dragStart = { x: mouseX, y: mouseY };
                }
            }
            
            // Toon properties panel voor het geselecteerde object
            updatePropertiesPanel();
        } else {
            // Deselecteer als er geen object is geklikt
            editorState.selectedObject = null;
            editorState.selectedObjectType = null;
            document.getElementById('object-panel').style.display = 'none';
            hideAllPropertyPanels();
        }
    }
    
    renderEditor();
    updateObjectList();
}

// Handle canvas mousemove event
function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Update cursor position voor preview
    editorState.cursorPosition = { x: mouseX, y: mouseY };
    
    if (editorState.isDragging && editorState.selectedObject) {
        // Object verplaatsen
        editorState.selectedObject.x = mouseX - editorState.dragOffset.x;
        editorState.selectedObject.y = mouseY - editorState.dragOffset.y;
        
        // Zorg dat objecten niet buiten het canvas komen
        editorState.selectedObject.x = Math.max(0, Math.min(canvas.width - editorState.selectedObject.width, editorState.selectedObject.x));
        editorState.selectedObject.y = Math.max(0, Math.min(canvas.height - editorState.selectedObject.height, editorState.selectedObject.y));
        
        renderEditor();
    } else if (editorState.isResizing && editorState.selectedObject) {
        // Object formaat wijzigen
        const dx = mouseX - editorState.dragStart.x;
        const dy = mouseY - editorState.dragStart.y;
        
        if (editorState.resizeHandle === 'br') {
            editorState.selectedObject.width = Math.max(20, editorState.selectedObject.width + dx);
            editorState.selectedObject.height = Math.max(20, editorState.selectedObject.height + dy);
        } else if (editorState.resizeHandle === 'tr') {
            editorState.selectedObject.width = Math.max(20, editorState.selectedObject.width + dx);
            const newHeight = Math.max(20, editorState.selectedObject.height - dy);
            editorState.selectedObject.y += editorState.selectedObject.height - newHeight;
            editorState.selectedObject.height = newHeight;
        } else if (editorState.resizeHandle === 'bl') {
            const newWidth = Math.max(20, editorState.selectedObject.width - dx);
            editorState.selectedObject.x += editorState.selectedObject.width - newWidth;
            editorState.selectedObject.width = newWidth;
            editorState.selectedObject.height = Math.max(20, editorState.selectedObject.height + dy);
        } else if (editorState.resizeHandle === 'tl') {
            const newWidth = Math.max(20, editorState.selectedObject.width - dx);
            editorState.selectedObject.x += editorState.selectedObject.width - newWidth;
            editorState.selectedObject.width = newWidth;
            const newHeight = Math.max(20, editorState.selectedObject.height - dy);
            editorState.selectedObject.y += editorState.selectedObject.height - newHeight;
            editorState.selectedObject.height = newHeight;
        }
        
        editorState.dragStart = { x: mouseX, y: mouseY };
        renderEditor();
        updatePropertiesPanel();
    } else if (editorState.placementMode) {
        // Teken de preview tijdens plaatsing
        renderEditor(); // Dit tekent ook de preview via drawObjects
    }
}

// Handle canvas mouseup event
function handleCanvasMouseUp() {
    editorState.isDragging = false;
    editorState.isResizing = false;
    editorState.resizeHandle = null;
    updateObjectList();
}

// Controleer of een van de resize handles is aangeklikt
function checkResizeHandles(x, y, object) {
    const handleSize = 10;
    
    // Bottom-right handle
    if (Math.abs(x - (object.x + object.width)) < handleSize && 
        Math.abs(y - (object.y + object.height)) < handleSize) {
        return 'br';
    }
    
    // Top-right handle
    if (Math.abs(x - (object.x + object.width)) < handleSize && 
        Math.abs(y - object.y) < handleSize) {
        return 'tr';
    }
    
    // Bottom-left handle
    if (Math.abs(x - object.x) < handleSize && 
        Math.abs(y - (object.y + object.height)) < handleSize) {
        return 'bl';
    }
    
    // Top-left handle
    if (Math.abs(x - object.x) < handleSize && 
        Math.abs(y - object.y) < handleSize) {
        return 'tl';
    }
    
    return null;
}

// Vind een object op de gegeven positie
function findObjectAtPosition(x, y) {
    // Controleer startposities
    for (let i = 0; i < editorState.editingLevel.startPositions.length; i++) {
        const pos = editorState.editingLevel.startPositions[i];
        if (x >= pos.x - 15 && x <= pos.x + 15 && y >= pos.y - 15 && y <= pos.y + 15) {
            return {
                type: 'startPosition',
                object: pos,
                index: i
            };
        }
    }
    
    // Controleer platforms
    for (let i = 0; i < editorState.editingLevel.platforms.length; i++) {
        const platform = editorState.editingLevel.platforms[i];
        if (x >= platform.x && x <= platform.x + platform.width && 
            y >= platform.y && y <= platform.y + platform.height) {
            return {
                type: 'platform',
                object: platform,
                index: i
            };
        }
    }
    
    // Controleer vijanden
    for (let i = 0; i < editorState.editingLevel.enemies.length; i++) {
        const enemy = editorState.editingLevel.enemies[i];
        if (x >= enemy.x && x <= enemy.x + enemy.width && 
            y >= enemy.y && y <= enemy.y + enemy.height) {
            return {
                type: 'enemy',
                object: enemy,
                index: i
            };
        }
    }
    
    // Controleer puppy
    const puppy = editorState.editingLevel.puppy;
    if (puppy && x >= puppy.x && x <= puppy.x + puppy.width && 
        y >= puppy.y && y <= puppy.y + puppy.height) {
        return {
            type: 'puppy',
            object: puppy
        };
    }
    
    // Controleer collectibles
    for (let i = 0; i < editorState.editingLevel.collectibles.length; i++) {
        const collectible = editorState.editingLevel.collectibles[i];
        if (x >= collectible.x && x <= collectible.x + collectible.width && 
            y >= collectible.y && y <= collectible.y + collectible.height) {
            return {
                type: 'collectible',
                object: collectible,
                index: i
            };
        }
    }
    
    // Controleer vallen
    for (let i = 0; i < editorState.editingLevel.traps.length; i++) {
        const trap = editorState.editingLevel.traps[i];
        if (x >= trap.x && x <= trap.x + trap.width && 
            y >= trap.y && y <= trap.y + trap.height) {
            return {
                type: 'trap',
                object: trap,
                index: i
            };
        }
    }
    
    return null;
}

// Maak een nieuw object op de gegeven positie
function createNewObject(x, y) {
    switch (editorState.selectedObjectType) {
        case 'platform':
            const platformWidth = parseInt(document.getElementById('platform-width').value);
            const platformHeight = parseInt(document.getElementById('platform-height').value);
            const platformType = document.getElementById('platform-type').value;
            
            const newPlatform = {
                x: x - platformWidth / 2,
                y: y - platformHeight / 2,
                width: platformWidth,
                height: platformHeight,
                type: platformType
            };
            
            editorState.editingLevel.platforms.push(newPlatform);
            editorState.selectedObject = newPlatform;
            break;
            
        case 'enemy':
            const enemyType = document.getElementById('enemy-type').value;
            const patrolDistance = parseInt(document.getElementById('enemy-patrol').value);
            const speed = parseFloat(document.getElementById('enemy-speed').value);
            
            let width, height;
            if (enemyType === 'LION') {
                width = 50;
                height = 40;
            } else {
                width = 60;
                height = 50;
            }
            
            const newEnemy = {
                x: x - width / 2,
                y: y - height / 2,
                width: width,
                height: height,
                type: enemyType,
                patrolDistance: patrolDistance,
                speed: speed
            };
            
            editorState.editingLevel.enemies.push(newEnemy);
            editorState.selectedObject = newEnemy;
            break;
            
        case 'puppy':
            const newPuppy = {
                x: x - 15,
                y: y - 12,
                width: 30,
                height: 25,
                saved: false
            };
            
            editorState.editingLevel.puppy = newPuppy;
            editorState.selectedObject = newPuppy;
            break;
            
        case 'collectible':
            const newCollectible = {
                x: x - 15,
                y: y - 15,
                width: 30,
                height: 30
            };
            
            editorState.editingLevel.collectibles.push(newCollectible);
            editorState.selectedObject = newCollectible;
            break;
            
        case 'startPosition':
            if (editorState.editingLevel.startPositions.length < 2) {
                const newStartPos = {
                    x: x,
                    y: y
                };
                
                editorState.editingLevel.startPositions.push(newStartPos);
                editorState.selectedObject = newStartPos;
            } else {
                alert("Er kunnen maximaal 2 startposities zijn!");
            }
            break;
            
        case 'trap':
            const trapWidth = parseInt(document.getElementById('trap-width').value);
            const trapHeight = parseInt(document.getElementById('trap-height').value);
            const trapType = document.getElementById('trap-type').value;
            
            const newTrap = {
                x: x - trapWidth / 2,
                y: y - trapHeight / 2,
                width: trapWidth,
                height: trapHeight,
                type: trapType
            };
            
            editorState.editingLevel.traps.push(newTrap);
            editorState.selectedObject = newTrap;
            break;
    }
}

// Verwijder het geselecteerde object
function deleteSelectedObject() {
    if (!editorState.selectedObject || !editorState.selectedObjectType) return;
    
    const type = editorState.selectedObjectType;
    const object = editorState.selectedObject;
    
    switch (type) {
        case 'platform':
            editorState.editingLevel.platforms = editorState.editingLevel.platforms.filter(p => p !== object);
            break;
        case 'enemy':
            editorState.editingLevel.enemies = editorState.editingLevel.enemies.filter(e => e !== object);
            break;
        case 'puppy':
            // Maak het puppy object leeg maar verwijder het niet helemaal, elk level heeft een puppy nodig
            editorState.editingLevel.puppy = {
                x: 350, 
                y: GROUND_LEVEL - 25, 
                width: 30, 
                height: 25, 
                saved: false
            };
            break;
        case 'collectible':
            editorState.editingLevel.collectibles = editorState.editingLevel.collectibles.filter(c => c !== object);
            break;
        case 'startPosition':
            // Startposities kunnen niet verwijderd worden, elk level heeft 2 startposities nodig
            break;
        case 'trap':
            editorState.editingLevel.traps = editorState.editingLevel.traps.filter(t => t !== object);
            break;
    }
    
    editorState.selectedObject = null;
    editorState.selectedObjectType = null;
    hideAllPropertyPanels();
    
    renderEditor();
    updateObjectList();
}

// Update de eigenschappen panel op basis van het geselecteerde object
function updatePropertiesPanel() {
    hideAllPropertyPanels();
    
    if (!editorState.selectedObject || !editorState.selectedObjectType) return;
    
    const type = editorState.selectedObjectType;
    const object = editorState.selectedObject;
    
    // Zorg ervoor dat het object-panel zichtbaar is zodat de eigenschappen panels zichtbaar kunnen zijn
    document.getElementById('object-panel').style.display = 'block';
    
    if (type === 'platform') {
        document.getElementById('platform-props').style.display = 'block';
        document.getElementById('platform-type').value = object.type || 'NORMAL';
        document.getElementById('platform-width').value = object.width;
        document.getElementById('platform-height').value = object.height;
    } else if (type === 'enemy') {
        document.getElementById('enemy-props').style.display = 'block';
        document.getElementById('enemy-type').value = object.type || 'LION';
        document.getElementById('enemy-patrol').value = object.patrolDistance || 100;
        document.getElementById('enemy-speed').value = object.speed || 1.0;
    } else if (type === 'trap') {
        document.getElementById('trap-props').style.display = 'block';
        document.getElementById('trap-type').value = object.type || 'SPIKES';
        document.getElementById('trap-width').value = object.width;
        document.getElementById('trap-height').value = object.height;
    }
}

// Update de lijst met objecten in het level
function updateObjectList() {
    const objectList = document.getElementById('object-list');
    objectList.innerHTML = '';
    
    // Start posities
    addObjectsToList('Startposities', editorState.editingLevel.startPositions, 'startPosition');
    
    // Platforms
    addObjectsToList('Platforms', editorState.editingLevel.platforms, 'platform');
    
    // Vijanden
    addObjectsToList('Vijanden', editorState.editingLevel.enemies, 'enemy');
    
    // Puppy
    if (editorState.editingLevel.puppy) {
        const puppyItem = document.createElement('div');
        puppyItem.classList.add('object-item');
        if (editorState.selectedObject === editorState.editingLevel.puppy) {
            puppyItem.classList.add('selected');
        }
        puppyItem.textContent = 'Puppy';
        puppyItem.addEventListener('click', function() {
            // Zet de editor tool naar select tool om duidelijk te maken dat we objecten selecteren
            setActiveTool('select');
            
            // Zorg dat we niet in plaatsingsmodus zijn
            editorState.placementMode = false;
            document.getElementById('object-panel').style.display = 'block';
            
            // Selecteer het object
            editorState.selectedObject = editorState.editingLevel.puppy;
            editorState.selectedObjectType = 'puppy';
            updatePropertiesPanel();
            renderEditor();
            updateObjectList();
        });
        objectList.appendChild(puppyItem);
    }
    
    // Collectibles
    addObjectsToList('Sterren', editorState.editingLevel.collectibles, 'collectible');
    
    // Vallen
    addObjectsToList('Vallen', editorState.editingLevel.traps, 'trap');
}

// Voeg objecten toe aan de objectlijst met een categorie titel
function addObjectsToList(title, objects, type) {
    const objectList = document.getElementById('object-list');
    
    if (objects.length > 0) {
        const titleElement = document.createElement('h4');
        titleElement.textContent = title;
        titleElement.style.marginBottom = '5px';
        titleElement.style.marginTop = '10px';
        objectList.appendChild(titleElement);
        
        objects.forEach((object, index) => {
            const objectItem = document.createElement('div');
            objectItem.classList.add('object-item');
            if (editorState.selectedObject === object) {
                objectItem.classList.add('selected');
            }
            
            let objectName = type;
            if (type === 'platform') {
                objectName = `Platform (${object.type})`;
            } else if (type === 'enemy') {
                objectName = `${object.type === 'LION' ? 'Leeuw' : 'Draak'}`;
            } else if (type === 'startPosition') {
                objectName = `Startpositie ${index + 1}`;
            } else if (type === 'trap') {
                objectName = `Val (${object.type})`;
            } else if (type === 'collectible') {
                objectName = `Ster ${index + 1}`;
            }
            
            objectItem.textContent = `${objectName} [${Math.round(object.x)}, ${Math.round(object.y)}]`;
            
            objectItem.addEventListener('click', function() {
                // Zet de editor tool naar select tool om duidelijk te maken dat we objecten selecteren
                setActiveTool('select');
                
                // Zorg dat we niet in plaatsingsmodus zijn
                editorState.placementMode = false;
                document.getElementById('object-panel').style.display = 'block';
                
                // Selecteer het object
                editorState.selectedObject = object;
                editorState.selectedObjectType = type;
                updatePropertiesPanel();
                renderEditor();
                updateObjectList();
            });
            
            objectList.appendChild(objectItem);
        });
    }
}

// Render de editor en alle objecten op de canvas
function renderEditor() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Teken de achtergrond (gras)
    ctx.fillStyle = '#45882f';
    ctx.fillRect(0, GROUND_LEVEL, canvas.width, canvas.height - GROUND_LEVEL);
    
    // Teken een grid
    drawGrid();
    
    // Teken alle objecten
    drawObjects();
    
    // Teken selectie highlight
    drawSelectionHighlight();
    
    // Teken het plaatsings-preview object als we in plaatsingsmodus zijn
    if (editorState.placementMode && editorState.placementPreview) {
        drawPlacementPreview();
    }
}

// Teken het preview object tijdens plaatsing
function drawPlacementPreview() {
    const x = editorState.cursorPosition.x;
    const y = editorState.cursorPosition.y;
    const preview = editorState.placementPreview;
    
    // Semi-transparante versie
    ctx.globalAlpha = 0.6;
    
    switch (preview.type) {
        case 'platform':
            // Maak een tijdelijk platform object voor de preview
            const platformPreview = {
                x: x - preview.width / 2,
                y: y - preview.height / 2,
                width: preview.width,
                height: preview.height,
                type: preview.platformType
            };
            drawPlatform(platformPreview);
            break;
            
        case 'enemy':
            // Maak een tijdelijk vijand object voor de preview
            const enemyPreview = {
                x: x - preview.width / 2,
                y: y - preview.height / 2,
                width: preview.width,
                height: preview.height,
                type: preview.enemyType,
                patrolDistance: preview.patrolDistance,
                speed: preview.speed
            };
            drawEnemy(enemyPreview);
            break;
            
        case 'puppy':
            // Maak een tijdelijk puppy object voor de preview
            const puppyPreview = {
                x: x - preview.width / 2,
                y: y - preview.height / 2,
                width: preview.width,
                height: preview.height,
                saved: false
            };
            drawPuppy(puppyPreview);
            break;
            
        case 'collectible':
            // Maak een tijdelijk collectible object voor de preview
            const collectiblePreview = {
                x: x - preview.width / 2,
                y: y - preview.height / 2,
                width: preview.width,
                height: preview.height
            };
            drawCollectible(collectiblePreview);
            break;
            
        case 'startPosition':
            // Maak een tijdelijk startpositie object voor de preview
            const startPosIndex = editorState.editingLevel.startPositions.length;
            drawStartPosition({x: x, y: y}, startPosIndex);
            break;
            
        case 'trap':
            // Maak een tijdelijk trap object voor de preview
            const trapPreview = {
                x: x - preview.width / 2,
                y: y - preview.height / 2,
                width: preview.width,
                height: preview.height,
                type: preview.trapType
            };
            drawTrap(trapPreview);
            break;
    }
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
}

// Teken een grid op de canvas
function drawGrid() {
    const gridSize = 20;
    
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    
    // Verticale lijnen
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontale lijnen
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Dikkere lijn voor de grond
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_LEVEL);
    ctx.lineTo(canvas.width, GROUND_LEVEL);
    ctx.stroke();
}

// Teken alle objecten op de canvas
function drawObjects() {
    const level = editorState.editingLevel;
    
    // Teken platforms
    level.platforms.forEach(platform => {
        drawPlatform(platform);
    });
    
    // Teken vallen
    level.traps.forEach(trap => {
        drawTrap(trap);
    });
    
    // Teken vijanden
    level.enemies.forEach(enemy => {
        drawEnemy(enemy);
    });
    
    // Teken de puppy
    if (level.puppy) {
        drawPuppy(level.puppy);
    }
    
    // Teken collectibles
    level.collectibles.forEach(collectible => {
        drawCollectible(collectible);
    });
    
    // Teken startposities
    level.startPositions.forEach((pos, index) => {
        drawStartPosition(pos, index);
    });
}

// Teken een platform
function drawPlatform(platform) {
    ctx.fillStyle = objectColors.platform[platform.type];
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Voeg details toe afhankelijk van platform type
    if (platform.type === 'WATER') {
        // Golflijnen in water
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let y = platform.y + 8; y < platform.y + platform.height; y += 8) {
            for (let x = platform.x; x < platform.x + platform.width; x += 20) {
                ctx.moveTo(x, y);
                ctx.bezierCurveTo(
                    x + 5, y - 3,
                    x + 15, y - 3,
                    x + 20, y
                );
            }
        }
        ctx.stroke();
    } else if (platform.type === 'CLOUD') {
        // Omtrek voor wolken
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(platform.x, platform.y, platform.width, platform.height, 15);
        ctx.stroke();
    } else if (platform.type === 'TREE') {
        // Boomschors textuur
        ctx.strokeStyle = 'rgba(60, 30, 0, 0.6)';
        ctx.lineWidth = 1;
        for (let y = platform.y + 8; y < platform.y + platform.height; y += 15) {
            ctx.beginPath();
            ctx.moveTo(platform.x, y);
            ctx.lineTo(platform.x + platform.width, y);
            ctx.stroke();
        }
        
        // Voeg wat vertikale lijnen toe
        for (let x = platform.x + 8; x < platform.x + platform.width; x += 10) {
            ctx.beginPath();
            ctx.moveTo(x, platform.y);
            ctx.lineTo(x, platform.y + platform.height * Math.random() * 0.5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x, platform.y + platform.height);
            ctx.lineTo(x, platform.y + platform.height - platform.height * Math.random() * 0.5);
            ctx.stroke();
        }
    } else if (platform.type === 'TRAMPOLINE') {
        // Teken trampoline
        const frameHeight = 10;
        const springHeight = platform.height - frameHeight;
        
        // Teken het frame (bruin)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x, platform.y + springHeight, platform.width, frameHeight);
        
        // Teken de poten
        ctx.fillRect(platform.x + 5, platform.y + springHeight, 10, 20);
        ctx.fillRect(platform.x + platform.width - 15, platform.y + springHeight, 10, 20);
        
        // Teken het springdoek (rood)
        ctx.fillStyle = objectColors.platform.TRAMPOLINE;
        ctx.fillRect(platform.x + 5, platform.y, platform.width - 10, springHeight);
        
        // Teken de springveertjes als witte lijnen
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        for (let i = 1; i < 10; i++) {
            const x = platform.x + (platform.width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, platform.y);
            ctx.lineTo(x, platform.y + springHeight);
            ctx.stroke();
        }
        
        // Teken bounciness indicator (pijlen omhoog)
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)'; // Gouden kleur
        ctx.beginPath();
        ctx.moveTo(platform.x + platform.width / 2, platform.y - 20);
        ctx.lineTo(platform.x + platform.width / 2 - 15, platform.y - 5);
        ctx.lineTo(platform.x + platform.width / 2 + 15, platform.y - 5);
        ctx.closePath();
        ctx.fill();
    }
    
    // Omtrek
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
}

// Teken een vijand
function drawEnemy(enemy) {
    ctx.fillStyle = objectColors.enemy[enemy.type];
    
    // Teken het lichaam
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Teken details afhankelijk van vijand type
    if (enemy.type === 'LION') {
        // Leeuw details (ogen en neus)
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + enemy.width * 0.7, enemy.y + enemy.height * 0.2, enemy.width * 0.15, enemy.height * 0.15);
        ctx.fillRect(enemy.x + enemy.width * 0.7, enemy.y + enemy.height * 0.5, enemy.width * 0.15, enemy.height * 0.15);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + enemy.width * 0.73, enemy.y + enemy.height * 0.23, enemy.width * 0.09, enemy.height * 0.09);
        ctx.fillRect(enemy.x + enemy.width * 0.73, enemy.y + enemy.height * 0.53, enemy.width * 0.09, enemy.height * 0.09);
        
        // Neus
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width * 0.9, enemy.y + enemy.height * 0.35, enemy.width * 0.1, 0, Math.PI * 2);
        ctx.fill();
    } else if (enemy.type === 'DRAGON') {
        // Draak details (ogen en vuur)
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + enemy.width * 0.8, enemy.y + enemy.height * 0.2, enemy.width * 0.15, enemy.height * 0.1);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + enemy.width * 0.85, enemy.y + enemy.height * 0.22, enemy.width * 0.05, enemy.height * 0.06);
        
        // Vuurpatroon
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width, enemy.y + enemy.height * 0.3);
        ctx.lineTo(enemy.x + enemy.width + 20, enemy.y + enemy.height * 0.1);
        ctx.lineTo(enemy.x + enemy.width + 25, enemy.y + enemy.height * 0.4);
        ctx.lineTo(enemy.x + enemy.width + 15, enemy.y + enemy.height * 0.2);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height * 0.35);
        ctx.fill();
    }
    
    // Teken de patrouilleafstand als een lijn
    if (enemy.patrolDistance > 0) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + enemy.patrolDistance, enemy.y + enemy.height + 5);
        ctx.stroke();
        
        // Pijlen om richting aan te geven
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + 5, enemy.y + enemy.height + 2);
        ctx.lineTo(enemy.x + 5, enemy.y + enemy.height + 8);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.patrolDistance, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + enemy.patrolDistance - 5, enemy.y + enemy.height + 2);
        ctx.lineTo(enemy.x + enemy.patrolDistance - 5, enemy.y + enemy.height + 8);
        ctx.fill();
    }
    
    // Label met snelheid
    ctx.font = '10px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Speed: ${enemy.speed}`, enemy.x, enemy.y - 5);
    
    // Omtrek
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

// Teken een val
function drawTrap(trap) {
    ctx.fillStyle = objectColors.trap[trap.type];
    ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
    
    // Spike details
    if (trap.type === 'SPIKES') {
        const spikeWidth = 6;
        const numSpikes = Math.floor(trap.width / spikeWidth);
        const actualSpikeWidth = trap.width / numSpikes;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        for (let i = 0; i < numSpikes; i++) {
            const x = trap.x + i * actualSpikeWidth;
            ctx.beginPath();
            ctx.moveTo(x, trap.y);
            ctx.lineTo(x + actualSpikeWidth / 2, trap.y - 10);
            ctx.lineTo(x + actualSpikeWidth, trap.y);
            ctx.fill();
        }
    }
    
    // Omtrek
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(trap.x, trap.y, trap.width, trap.height);
}

// Teken de puppy
function drawPuppy(puppy) {
    // Basisfiguur
    ctx.fillStyle = objectColors.puppy;
    ctx.fillRect(puppy.x, puppy.y, puppy.width, puppy.height);
    
    // Ogen
    ctx.fillStyle = 'white';
    ctx.fillRect(puppy.x + puppy.width * 0.6, puppy.y + puppy.height * 0.25, puppy.width * 0.2, puppy.height * 0.15);
    ctx.fillRect(puppy.x + puppy.width * 0.6, puppy.y + puppy.height * 0.55, puppy.width * 0.2, puppy.height * 0.15);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(puppy.x + puppy.width * 0.65, puppy.y + puppy.height * 0.28, puppy.width * 0.1, puppy.height * 0.1);
    ctx.fillRect(puppy.x + puppy.width * 0.65, puppy.y + puppy.height * 0.58, puppy.width * 0.1, puppy.height * 0.1);
    
    // Neus
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(puppy.x + puppy.width * 0.85, puppy.y + puppy.height * 0.4, puppy.width * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Hulpballon wanneer gestart maar niet gered
    if (!puppy.saved) {
        // Help tekstballon
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(puppy.x - 5, puppy.y - 20, 30, 15, 5);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText('Help!', puppy.x, puppy.y - 8);
        
        // Pijl
        ctx.beginPath();
        ctx.moveTo(puppy.x + 10, puppy.y - 5);
        ctx.lineTo(puppy.x + 15, puppy.y);
        ctx.lineTo(puppy.x + 20, puppy.y - 5);
        ctx.fill();
    }
    
    // Omtrek
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(puppy.x, puppy.y, puppy.width, puppy.height);
}

// Teken een ster (collectible)
function drawCollectible(collectible) {
    ctx.fillStyle = objectColors.collectible;
    
    // Teken een 5-puntige ster
    const centerX = collectible.x + collectible.width / 2;
    const centerY = collectible.y + collectible.height / 2;
    const outerRadius = collectible.width / 2;
    const innerRadius = collectible.width / 4;
    
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = Math.PI * 2 * i / 10 - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Teken een startpositie
function drawStartPosition(pos, index) {
    const radius = 15;
    
    ctx.fillStyle = objectColors.startPos;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Speler nummer
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`P${index + 1}`, pos.x, pos.y);
}

// Teken een highlight rond het geselecteerde object
function drawSelectionHighlight() {
    if (!editorState.selectedObject) return;
    
    const obj = editorState.selectedObject;
    const type = editorState.selectedObjectType;
    
    ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)';
    ctx.lineWidth = 3;
    
    if (type === 'startPosition') {
        // Cirkel voor startposities
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 18, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        // Rechthoek voor alle andere objecten
        ctx.strokeRect(obj.x - 3, obj.y - 3, obj.width + 6, obj.height + 6);
        
        // Als we in resize mode zijn, teken de resize handles
        if (editorState.selectedTool === 'resize') {
            const handleSize = 8;
            
            // Top left
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(obj.x - handleSize / 2, obj.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(obj.x - handleSize / 2, obj.y - handleSize / 2, handleSize, handleSize);
            
            // Top right
            ctx.fillRect(obj.x + obj.width - handleSize / 2, obj.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(obj.x + obj.width - handleSize / 2, obj.y - handleSize / 2, handleSize, handleSize);
            
            // Bottom left
            ctx.fillRect(obj.x - handleSize / 2, obj.y + obj.height - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(obj.x - handleSize / 2, obj.y + obj.height - handleSize / 2, handleSize, handleSize);
            
            // Bottom right
            ctx.fillRect(obj.x + obj.width - handleSize / 2, obj.y + obj.height - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(obj.x + obj.width - handleSize / 2, obj.y + obj.height - handleSize / 2, handleSize, handleSize);
        }
    }
}

// Exporteer de level code naar JavaScript code die in levels.js kan worden geplakt
function exportLevelCode() {
    const level = editorState.editingLevel;
    
    // Garandeer dat het level een naam heeft
    if (!level.name || level.name.trim() === "") {
        level.name = "Nieuw Level";
        document.getElementById('level-name').value = level.name;
    }
    
    // Zorg ervoor dat er tenminste één collectible is
    if (level.collectibles.length === 0) {
        level.collectibles.push({
            x: 650,
            y: 150,
            width: 30, 
            height: 30
        });
    }
    
    // Zorg ervoor dat er tenminste twee startposities zijn
    while (level.startPositions.length < 2) {
        level.startPositions.push({
            x: 100 + level.startPositions.length * 50,
            y: GROUND_LEVEL - 50
        });
    }
    
    // Rond alle waarden af naar gehele getallen voor een schonere opmaak
    level.startPositions.forEach(pos => {
        pos.x = Math.round(pos.x);
        pos.y = Math.round(pos.y);
    });
    
    level.platforms.forEach(platform => {
        platform.x = Math.round(platform.x);
        platform.y = Math.round(platform.y);
        platform.width = Math.round(platform.width);
        platform.height = Math.round(platform.height);
    });
    
    level.traps.forEach(trap => {
        trap.x = Math.round(trap.x);
        trap.y = Math.round(trap.y);
        trap.width = Math.round(trap.width);
        trap.height = Math.round(trap.height);
    });
    
    level.enemies.forEach(enemy => {
        enemy.x = Math.round(enemy.x);
        enemy.y = Math.round(enemy.y);
        enemy.width = Math.round(enemy.width);
        enemy.height = Math.round(enemy.height);
        enemy.patrolDistance = Math.round(enemy.patrolDistance);
        // Laat speed decimalen houden
    });
    
    if (level.puppy) {
        level.puppy.x = Math.round(level.puppy.x);
        level.puppy.y = Math.round(level.puppy.y);
        level.puppy.width = Math.round(level.puppy.width);
        level.puppy.height = Math.round(level.puppy.height);
    }
    
    level.collectibles.forEach(collectible => {
        collectible.x = Math.round(collectible.x);
        collectible.y = Math.round(collectible.y);
        collectible.width = Math.round(collectible.width);
        collectible.height = Math.round(collectible.height);
    });
    
    // Formateer het level object naar leesbare JavaScript code
    let code = `{\n`;
    code += `    name: "${level.name}",\n`;
    code += `    startPositions: [\n        {x: ${level.startPositions[0].x}, y: ${level.startPositions[0].y}}`;
    
    if (level.startPositions.length > 1) {
        code += `,\n        {x: ${level.startPositions[1].x}, y: ${level.startPositions[1].y}}`;
    }
    
    code += `\n    ],\n`;
    
    // Platforms
    code += `    platforms: [\n`;
    level.platforms.forEach((platform, index) => {
        code += `        {x: ${platform.x}, y: ${platform.y}, width: ${platform.width}, height: ${platform.height}, type: "${platform.type}"}`;
        if (index < level.platforms.length - 1) {
            code += ',\n';
        }
    });
    code += `\n    ],\n`;
    
    // Traps
    code += `    traps: [\n`;
    if (level.traps.length > 0) {
        level.traps.forEach((trap, index) => {
            code += `        {x: ${trap.x}, y: ${trap.y}, width: ${trap.width}, height: ${trap.height}, type: "${trap.type}"}`;
            if (index < level.traps.length - 1) {
                code += ',\n';
            }
        });
    }
    code += `\n    ],\n`;
    
    // Enemies
    code += `    enemies: [\n`;
    if (level.enemies.length > 0) {
        level.enemies.forEach((enemy, index) => {
            code += `        {x: ${enemy.x}, y: ${enemy.y}, width: ${enemy.width}, height: ${enemy.height}, type: "${enemy.type}", patrolDistance: ${enemy.patrolDistance}, speed: ${enemy.speed}}`;
            if (index < level.enemies.length - 1) {
                code += ',\n';
            }
        });
    }
    code += `\n    ],\n`;
    
    // Puppy
    code += `    puppy: {\n`;
    code += `        x: ${level.puppy.x}, \n`;
    code += `        y: ${level.puppy.y}, \n`;
    code += `        width: ${level.puppy.width}, \n`;
    code += `        height: ${level.puppy.height}, \n`;
    code += `        saved: false\n`;
    code += `    },\n`;
    
    // Collectibles
    code += `    collectibles: [\n`;
    if (level.collectibles.length > 0) {
        level.collectibles.forEach((collectible, index) => {
            code += `        {x: ${collectible.x}, y: ${collectible.y}, width: ${collectible.width}, height: ${collectible.height}}`;
            if (index < level.collectibles.length - 1) {
                code += ',\n';
            }
        });
    }
    code += `\n    ]\n`;
    
    code += `}`;
    
    // Toon de geëxporteerde code
    document.getElementById('export-code').textContent = code;
    
    // Update de editor weergave
    renderEditor();
    updateObjectList();
    
    return code;
}

// Initialiseer de editor bij het laden van de pagina
window.onload = function() {
    initEditor();
    setupEventListeners();
    renderEditor();
};