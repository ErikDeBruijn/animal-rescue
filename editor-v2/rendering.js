// Dieren Redders - Level Editor (Modular) - Rendering Module
// Handles all canvas rendering

// Add to the global editor namespace
window.editor = window.editor || {};

// Main render function - called on each update
editor.render = function() {
    const ctx = editor.ctx;
    const canvas = editor.canvas;
    
    if (!ctx || !canvas) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw gridlines for orientation
    this.drawGrid();
    
    // Draw ground line
    ctx.beginPath();
    ctx.strokeStyle = '#5f9f3f'; // Groen voor de grond
    ctx.lineWidth = 2;
    ctx.moveTo(0, editor.GROUND_LEVEL);
    ctx.lineTo(canvas.width, editor.GROUND_LEVEL);
    ctx.stroke();
    
    // Draw all objects in the level
    this.drawAllObjects();
    
    // Draw placement preview if in placement mode
    if (editor.state.placementMode && editor.state.placementPreview) {
        this.drawPlacementPreview();
    }
    
    // Draw selection highlight if an object is selected
    if (editor.state.selectedObject) {
        this.drawSelectionHighlight();
    }
};

// Draw a grid for better positioning
editor.drawGrid = function() {
    const ctx = editor.ctx;
    const canvas = editor.canvas;
    const gridSize = editor.BLOCK_SIZE;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Draw vertical grid lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
};

// Draw all objects in the level
editor.drawAllObjects = function() {
    const level = editor.state.editingLevel;
    if (!level) return;
    
    // Draw platforms
    if (level.platforms) {
        level.platforms.forEach(platform => {
            this.drawPlatform(platform);
        });
    }
    
    // Draw traps
    if (level.traps) {
        level.traps.forEach(trap => {
            this.drawTrap(trap);
        });
    }
    
    // Draw enemies
    if (level.enemies) {
        level.enemies.forEach(enemy => {
            this.drawEnemy(enemy);
        });
    }
    
    // Draw collectibles
    if (level.collectibles) {
        level.collectibles.forEach(collectible => {
            this.drawCollectible(collectible);
        });
    }
    
    // Draw puppy
    if (level.puppy) {
        this.drawPuppy(level.puppy);
    }
    
    // Draw start positions
    if (level.startPositions) {
        level.startPositions.forEach((pos, index) => {
            this.drawStartPosition(pos, index);
        });
    }
};

// Draw a platform
editor.drawPlatform = function(platform) {
    const ctx = editor.ctx;
    
    // Get the color based on platform type
    const platformType = platform.type || 'NORMAL';
    const color = editor.objectColors.platform[platformType] || '#5aa93f';
    
    // Draw the main platform shape
    ctx.fillStyle = color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    
    // For trampolines, add a spring indicator
    if (platformType === 'TRAMPOLINE') {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        
        const springWidth = platform.width * 0.8;
        const startX = platform.x + (platform.width - springWidth) / 2;
        const midY = platform.y + platform.height / 2;
        
        // Draw zig-zag spring pattern
        ctx.moveTo(startX, midY);
        for (let i = 0; i < 5; i++) {
            const zigzagWidth = springWidth / 5;
            ctx.lineTo(startX + zigzagWidth * i + zigzagWidth / 2, 
                      i % 2 === 0 ? midY - 5 : midY + 5);
            ctx.lineTo(startX + zigzagWidth * (i + 1), midY);
        }
        ctx.stroke();
    }
    
    // For treadmills, add an arrow indicator
    if (platformType === 'TREADMILL') {
        const speed = platform.speed || 0;
        if (speed !== 0) {
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#fff';
            
            // Arrow direction based on speed
            const direction = speed > 0 ? 1 : -1;
            const arrowWidth = Math.min(platform.width * 0.5, 40);
            const midX = platform.x + platform.width / 2;
            const midY = platform.y + platform.height / 2;
            
            // Draw arrow
            ctx.moveTo(midX - direction * arrowWidth / 2, midY);
            ctx.lineTo(midX + direction * arrowWidth / 2, midY);
            ctx.lineTo(midX + direction * arrowWidth / 3, midY - 5);
            ctx.moveTo(midX + direction * arrowWidth / 2, midY);
            ctx.lineTo(midX + direction * arrowWidth / 3, midY + 5);
            ctx.stroke();
        }
    }
};

