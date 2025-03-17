// Dieren Redders - Level Editor (Modular) - Rendering Module
// Handles all canvas rendering

// Add to the global editor namespace
window.editor = window.editor || {};

// Render the entire editor
editor.render = function() {
    const ctx = editor.ctx;
    const canvas = editor.canvas;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (light blue sky)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the grid for easier placement
    editor.drawGrid();
    
    // Draw all objects in the level
    editor.drawObjects();
    
    // Draw selection highlight if an object is selected
    if (editor.state.selectedObject && !editor.state.placementMode) {
        editor.drawSelectionHighlight();
    }
    
    // Draw placement preview if in placement mode
    if (editor.state.placementMode && editor.state.placementPreview) {
        editor.drawPlacementPreview();
    }
    
    // Draw ground
    ctx.fillStyle = '#8B4513'; // Brown for ground
    ctx.fillRect(0, editor.GROUND_LEVEL, canvas.width, canvas.height - editor.GROUND_LEVEL);
    
    // Draw ground line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, editor.GROUND_LEVEL);
    ctx.lineTo(canvas.width, editor.GROUND_LEVEL);
    ctx.stroke();
};

// Draw the grid for easier placement
editor.drawGrid = function() {
    const ctx = editor.ctx;
    const canvas = editor.canvas;
    const blockSize = editor.BLOCK_SIZE;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += blockSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += blockSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
};

// Draw all objects in the level
editor.drawObjects = function() {
    const level = editor.state.editingLevel;
    if (!level) return;
    
    // Draw platforms
    if (level.platforms) {
        level.platforms.forEach(platform => {
            editor.drawPlatform(platform);
        });
    }
    
    // Draw traps
    if (level.traps) {
        level.traps.forEach(trap => {
            editor.drawTrap(trap);
        });
    }
    
    // Draw collectibles
    if (level.collectibles) {
        level.collectibles.forEach(collectible => {
            editor.drawCollectible(collectible);
        });
    }
    
    // Draw enemies
    if (level.enemies) {
        level.enemies.forEach(enemy => {
            editor.drawEnemy(enemy);
        });
    }
    
    // Draw puppy
    if (level.puppy) {
        editor.drawPuppy(level.puppy);
    }
    
    // Draw start positions
    if (level.startPositions) {
        level.startPositions.forEach((pos, index) => {
            editor.drawStartPosition(pos, index);
        });
    }
};

// Draw a platform
editor.drawPlatform = function(platform) {
    const ctx = editor.ctx;
    
    // Choose the right color based on platform type
    ctx.fillStyle = editor.objectColors.platform[platform.type] || editor.objectColors.platform.NORMAL;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Add a border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    
    // For lasers, draw a special pattern
    if (platform.type === 'LASER') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(platform.x, platform.y + 5, platform.width, 5);
    }
    
    // For trampolines, draw a special pattern
    if (platform.type === 'TRAMPOLINE') {
        ctx.fillStyle = '#FF8C94';
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
    }
};

// Draw an enemy
editor.drawEnemy = function(enemy) {
    const ctx = editor.ctx;
    
    // Choose the right color based on enemy type
    ctx.fillStyle = editor.objectColors.enemy[enemy.type] || '#FF0000';
    
    // Draw the enemy as a circle with rectangular body
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/3, enemy.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillRect(enemy.x, enemy.y + enemy.height/3, enemy.width, enemy.height * 2/3);
    
    // Add eyes for visual orientation
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/3, enemy.y + enemy.height/4, enemy.width/10, 0, Math.PI * 2);
    ctx.arc(enemy.x + enemy.width*2/3, enemy.y + enemy.height/4, enemy.width/10, 0, Math.PI * 2);
    ctx.fill();
};

// Draw a trap
editor.drawTrap = function(trap) {
    const ctx = editor.ctx;
    
    ctx.fillStyle = editor.objectColors.trap[trap.type] || '#8C8C8C';
    ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
    
    // Add spikes to the top
    ctx.beginPath();
    for (let x = trap.x; x < trap.x + trap.width; x += 10) {
        ctx.moveTo(x, trap.y);
        ctx.lineTo(x + 5, trap.y - 10);
        ctx.lineTo(x + 10, trap.y);
    }
    ctx.closePath();
    ctx.fillStyle = '#8C8C8C';
    ctx.fill();
};

