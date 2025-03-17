// Dieren Redders - Level Editor (Modular) - Core Module
// Core functionality for the editor - state, constants, basic utilities

// Create a global namespace for the editor
window.editor = window.editor || {};

// Setup canvas when the module loads
editor.setup = function() {
    const canvas = document.getElementById('editorCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    editor.canvas = canvas;
    editor.ctx = canvas.getContext('2d');
    editor.GROUND_LEVEL = canvas.height - 50;
    editor.BLOCK_SIZE = 40;
};

// Editor state - centralized state management
editor.state = {
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
    tempNewLevelIndex: -1, // Tijdelijke index voor nieuw levels
    hasUnsavedChanges: false, // Bijhouden of er niet-opgeslagen wijzigingen zijn
    originalLevelState: null // Kopie van de originele levelstaat voor vergelijking
};

// Colors for different object types
editor.objectColors = {
    platform: {
        NORMAL: '#5aa93f',  // Groen voor normale platforms
        WATER: '#4a90e2',   // Blauw voor water
        TREE: '#8B4513',    // Bruin voor bomen
        CLOUD: '#ffffff',   // Wit voor wolken
        CLIMB: '#d3a87d',   // Lichter bruin voor klimoppervlakken
        TRAMPOLINE: '#ff4d4d', // Rood voor trampolines
        LASER: '#ff0000',   // Rood voor lasers (deadly platform)
        ICE: '#A5F2F3'      // Lichtblauw voor ijs
    },
    enemy: {
        LION: '#ff9800',    // Oranje voor leeuwen
        DRAGON: '#ff0000'   // Rood voor draken
    },
    trap: {
        SPIKES: '#8c8c8c'   // Grijs voor spikes
    },
    puppy: '#BE9B7B',       // Lichtbruin voor puppy
    collectible: {
        STAR: '#ffff00',     // Geel voor ster
        PEPPER: '#d70000'    // Rood voor peper
    },
    startPos: '#00ff00'     // Groen voor startposities
};

// Utility function to mark changes
editor.markUnsavedChanges = function() {
    editor.state.hasUnsavedChanges = true;
};

// Utility function to reset unsaved changes state
editor.resetUnsavedChanges = function() {
    editor.state.hasUnsavedChanges = false;
    editor.state.originalLevelState = JSON.parse(JSON.stringify(editor.state.editingLevel));
};

// Check if there are unsaved changes
editor.hasUnsavedChanges = function() {
    return editor.state.hasUnsavedChanges;
};