// Draw an enemy
editor.drawEnemy = function(enemy) {
    const ctx = editor.ctx;
    
    // Get the color based on enemy type
    const enemyType = enemy.type || 'LION';
    const color = editor.objectColors.enemy[enemyType] || '#ff9800';
    
    // Draw the main enemy shape
    ctx.fillStyle = color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Add patrol indicator if patrol distance is set
    if (enemy.patrolDistance > 0) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.setLineDash([5, 5]);
        
        // Draw patrol line
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.patrolDistance, 
                  enemy.y + enemy.height + 5);
                  
        // Draw direction arrows
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height + 10);
        ctx.lineTo(enemy.x + enemy.width / 2 + 5, enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        
        ctx.moveTo(enemy.x + enemy.width / 2 + enemy.patrolDistance, 
                  enemy.y + enemy.height + 10);
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.patrolDistance - 5, 
                  enemy.y + enemy.height + 5);
        ctx.lineTo(enemy.x + enemy.width / 2 + enemy.patrolDistance, 
                  enemy.y + enemy.height);
                  
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Add speed indicator text
    if (enemy.speed) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Speed: ' + enemy.speed, 
                   enemy.x + enemy.width / 2, 
                   enemy.y - 5);
    }
};

// Draw a trap
editor.drawTrap = function(trap) {
    const ctx = editor.ctx;
    
    // Get the color based on trap type
    const trapType = trap.type || 'SPIKES';
    const color = editor.objectColors.trap[trapType] || '#8c8c8c';
    
    // Draw the main trap shape
    ctx.fillStyle = color;
    
    if (trapType === 'SPIKES') {
        // Draw a spiky shape
        const spikes = Math.floor(trap.width / 10);
        const spikeWidth = trap.width / spikes;
        
        ctx.beginPath();
        ctx.moveTo(trap.x, trap.y + trap.height);
        
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(trap.x + spikeWidth * i + spikeWidth / 2, trap.y);
            ctx.lineTo(trap.x + spikeWidth * (i + 1), trap.y + trap.height);
        }
        
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    } else {
        // Fallback to rectangle for unknown trap types
        ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(trap.x, trap.y, trap.width, trap.height);
    }
};

// Draw a collectible
editor.drawCollectible = function(collectible) {
    const ctx = editor.ctx;
    
    // Get the color based on collectible type
    const collectibleType = collectible.collectibleType || 'STAR';
    const color = editor.objectColors.collectible[collectibleType] || '#ffff00';
    
    // Draw the collectible
    ctx.fillStyle = color;
    
    if (collectibleType === 'STAR') {
        // Draw a star shape
        const centerX = collectible.x + collectible.width / 2;
        const centerY = collectible.y + collectible.height / 2;
        const radius = Math.min(collectible.width, collectible.height) / 2;
        
        // Draw a 5-pointed star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const innerAngle = outerAngle + Math.PI / 5;
            
            if (i === 0) {
                ctx.moveTo(centerX + radius * Math.cos(outerAngle),
                         centerY + radius * Math.sin(outerAngle));
            } else {
                ctx.lineTo(centerX + radius * Math.cos(outerAngle),
                         centerY + radius * Math.sin(outerAngle));
            }
            
            ctx.lineTo(centerX + radius * 0.4 * Math.cos(innerAngle),
                     centerY + radius * 0.4 * Math.sin(innerAngle));
        }
        ctx.closePath();
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    } else if (collectibleType === 'PEPPER') {
        // Draw a pepper shape
        const centerX = collectible.x + collectible.width / 2;
        const centerY = collectible.y + collectible.height / 2;
        
        // Draw the main body
        ctx.beginPath();
        ctx.arc(centerX, centerY, collectible.width / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add stem
        ctx.fillStyle = '#3d8c3d';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - collectible.height / 2,
                  collectible.width / 4, collectible.height / 6,
                  0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, collectible.width / 2, 0, 2 * Math.PI);
        ctx.stroke();
    } else {
        // Fallback to circle for unknown collectible types
        const centerX = collectible.x + collectible.width / 2;
        const centerY = collectible.y + collectible.height / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(collectible.width, collectible.height) / 2,
              0, 2 * Math.PI);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
};