// Draw a collectible
editor.drawCollectible = function(collectible) {
    const ctx = editor.ctx;
    const type = collectible.type || 'STAR';
    
    if (type === 'STAR') {
        ctx.fillStyle = editor.objectColors.collectible.STAR;
        
        // Draw a star
        const cx = collectible.x + collectible.width/2;
        const cy = collectible.y + collectible.height/2;
        const spikes = 5;
        const outerRadius = collectible.width/2;
        const innerRadius = collectible.width/4;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = Math.PI * i / spikes - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Draw a border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    } else if (type === 'PEPPER') {
        // Draw a pepper
        ctx.fillStyle = editor.objectColors.collectible.PEPPER;
        
        // Body of the pepper
        ctx.beginPath();
        ctx.ellipse(
            collectible.x + collectible.width/2, 
            collectible.y + collectible.height/2, 
            collectible.width/2, 
            collectible.height/2, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Stem of the pepper
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(
            collectible.x + collectible.width/2, 
            collectible.y + collectible.height/4, 
            collectible.width/8, 
            collectible.height/6, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }
};

// Draw a puppy
editor.drawPuppy = function(puppy) {
    const ctx = editor.ctx;
    
    ctx.fillStyle = editor.objectColors.puppy;
    
    // Draw the body
    ctx.beginPath();
    ctx.ellipse(
        puppy.x + puppy.width/2, 
        puppy.y + puppy.height/2, 
        puppy.width/2, 
        puppy.height/2, 
        0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw ears
    ctx.beginPath();
    ctx.ellipse(
        puppy.x + puppy.width/4, 
        puppy.y + puppy.height/4, 
        puppy.width/6, 
        puppy.height/4, 
        -Math.PI/4, 0, Math.PI * 2
    );
    ctx.ellipse(
        puppy.x + puppy.width*3/4, 
        puppy.y + puppy.height/4, 
        puppy.width/6, 
        puppy.height/4, 
        Math.PI/4, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(puppy.x + puppy.width/3, puppy.y + puppy.height/2, puppy.width/10, 0, Math.PI * 2);
    ctx.arc(puppy.x + puppy.width*2/3, puppy.y + puppy.height/2, puppy.width/10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw nose
    ctx.beginPath();
    ctx.arc(puppy.x + puppy.width/2, puppy.y + puppy.height*2/3, puppy.width/8, 0, Math.PI * 2);
    ctx.fill();
};

// Draw a start position
editor.drawStartPosition = function(pos, index) {
    const ctx = editor.ctx;
    
    // Draw a downward arrow at the start position
    ctx.fillStyle = editor.objectColors.startPos;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y - 30);
    ctx.lineTo(pos.x - 15, pos.y - 15);
    ctx.lineTo(pos.x - 5, pos.y - 15);
    ctx.lineTo(pos.x - 5, pos.y);
    ctx.lineTo(pos.x + 5, pos.y);
    ctx.lineTo(pos.x + 5, pos.y - 15);
    ctx.lineTo(pos.x + 15, pos.y - 15);
    ctx.closePath();
    ctx.fill();
    
    // Draw player number (1 or 2)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(index + 1, pos.x, pos.y - 20);
};

// Draw a selection highlight around the selected object
editor.drawSelectionHighlight = function() {
    const ctx = editor.ctx;
    const obj = editor.state.selectedObject;
    
    if (!obj) return;
    
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        obj.x - 5, 
        obj.y - 5, 
        obj.width + 10, 
        obj.height + 10
    );
    
    // If in resize mode, draw resize handles
    if (editor.state.selectedTool === 'resize' || editor.state.isResizing) {
        editor.drawResizeHandles(obj);
    }
};

// Draw resize handles for the selected object
editor.drawResizeHandles = function(obj) {
    const ctx = editor.ctx;
    const handleSize = 10;
    
    // Helper function to draw a single handle
    function drawHandle(x, y) {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    }
    
    // Draw handles at corners and sides
    // Corners
    drawHandle(obj.x, obj.y); // Top-left
    drawHandle(obj.x + obj.width, obj.y); // Top-right
    drawHandle(obj.x, obj.y + obj.height); // Bottom-left
    drawHandle(obj.x + obj.width, obj.y + obj.height); // Bottom-right
    
    // Sides
    drawHandle(obj.x + obj.width/2, obj.y); // Top
    drawHandle(obj.x + obj.width, obj.y + obj.height/2); // Right
    drawHandle(obj.x + obj.width/2, obj.y + obj.height); // Bottom
    drawHandle(obj.x, obj.y + obj.height/2); // Left
};

// Draw a placement preview
editor.drawPlacementPreview = function() {
    const ctx = editor.ctx;
    const preview = editor.state.placementPreview;
    
    if (!preview) return;
    
    // Draw the preview with transparency
    ctx.globalAlpha = 0.6;
    
    // Update preview position to cursor
    const x = Math.floor(editor.state.cursorPosition.x / editor.BLOCK_SIZE) * editor.BLOCK_SIZE;
    const y = Math.floor(editor.state.cursorPosition.y / editor.BLOCK_SIZE) * editor.BLOCK_SIZE;
    
    // Draw the appropriate type of object
    switch(preview.type) {
        case 'platform':
            const platformPreview = {
                x,
                y,
                width: preview.width,
                height: preview.height,
                type: preview.platformType
            };
            editor.drawPlatform(platformPreview);
            break;
            
        case 'enemy':
            const enemyPreview = {
                x,
                y,
                width: preview.width,
                height: preview.height,
                type: preview.enemyType
            };
            editor.drawEnemy(enemyPreview);
            break;
            
        case 'puppy':
            const puppyPreview = {
                x,
                y,
                width: preview.width,
                height: preview.height
            };
            editor.drawPuppy(puppyPreview);
            break;
            
        case 'trap':
            const trapPreview = {
                x,
                y,
                width: preview.width,
                height: preview.height,
                type: preview.trapType
            };
            editor.drawTrap(trapPreview);
            break;
            
        case 'collectible':
            const collectiblePreview = {
                x,
                y,
                width: preview.width,
                height: preview.height,
                type: preview.collectibleType
            };
            editor.drawCollectible(collectiblePreview);
            break;
            
        case 'startPos':
            const startPosIndex = preview.index || 0;
            editor.drawStartPosition({x, y}, startPosIndex);
            break;
    }
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
};