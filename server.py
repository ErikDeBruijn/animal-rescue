#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
import os
import re
import json

app = Flask(__name__)

# Directory waar de game bestanden staan
GAME_DIR = os.path.dirname(os.path.abspath(__file__))
LEVELS_FILE = os.path.join(GAME_DIR, 'levels.js')

@app.route('/')
def index():
    """Serveer de game zelf"""
    return send_from_directory(GAME_DIR, 'index.html')

@app.route('/editor')
def editor():
    """Serveer de level editor"""
    return send_from_directory(GAME_DIR, 'editor.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serveer alle statische bestanden"""
    return send_from_directory(GAME_DIR, path)

@app.route('/api/levels', methods=['GET'])
def get_levels():
    """Haal de huidige levels op"""
    try:
        with open(LEVELS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            return jsonify({'success': True, 'content': content})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/levels', methods=['POST'])
def save_levels():
    """Sla een nieuw level op"""
    try:
        data = request.json
        if not data or 'levelIndex' not in data or 'levelCode' not in data:
            return jsonify({'success': False, 'error': 'Missing level data'}), 400
        
        level_index = data['levelIndex']
        level_code = data['levelCode']
        
        # Zorg ervoor dat de level code geldig is
        if not level_code or not level_code.strip():
            return jsonify({'success': False, 'error': 'Level code is empty'}), 400
        
        # Controleer of de level code een geldig JSON-object is
        try:
            # Voorkom mogelijke code-injectie door te controleren op vreemde patronen
            if re.search(r'(eval|require|import|process|global|window|document|fetch|\bjs\b|\bscript\b)', level_code, re.IGNORECASE):
                return jsonify({'success': False, 'error': 'Level code contains potentially unsafe patterns'}), 400
        except Exception as e:
            return jsonify({'success': False, 'error': f'Invalid level code: {str(e)}'}), 400
        
        # Lees het huidige levels.js bestand
        with open(LEVELS_FILE, 'r', encoding='utf-8') as f:
            current_content = f.read()
        
        # Maak een backup van het bestaande bestand
        with open(f"{LEVELS_FILE}.bak", 'w', encoding='utf-8') as f:
            f.write(current_content)
        
        # Als level_index == 'new', voeg dan een nieuw level toe
        if level_index == 'new':
            # Zoek het einde van de levels array
            match = re.search(r'\s*return\s*\[\s*([\s\S]*?)\s*\];', current_content)
            if not match:
                return jsonify({'success': False, 'error': 'Could not find levels array'}), 500
            
            levels_content = match.group(1)
            
            # Als er al levels zijn, voeg een komma toe
            if levels_content.strip():
                new_content = re.sub(r'(\s*)\];', f',\n        {level_code}\n\\1];', current_content)
            else:
                new_content = re.sub(r'\[\s*\];', f'[\n        {level_code}\n    ];', current_content)
        else:
            # Vervang een bestaand level
            try:
                level_index = int(level_index)
            except ValueError:
                return jsonify({'success': False, 'error': f'Invalid level index: {level_index}'}), 400
            
            # Extract alle levels
            match = re.search(r'\s*return\s*\[\s*([\s\S]*?)\s*\];', current_content)
            if not match:
                return jsonify({'success': False, 'error': 'Could not find levels array'}), 500
            
            levels_content = match.group(1)
            
            # Split op de accolades om levels te scheiden
            level_pattern = re.compile(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}')
            levels = [m.group(0) for m in level_pattern.finditer(levels_content)]
            
            if level_index >= len(levels):
                return jsonify({'success': False, 'error': f'Level index {level_index} is out of range (max: {len(levels)-1})'}), 400
            
            # Vervang het level
            levels[level_index] = level_code
            
            # Bouw de nieuwe inhoud op
            levels_string = ',\n        '.join(levels)
            new_content = re.sub(r'\s*return\s*\[\s*[\s\S]*?\s*\];', 
                                f'    return [\n        {levels_string}\n    ];', 
                                current_content)
        
        # Schrijf de nieuwe inhoud naar het bestand
        with open(LEVELS_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Level {'nieuw' if level_index == 'new' else level_index} succesvol opgeslagen!")
        return jsonify({'success': True})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/add-save-functionality', methods=['GET'])
def add_save_functionality():
    """
    Voeg code toe aan editor.js om levels op te slaan via de server API
    Dit is een handige helper functie voor als de editor.js nog geen save functionaliteit heeft
    """
    try:
        EDITOR_JS = os.path.join(GAME_DIR, 'editor.js')
        
        with open(EDITOR_JS, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Zoek de save-level-btn event listener
        if 'document.getElementById(\'save-level-btn\').addEventListener(\'click\'' not in content:
            return jsonify({'success': False, 'error': 'Could not find save button listener'}), 500
        
        # Controleer of de save functionaliteit al is toegevoegd
        if 'fetch(\'/api/levels\'' in content:
            return jsonify({'success': True, 'message': 'Save functionality already added'})
        
        # Vervang de lege event listener met code die de API aanroept
        new_content = content.replace(
            'document.getElementById(\'save-level-btn\').addEventListener(\'click\', function() {\n' +
            '    });',
            """document.getElementById('save-level-btn').addEventListener('click', function() {
        saveLevelToServer();
    });
    
// Functie om levels op te slaan naar de server
function saveLevelToServer() {
    const levelIndex = editorState.currentLevel;
    const levelCode = document.getElementById('export-code').textContent;
    
    if (!levelCode) {
        exportLevelCode(); // Generate the code first if it doesn't exist
    }
    
    // Stuur het level naar de server
    fetch('/api/levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            levelIndex: levelIndex,
            levelCode: document.getElementById('export-code').textContent
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Level succesvol opgeslagen!');
            // Ververs de pagina om het nieuwe level te laden
            if (levelIndex === 'new') {
                window.location.reload();
            }
        } else {
            alert('Fout bij het opslaan van het level: ' + data.error);
        }
    })
    .catch((error) => {
        alert('Fout bij het opslaan van het level: ' + error);
    });
}"""
        )
        
        # Schrijf de nieuwe inhoud naar het bestand
        with open(EDITOR_JS, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return jsonify({'success': True, 'message': 'Save functionality added to editor.js'})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    ip = '10.1.1.236'
    print(f"Starting Dieren Redders game server on http://{ip}:5000")
    print(f"Level editor available at http://{ip}:5000/editor")
    print("Om toegang vanaf je lokale netwerk toe te staan, pas de host aan naar je lokale IP adres")
    app.run(host=ip, port=5000, debug=True)