// Draw the puppy
editor.drawPuppy = function(puppy) {
    const ctx = editor.ctx;
    
    // Get the puppy color
    const color = editor.objectColors.puppy || '#BE9B7B';
    
    // Draw the main puppy shape (simple rectangle for editor)
    ctx.fillStyle = color;
    ctx.fillRect(puppy.x, puppy.y, puppy.width, puppy.height);
    
    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(puppy.x, puppy.y, puppy.width, puppy.height);
    
    // Add face details
    const faceX = puppy.x + puppy.width * 0.2;
    const faceY = puppy.y + puppy.height * 0.3;
    const eyeSize = Math.min(puppy.width, puppy.height) * 0.1;
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(faceX, faceY, eyeSize, 0, 2 * Math.PI);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(puppy.x + puppy.width * 0.15, 
           puppy.y + puppy.height * 0.5, 
           eyeSize * 1.2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add 'saved' status indicator if applicable
    if (puppy.saved) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(puppy.x, puppy.y, puppy.width, puppy.height);
        
        ctx.font = '10px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText('GERED', 
                   puppy.x + puppy.width / 2, 
                   puppy.y - 5);
    }
};

// Draw a start position
editor.drawStartPosition = function(position, index) {
    const ctx = editor.ctx;
    
    // Get the color for start positions
    const color = editor.objectColors.startPos || '#00ff00';
    
    // Use alpha to differentiate players
    const alpha = index === 0 ? 0.8 : 0.5;
    
    // Draw a circle for the start position
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    
    const radius = position.radius || 15;
    
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add player number
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P' + (index + 1), position.x, position.y);
    
    // Reset global alpha
    ctx.globalAlpha = 1;
};

// Draw the placement preview
editor.drawPlacementPreview = function() {
    const ctx = editor.ctx;
    const preview = editor.state.placementPreview;
    const cursorPos = editor.state.cursorPosition;
    
    if (!preview || !cursorPos) return;
    
    // Set semi-transparent style for preview
    ctx.globalAlpha = 0.5;
    
    // Position the preview at the cursor
    preview.x = cursorPos.x - (preview.width || 50) / 2;
    preview.y = cursorPos.y - (preview.height || 50) / 2;
    
    // Draw based on type
    switch(preview.type) {
        case 'platform':
            this.drawPlatform({
                ...preview,
                type: preview.platformType
            });
            break;
            
        case 'enemy':
            this.drawEnemy({
                ...preview,
                type: preview.enemyType
            });
            break;
            
        case 'trap':
            this.drawTrap({
                ...preview,
                type: preview.trapType
            });
            break;
            
        case 'collectible':
            this.drawCollectible(preview);
            break;
            
        case 'puppy':
            this.drawPuppy(preview);
            break;
            
        case 'startPos':
            this.drawStartPosition(preview, preview.index || 0);
            break;
    }
    
    // Reset opacity
    ctx.globalAlpha = 1;
};

// Draw selection highlight and resize handles
editor.drawSelectionHighlight = function() {
    const ctx = editor.ctx;
    const obj = editor.state.selectedObject;
    
    if (!obj) return;
    
    // Draw selection rectangle
    ctx.strokeStyle = '#00f';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(obj.x - 5, obj.y - 5, 
                  (obj.width || 30) + 10, 
                  (obj.height || 30) + 10);
    ctx.setLineDash([]);
    
    // Draw resize handles if in resize mode
    if (editor.state.selectedTool === 'resize') {
        this.drawResizeHandles(obj);
    }
};

// Draw resize handles around selected object
editor.drawResizeHandles = function(obj) {
    const ctx = editor.ctx;
    const handleSize = 8;
    
    // Define handle positions
    const handles = [
        { name: 'topLeft', x: obj.x - handleSize/2, y: obj.y - handleSize/2 },
        { name: 'top', x: obj.x + (obj.width || 30)/2 - handleSize/2, y: obj.y - handleSize/2 },
        { name: 'topRight', x: obj.x + (obj.width || 30) - handleSize/2, y: obj.y - handleSize/2 },
        { name: 'right', x: obj.x + (obj.width || 30) - handleSize/2, y: obj.y + (obj.height || 30)/2 - handleSize/2 },
        { name: 'bottomRight', x: obj.x + (obj.width || 30) - handleSize/2, y: obj.y + (obj.height || 30) - handleSize/2 },
        { name: 'bottom', x: obj.x + (obj.width || 30)/2 - handleSize/2, y: obj.y + (obj.height || 30) - handleSize/2 },
        { name: 'bottomLeft', x: obj.x - handleSize/2, y: obj.y + (obj.height || 30) - handleSize/2 },
        { name: 'left', x: obj.x - handleSize/2, y: obj.y + (obj.height || 30)/2 - handleSize/2 }
    ];
    
    // Draw each handle
    handles.forEach(handle => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        
        ctx.strokeStyle = '#00f';
        ctx.lineWidth = 1;
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
};
