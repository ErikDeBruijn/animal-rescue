// Dieren Redders - Level Editor (Modular) - Properties Module
// Handles the properties panel UI

// Add to the global editor namespace
window.editor = window.editor || {};

// Update the properties panel based on the selected object
editor.updatePropertiesPanel = function() {
    // Hide all property panels first
    this.hideAllPropertyPanels();
    
    // If there's no selected object, don't show any panel
    if (!editor.state.selectedObject || !editor.state.selectedObjectType) {
        return;
    }
    
    // Show the correct panel based on the object type
    const type = editor.state.selectedObjectType.type;
    
    switch(type) {
        case 'platform':
            this.showPlatformProperties();
            break;
        case 'enemy':
            this.showEnemyProperties();
            break;
        case 'trap':
            this.showTrapProperties();
            break;
        case 'collectible':
            this.showCollectibleProperties();
            break;
        case 'puppy':
            this.showPuppyProperties();
            break;
        case 'startPos':
            this.showStartPosProperties();
            break;
    }
};

// Hide all property panels
editor.hideAllPropertyPanels = function() {
    const panels = document.querySelectorAll('.properties-panel');
    panels.forEach(panel => {
        panel.style.display = 'none';
    });
};

// Show the platform properties panel
editor.showPlatformProperties = function() {
    const panel = document.getElementById('platform-properties');
    const platform = editor.state.selectedObject;
    
    if (!panel || !platform) return;
    
    // Update the fields with the current values
    document.getElementById('platform-x').value = platform.x;
    document.getElementById('platform-y').value = platform.y;
    document.getElementById('platform-width').value = platform.width;
    document.getElementById('platform-height').value = platform.height;
    document.getElementById('platform-type').value = platform.type || 'NORMAL';
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set up event listeners for field changes
    this.setupPropertyChangeListeners('platform');
};

// Show the enemy properties panel
editor.showEnemyProperties = function() {
    const panel = document.getElementById('enemy-properties');
    const enemy = editor.state.selectedObject;
    
    if (!panel || !enemy) return;
    
    // Update the fields with the current values
    document.getElementById('enemy-x').value = enemy.x;
    document.getElementById('enemy-y').value = enemy.y;
    document.getElementById('enemy-width').value = enemy.width;
    document.getElementById('enemy-height').value = enemy.height;
    document.getElementById('enemy-type').value = enemy.type || 'LION';
    document.getElementById('enemy-patrol').value = enemy.patrolDistance || 200;
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set up event listeners for field changes
    this.setupPropertyChangeListeners('enemy');
};

// Show the trap properties panel
editor.showTrapProperties = function() {
    const panel = document.getElementById('trap-properties');
    const trap = editor.state.selectedObject;
    
    if (!panel || !trap) return;
    
    // Update the fields with the current values
    document.getElementById('trap-x').value = trap.x;
    document.getElementById('trap-y').value = trap.y;
    document.getElementById('trap-width').value = trap.width;
    document.getElementById('trap-height').value = trap.height;
    document.getElementById('trap-type').value = trap.type || 'SPIKES';
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set up event listeners for field changes
    this.setupPropertyChangeListeners('trap');
};

// Show the collectible properties panel
editor.showCollectibleProperties = function() {
    const panel = document.getElementById('collectible-properties');
    const collectible = editor.state.selectedObject;
    
    if (!panel || !collectible) return;
    
    // Update the fields with the current values
    document.getElementById('collectible-x').value = collectible.x;
    document.getElementById('collectible-y').value = collectible.y;
    document.getElementById('collectible-width').value = collectible.width;
    document.getElementById('collectible-height').value = collectible.height;
    document.getElementById('collectible-type').value = collectible.type || 'STAR';
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set up event listeners for field changes
    this.setupPropertyChangeListeners('collectible');
};

// Show the puppy properties panel
editor.showPuppyProperties = function() {
    const panel = document.getElementById('puppy-properties');
    const puppy = editor.state.selectedObject;
    
    if (!panel || !puppy) return;
    
    // Update the fields with the current values
    document.getElementById('puppy-x').value = puppy.x;
    document.getElementById('puppy-y').value = puppy.y;
    document.getElementById('puppy-width').value = puppy.width;
    document.getElementById('puppy-height').value = puppy.height;
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set up event listeners for field changes
    this.setupPropertyChangeListeners('puppy');
};

// Show the start position properties panel
editor.showStartPosProperties = function() {
    const panel = document.getElementById('startpos-properties');
    const startPos = editor.state.selectedObject;
    
    if (!panel || !startPos) return;
    
    // Update the fields with the current values
    document.getElementById('startpos-x').value = startPos.x;
    document.getElementById('startpos-y').value = startPos.y;
    
    // Show the panel
    panel.style.display = 'block';
    
    // Set up event listeners for field changes
    this.setupPropertyChangeListeners('startpos');
};

// Set up event listeners for field changes
editor.setupPropertyChangeListeners = function(prefix) {
    const properties = document.querySelectorAll(`[id^="${prefix}-"]`);
    
    properties.forEach(property => {
        // Remove any existing event listeners first
        const oldElement = property;
        const newElement = oldElement.cloneNode(true);
        oldElement.parentNode.replaceChild(newElement, oldElement);
        
        // Add a new event listener
        newElement.addEventListener('change', () => {
            const propertyName = newElement.id.substring(prefix.length + 1); // Remove prefix-
            let value = newElement.value;
            
            // Convert numeric values
            if (propertyName === 'x' || propertyName === 'y' || 
                propertyName === 'width' || propertyName === 'height' || 
                propertyName === 'patrol' || propertyName === 'patrolDistance') {
                value = parseInt(value);
            }
            
            // Check for minimum values
            if ((propertyName === 'width' || propertyName === 'height') && value < 10) {
                value = 10; // Minimum size
                newElement.value = value;
            }
            
            // Update the object property
            editor.updateSelectedObjectProperty(propertyName, value);
        });
    });
};