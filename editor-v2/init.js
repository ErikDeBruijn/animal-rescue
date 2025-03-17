// Dieren Redders - Level Editor (Modular) - Initialization Module
// Main entry point for the editor

// Add to the global editor namespace
window.editor = window.editor || {};

// Initialize all editor components when the page loads
window.onload = function() {
    // Initialize the editor core
    editor.setup();
    
    // Set a small delay to ensure all DOM elements are ready
    setTimeout(function() {
        // Load level data
        const levels = getLevels(editor.GROUND_LEVEL);
        
        // Get starting level from URL if present
        const hash = window.location.hash;
        let startLevel = 0;
        
        if (hash && hash.startsWith('#level=')) {
            const levelParam = hash.substring(7);
            startLevel = parseInt(levelParam);
            
            // Validate level number
            if (isNaN(startLevel) || startLevel < 0 || startLevel >= levels.length) {
                startLevel = 0;
            }
        }
        
        // Initialize editor state
        editor.state.currentLevel = startLevel;
        
        // Fill the level selector dropdown
        editor.populateLevelSelector(levels);
        
        // Set level selector to correct value
        const levelSelect = document.getElementById('level-select');
        if (levelSelect && levelSelect.querySelector(`option[value="${startLevel}"]`)) {
            levelSelect.value = startLevel;
        }
        
        // Load the selected level
        editor.loadLevel(startLevel);
        
        // Set up all event listeners
        editor.setupUI();
        
        // Initial rendering
        editor.render();
        
        console.log('Level editor (modular) loaded successfully\!');
    }, 100);
};
