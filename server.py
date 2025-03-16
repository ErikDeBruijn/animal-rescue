#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory, abort
import os
import re
import json
import uuid
import time
import logging
import threading
import hashlib
import argparse
import sys
from pathlib import Path
from flask_socketio import SocketIO, emit, join_room, leave_room

# Configureer logging
LOG_FILE = 'server.log'
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Voeg een file handler toe
file_handler = logging.FileHandler(LOG_FILE)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

# Parse commando regel argumenten
parser = argparse.ArgumentParser(description='Dieren Redders Game Server')
parser.add_argument('--dev', action='store_true', help='Start in development mode met level editor')

# We gebruiken sys.argv om te controleren op --dev, want argparse kan conflicteren met Flask's command line parsing
dev_mode_flag = '--dev' in sys.argv

# Controleer ook op environment variable
dev_mode = dev_mode_flag or os.environ.get('DIERENREDDERS_DEV_MODE', '').lower() in ('true', '1', 'yes')

# We parse args alleen als ze nodig zijn voor andere flags
try:
    args = parser.parse_args()
except:
    # Bij conflicten met Flask argumenten, ignoreren we de parser error
    pass

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dieren-redders-secret-key'
app.config['DEV_MODE'] = dev_mode
socketio = SocketIO(app, cors_allowed_origins="*")

# Map met hash-waarden van assets voor het detecteren van wijzigingen
asset_hashes = {}
last_check_time = time.time()

# Dictionary om game rooms bij te houden
active_rooms = {}

# Clients die momenteel verbonden zijn
connected_clients = {}

# Directory waar de game bestanden staan
GAME_DIR = os.path.dirname(os.path.abspath(__file__))
LEVELS_FILE = os.path.join(GAME_DIR, 'levels.js')

# Lijst van bestanden die gemonitord moeten worden voor wijzigingen
MONITORED_FILES = [
    'index.html', 'editor.html', 'game.js', 'game-core.js', 'game-entities.js', 
    'game-rendering.js', 'game-controls.js', 'editor.js', 'levels.js'
]

@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    """Serveer de game zelf met dynamisch aangepaste content voor dev mode"""
    # Debug logging toevoegen
    app.logger.info(f"Serving index.html, DEV_MODE is: {app.config['DEV_MODE']}")
    
    # Lees de index.html file
    with open(os.path.join(GAME_DIR, 'index.html'), 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Pas de HTML-inhoud aan op basis van de development mode status
    if app.config['DEV_MODE']:
        # In development mode: toon de editor-link en admin toggle
        app.logger.info("Adding editor link and admin toggle to HTML (DEV MODE)")
        replacement = '<a href="editor" class="nav-link" id="editor-link">Level Editor</a>\n    <div class="admin-toggle" id="adminToggle">⚙️</div>'
        html_content = html_content.replace('<!-- DEV_MODE_PLACEHOLDER -->', replacement)
        
        # Debug check of de vervanging is gelukt
        if replacement in html_content:
            app.logger.info("Replacement successful - editor link added to HTML")
        else:
            app.logger.error("Replacement FAILED - placeholder not found in HTML!")
    else:
        # In productie mode: verberg de editor-link en admin toggle
        app.logger.info("Running in PRODUCTION mode, not adding editor link")
        html_content = html_content.replace(
            '<!-- DEV_MODE_PLACEHOLDER -->', 
            '<!-- Editor en admin controls zijn uitgeschakeld in productie modus -->'
        )
    
    # Stuur de aangepaste HTML terug
    response = app.response_class(
        response=html_content,
        status=200,
        mimetype='text/html'
    )
    return response

@app.route('/editor')
@app.route('/editor.html')
def editor():
    """Serveer de level editor alleen in dev mode"""
    if not app.config['DEV_MODE']:
        # Als niet in development mode, geef 404 error
        abort(404)
    return send_from_directory(GAME_DIR, 'editor.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serveer alle statische bestanden"""
    return send_from_directory(GAME_DIR, path)

@app.route('/api/levels', methods=['GET'])
def get_levels():
    """Haal de huidige levels op"""
    try:
        # Levels ophalen is altijd toegestaan (ook voor de game zelf)
        with open(LEVELS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            return jsonify({'success': True, 'content': content})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
        
@app.route('/api/levels/<int:level_index>', methods=['DELETE'])
def delete_level(level_index):
    """Verwijder een level - alleen in dev mode"""
    # Controleer of we in dev mode zijn
    if not app.config['DEV_MODE']:
        abort(404)
        
    """Verwijder een level"""
    try:
        logger.info(f"Verzoek om level {level_index} te verwijderen")
        
        # Lees het huidige levels.js bestand
        with open(LEVELS_FILE, 'r', encoding='utf-8') as f:
            current_content = f.read()
        
        # Maak een backup van het bestaande bestand
        with open(f"{LEVELS_FILE}.bak", 'w', encoding='utf-8') as f:
            f.write(current_content)
        
        # Extract alle levels
        match = re.search(r'\s*return\s*\[\s*([\s\S]*?)\s*\];', current_content)
        if not match:
            return jsonify({'success': False, 'error': 'Could not find levels array'}), 500
        
        levels_content = match.group(1)
        
        # Split op de accolades om levels te scheiden
        level_pattern = re.compile(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}')
        levels = [m.group(0) for m in level_pattern.finditer(levels_content)]
        
        # Controleer of de index geldig is
        if level_index < 0 or level_index >= len(levels):
            return jsonify({'success': False, 'error': f'Level index {level_index} is out of range (max: {len(levels)-1})'}), 400
        
        # Verwijder het level
        deleted_level = levels.pop(level_index)
        
        # Bouw de nieuwe inhoud op
        if levels:
            levels_string = ',\n        '.join(levels)
            new_content = re.sub(r'\s*return\s*\[\s*[\s\S]*?\s*\];', 
                            f'    return [\n        {levels_string}\n    ];', 
                            current_content)
        else:
            # Als er geen levels meer zijn, maak een lege array
            new_content = re.sub(r'\s*return\s*\[\s*[\s\S]*?\s*\];', 
                            '    return [];\n', 
                            current_content)
        
        # Schrijf de nieuwe inhoud naar het bestand
        with open(LEVELS_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        logger.info(f"Level {level_index} succesvol verwijderd!")
        return jsonify({'success': True})
    except Exception as e:
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/levels', methods=['POST'])
def save_levels():
    """Sla een nieuw level op - alleen in dev mode"""
    # Controleer of we in dev mode zijn
    if not app.config['DEV_MODE']:
        abort(404)
        
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
            
            # Als de index hoger is dan de beschikbare levels, voeg het toe als een nieuw level
            if level_index >= len(levels):
                logger.info(f"Level index {level_index} is buiten bereik (max: {len(levels)-1}), behandel als nieuw level")
                # Voeg een komma toe
                new_content = re.sub(r'(\s*)\];', f',\n        {level_code}\n\\1];', current_content)
                return jsonify({'success': True}), 200
            
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
        
        logger.info(f"Level {'nieuw' if level_index == 'new' else level_index} succesvol opgeslagen!")
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
    Alleen beschikbaar in dev mode
    """
    # Controleer of we in dev mode zijn
    if not app.config['DEV_MODE']:
        abort(404)
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

# Websocket endpoints voor multiplayer
@socketio.on('connect')
def handle_connect():
    """Verwerk een nieuwe verbinding"""
    client_id = request.sid
    print(f"Client verbonden: {client_id}")
    connected_clients[client_id] = {
        'id': client_id,
        'room': None,
        'username': None,
        'animal_type': None,
        'ready': False,
        'connected_at': time.time()
    }
    # Stuur een welkomstbericht met de client ID
    emit('welcome', {'client_id': client_id, 'active_rooms': get_public_rooms()})

@socketio.on('disconnect')
def handle_disconnect():
    """Verwerk een verbroken verbinding"""
    client_id = request.sid
    print(f"Client verbroken: {client_id}")
    
    # Controleer of de client in een kamer zat
    client_info = connected_clients.get(client_id)
    if client_info and client_info['room']:
        room_id = client_info['room']
        leave_game_room(client_id, room_id)
    
    # Verwijder de client uit verbonden clients
    if client_id in connected_clients:
        del connected_clients[client_id]

@socketio.on('create_room')
def handle_create_room(data):
    """Maak een nieuwe game kamer aan"""
    client_id = request.sid
    username = data.get('username', f"Speler_{client_id[:4]}")
    level = data.get('level', 0)
    max_players = data.get('max_players', 4)
    is_public = data.get('is_public', True)
    
    # Genereer een unieke room ID
    room_id = str(uuid.uuid4())[:8]
    
    # Maak de nieuwe kamer aan
    active_rooms[room_id] = {
        'id': room_id,
        'name': f"{username}'s Game",
        'host': client_id,
        'level': level,
        'max_players': max_players,
        'is_public': is_public,
        'players': {},
        'created_at': time.time(),
        'game_state': {
            'current_level': level,
            'puppy_saved': False,
            'game_over': False,
            'level_completed': False
        }
    }
    
    # Update de client met kamerinformatie
    connected_clients[client_id]['room'] = room_id
    connected_clients[client_id]['username'] = username
    connected_clients[client_id]['animal_type'] = 'SQUIRREL'  # Default animal
    connected_clients[client_id]['ready'] = True
    connected_clients[client_id]['host'] = True
    
    # Voeg de speler toe aan de kamer
    active_rooms[room_id]['players'][client_id] = {
        'id': client_id,
        'username': username,
        'animal_type': 'SQUIRREL',
        'ready': True,
        'host': True,
        'position': {'x': 50, 'y': 350},
        'velocity': {'x': 0, 'y': 0}
    }
    
    # Laat de client deelnemen aan de kamer voor socketio broadcasts
    join_room(room_id)
    
    # Stuur de kamerinformatie terug naar de client
    emit('room_created', {
        'room_id': room_id,
        'room_info': get_room_info(room_id)
    })
    
    # Broadcast dat er een nieuwe publieke kamer beschikbaar is
    if is_public:
        emit('room_list_update', {'active_rooms': get_public_rooms()}, broadcast=True)

@socketio.on('join_room')
def handle_join_room(data):
    """Verwerk een verzoek om bij een kamer aan te sluiten"""
    client_id = request.sid
    room_id = data.get('room_id')
    username = data.get('username', f"Speler_{client_id[:4]}")
    
    # Controleer of de kamer bestaat
    if room_id not in active_rooms:
        emit('error', {'message': 'Deze kamer bestaat niet'})
        return
    
    room = active_rooms[room_id]
    
    # Controleer of de kamer niet vol is
    if len(room['players']) >= room['max_players']:
        emit('error', {'message': 'Deze kamer is vol'})
        return
    
    # Update client info
    connected_clients[client_id]['room'] = room_id
    connected_clients[client_id]['username'] = username
    
    # Kies een diersoort die nog niet in gebruik is
    used_animals = [p['animal_type'] for p in room['players'].values()]
    available_animals = ['SQUIRREL', 'TURTLE', 'UNICORN']
    
    animal_type = next((a for a in available_animals if a not in used_animals), 'SQUIRREL')
    connected_clients[client_id]['animal_type'] = animal_type
    
    # Kies een startpositie
    pos_index = len(room['players']) % 2
    position = {'x': 50 + pos_index * 50, 'y': 350}
    
    # Voeg de speler toe aan de kamer
    room['players'][client_id] = {
        'id': client_id,
        'username': username,
        'animal_type': animal_type,
        'ready': False,
        'host': False,
        'position': position,
        'velocity': {'x': 0, 'y': 0}
    }
    
    # Laat de client deelnemen aan de kamer voor socketio broadcasts
    join_room(room_id)
    
    # Stuur de kamerinformatie terug naar de client
    emit('room_joined', {
        'room_id': room_id,
        'room_info': get_room_info(room_id),
        'player_info': room['players'][client_id]
    })
    
    # Informeer andere spelers in de kamer dat er een nieuwe speler is
    emit('player_joined', {
        'player': room['players'][client_id]
    }, room=room_id, include_self=False)

@socketio.on('leave_room')
def handle_leave_room(data):
    """Verwerk een verzoek om een kamer te verlaten"""
    client_id = request.sid
    room_id = data.get('room_id')
    
    if room_id and room_id in active_rooms:
        leave_game_room(client_id, room_id)
        emit('room_left', {'room_id': room_id})

@socketio.on('player_ready')
def handle_player_ready(data):
    """Verwerk een speler die aangeeft klaar te zijn om te beginnen"""
    client_id = request.sid
    ready = data.get('ready', True)
    
    client_info = connected_clients.get(client_id)
    if not client_info or not client_info['room']:
        return
    
    room_id = client_info['room']
    if room_id in active_rooms:
        room = active_rooms[room_id]
        if client_id in room['players']:
            room['players'][client_id]['ready'] = ready
            connected_clients[client_id]['ready'] = ready
            
            # Broadcast de status update naar alle spelers in de kamer
            emit('player_status_update', {
                'player_id': client_id,
                'ready': ready
            }, room=room_id)
            
            # Controleer of alle spelers klaar zijn om te beginnen
            all_ready = all(player['ready'] for player in room['players'].values())
            if all_ready and len(room['players']) > 0:
                # Start het spel als alle spelers klaar zijn
                emit('game_starting', {'room_id': room_id, 'countdown': 3}, room=room_id)

@socketio.on('player_input')
def handle_player_input(data):
    """Verwerk spelerinputs (toetsaanslagen)"""
    client_id = request.sid
    player_id = data.get('player_id', client_id)  # Default to client_id if not provided
    player_index = data.get('player_index', 0)
    keys = data.get('keys', {})
    animal_type = data.get('animal_type')
    
    client_info = connected_clients.get(client_id)
    if not client_info or not client_info['room']:
        return
    
    room_id = client_info['room']
    if room_id not in active_rooms:
        return
    
    room = active_rooms[room_id]
    if client_id not in room['players']:
        return
    
    player = room['players'][client_id]
    
    # Update de diersoort informatie
    if animal_type:
        player['animal_type'] = animal_type
        connected_clients[client_id]['animal_type'] = animal_type
    
    # Als de client input stuurt, sla dit op voor de host om te verwerken
    # Deze informatie wordt niet bewaard in de room state, maar doorgestuurd
    # naar de host om te verwerken (alleen de host doet de fysica berekeningen)
    
    # Zoek het hostID
    host_id = room['host']
    
    # Broadcast de input naar de host
    emit('remote_player_input', {
        'player_id': client_id,
        'player_index': player_index,
        'keys': keys
    }, room=host_id)  # Stuur alleen naar de host, niet naar andere spelers

@socketio.on('update_player')
def handle_update_player(data):
    """Verwerk spelerupdates voor positie, snelheid, etc."""
    client_id = request.sid
    position = data.get('position')
    velocity = data.get('velocity')
    animal_type = data.get('animal_type')
    
    client_info = connected_clients.get(client_id)
    if not client_info or not client_info['room']:
        return
    
    room_id = client_info['room']
    if room_id not in active_rooms:
        return
    
    room = active_rooms[room_id]
    if client_id not in room['players']:
        return
    
    # Alleen de host mag positie-updates verzenden
    # Als dit niet de host is, negeer de update
    if room['host'] != client_id:
        return
        
    player = room['players'][client_id]
    
    # Update de speler informatie
    if position:
        player['position'] = position
    if velocity:
        player['velocity'] = velocity
    if animal_type:
        player['animal_type'] = animal_type
        connected_clients[client_id]['animal_type'] = animal_type
    
    # Broadcast de update naar andere spelers
    emit('player_update', {
        'player_id': client_id,
        'position': player['position'],
        'velocity': player['velocity'],
        'animal_type': player['animal_type']
    }, room=room_id, include_self=False)

@socketio.on('update_game_state')
def handle_update_game_state(data):
    """Verwerk updates voor de game state zoals puppy rescued, level complete, etc."""
    client_id = request.sid
    
    client_info = connected_clients.get(client_id)
    if not client_info or not client_info['room']:
        return
    
    room_id = client_info['room']
    if room_id not in active_rooms:
        return
    
    room = active_rooms[room_id]
    
    # Controleer of dit de host is (alleen de host mag gamestate updaten)
    if room['host'] != client_id:
        return
    
    # Update de game state
    if 'puppy_saved' in data:
        room['game_state']['puppy_saved'] = data['puppy_saved']
    
    if 'game_over' in data:
        room['game_state']['game_over'] = data['game_over']
    
    if 'level_completed' in data:
        room['game_state']['level_completed'] = data['level_completed']
    
    if 'current_level' in data:
        room['game_state']['current_level'] = data['current_level']
        room['level'] = data['current_level']
    
    # Broadcast de gamestate update naar alle spelers
    emit('game_state_update', room['game_state'], room=room_id)

@socketio.on('get_rooms')
def handle_get_rooms():
    """Geef een lijst van beschikbare kamers"""
    emit('room_list', {'active_rooms': get_public_rooms()})

@socketio.on('chat_message')
def handle_chat_message(data):
    """Verwerk chat berichten tussen spelers"""
    client_id = request.sid
    message = data.get('message')
    room_id = data.get('room_id')
    
    if not message or not room_id or room_id not in active_rooms:
        return
    
    client_info = connected_clients.get(client_id)
    if not client_info:
        return
    
    username = client_info.get('username', f"Speler_{client_id[:4]}")
    
    # Broadcast het bericht naar alle spelers in de kamer
    emit('chat_message', {
        'sender_id': client_id,
        'sender_name': username,
        'message': message,
        'timestamp': time.time()
    }, room=room_id)

# Helper functies
def get_public_rooms():
    """Krijg een lijst van publieke kamers die andere spelers kunnen joinen"""
    public_rooms = []
    for room_id, room in active_rooms.items():
        if room['is_public'] and len(room['players']) < room['max_players']:
            public_rooms.append({
                'id': room_id,
                'name': room['name'],
                'host': room['host'],
                'level': room['level'],
                'player_count': len(room['players']),
                'max_players': room['max_players']
            })
    return public_rooms

def get_room_info(room_id):
    """Krijg gedetailleerde informatie over een specifieke kamer"""
    if room_id not in active_rooms:
        return None
    
    room = active_rooms[room_id]
    return {
        'id': room['id'],
        'name': room['name'],
        'host': room['host'],
        'level': room['level'],
        'max_players': room['max_players'],
        'is_public': room['is_public'],
        'players': room['players'],
        'game_state': room['game_state']
    }

def leave_game_room(client_id, room_id):
    """Verwerk een speler die een kamer verlaat"""
    if room_id not in active_rooms:
        return
    
    room = active_rooms[room_id]
    
    # Verwijder de speler uit de kamer
    if client_id in room['players']:
        del room['players'][client_id]
        
        # Update de client informatie
        if client_id in connected_clients:
            connected_clients[client_id]['room'] = None
        
        # Verlaat de kamer (socketio)
        leave_room(room_id)
        
        # Als de host vertrekt, kies een nieuwe host of sluit de kamer
        if client_id == room['host']:
            if room['players']:
                # Kies een nieuwe host
                new_host = next(iter(room['players']))
                room['host'] = new_host
                room['players'][new_host]['host'] = True
                
                # Informeer de spelers over de nieuwe host
                emit('new_host', {'host_id': new_host}, room=room_id)
            else:
                # Sluit de kamer als er geen spelers meer zijn
                del active_rooms[room_id]
                emit('room_list_update', {'active_rooms': get_public_rooms()}, broadcast=True)
                return
        
        # Informeer andere spelers dat deze speler is vertrokken
        emit('player_left', {'player_id': client_id}, room=room_id)
        
        # Update de publieke kamer lijst als dit een publieke kamer is
        if room['is_public']:
            emit('room_list_update', {'active_rooms': get_public_rooms()}, broadcast=True)

# Cleanup taak die draait als een thread om inactieve kamers op te ruimen
def cleanup_inactive_rooms():
    """Verwijder kamers die inactief zijn (geen spelers of te lang inactief)"""
    while True:
        current_time = time.time()
        rooms_to_remove = []
        
        for room_id, room in active_rooms.items():
            # Verwijder kamers zonder spelers die ouder zijn dan 5 minuten
            if not room['players'] and (current_time - room['created_at']) > 300:
                rooms_to_remove.append(room_id)
        
        # Verwijder de inactieve kamers
        for room_id in rooms_to_remove:
            del active_rooms[room_id]
        
        # Als er kamers zijn verwijderd, update de kamerlijst
        if rooms_to_remove:
            socketio.emit('room_list_update', {'active_rooms': get_public_rooms()}, broadcast=True)
        
        # Wacht 60 seconden voor de volgende check
        time.sleep(60)

def calculate_file_hash(file_path):
    """Bereken een hash voor een bestand om wijzigingen te detecteren"""
    try:
        with open(file_path, 'rb') as f:
            file_content = f.read()
            return hashlib.md5(file_content).hexdigest()
    except Exception as e:
        logger.error(f"Fout bij berekenen hash voor {file_path}: {str(e)}")
        return None

def init_file_hashes():
    """Initialiseer de hash-waarden voor alle gemonitorde bestanden"""
    global asset_hashes
    for filename in MONITORED_FILES:
        file_path = os.path.join(GAME_DIR, filename)
        if os.path.exists(file_path):
            asset_hashes[filename] = calculate_file_hash(file_path)
            logger.info(f"Monitoring {filename} (hash: {asset_hashes[filename][:8]}...)")
    
    logger.info(f"Monitoring {len(asset_hashes)} bestanden voor wijzigingen")

def check_for_file_changes():
    """Controleer of gemonitorde bestanden zijn gewijzigd"""
    global asset_hashes, last_check_time
    
    # Controleer niet te vaak (max eens per 5 seconden)
    current_time = time.time()
    if current_time - last_check_time < 5:
        return False
    
    last_check_time = current_time
    changes_detected = False
    
    for filename in MONITORED_FILES:
        file_path = os.path.join(GAME_DIR, filename)
        if not os.path.exists(file_path):
            continue
            
        current_hash = calculate_file_hash(file_path)
        if filename in asset_hashes and asset_hashes[filename] != current_hash:
            logger.info(f"Wijziging gedetecteerd in {filename}")
            asset_hashes[filename] = current_hash
            changes_detected = True
    
    return changes_detected

def file_monitor_thread():
    """Achtergrondthread om bestanden te monitoren op wijzigingen"""
    logger.info("File monitor thread started")
    while True:
        try:
            if check_for_file_changes():
                # Stuur een bericht naar alle clients
                try:
                    # Log welk bestand er gewijzigd is
                    modified_files = []
                    for filename in MONITORED_FILES:
                        file_path = os.path.join(GAME_DIR, filename)
                        if not os.path.exists(file_path):
                            continue
                            
                        current_hash = calculate_file_hash(file_path)
                        if filename in asset_hashes and asset_hashes[filename] != current_hash:
                            modified_files.append(filename)
                            
                    logger.info(f"Sending reload signal to all clients for changes in: {', '.join(modified_files)}")
                    socketio.emit('reload_needed', {
                        'message': 'Er zijn updates beschikbaar. Het spel moet opnieuw geladen worden.',
                        'timestamp': time.time(),
                        'modified_files': modified_files
                    })
                    logger.info("Reload signal sent successfully")
                except Exception as emit_error:
                    logger.error(f"Error sending reload signal: {str(emit_error)}")
            
            # Wacht 5 seconden voor de volgende check
            time.sleep(5)
        except Exception as e:
            logger.error(f"Error in file monitor thread: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            time.sleep(10)  # Wacht langer bij een fout

def run_server_with_auto_reload():
    """Start de server met automatische herstart bij code wijzigingen"""
    import socket
    import sys
    
    # Start de cleanup thread
    cleanup_thread = threading.Thread(target=cleanup_inactive_rooms, daemon=True)
    cleanup_thread.start()
    
    # Initialiseer file hashes
    init_file_hashes()
    
    # Start de file monitor thread
    monitor_thread = threading.Thread(target=file_monitor_thread, daemon=True)
    monitor_thread.start()
    
    # Bepaal het lokale IP adres automatisch
    hostname = socket.gethostname()
    try:
        ip = socket.gethostbyname(hostname)
    except:
        ip = '127.0.0.1'  # Fallback op localhost
    
    # Gebruik een andere poort (5050 in plaats van 5000)
    port = 5050
    
    logger.info(f"Starting Dieren Redders multiplayer game server on http://{ip}:{port}")
    
    # Toon level editor info alleen in dev mode
    if app.config['DEV_MODE']:
        logger.info(f"DEVELOPMENT MODE: Level editor available at http://{ip}:{port}/editor")
        # Extra debug logging om te zien hoe dev mode is ingeschakeld
        if dev_mode_flag:
            logger.info("Development mode ingeschakeld via --dev flag")
        elif os.environ.get('DIERENREDDERS_DEV_MODE'):
            logger.info(f"Development mode ingeschakeld via DIERENREDDERS_DEV_MODE environment variable (value: {os.environ.get('DIERENREDDERS_DEV_MODE')})")
    else:
        logger.info(f"PRODUCTION MODE: Level editor disabled. Start with --dev flag to enable editor.")
    
    logger.info(f"Spelers in hetzelfde netwerk kunnen verbinden via dit IP adres")
    logger.info(f"Je kunt ook altijd localhost gebruiken: http://localhost:{port}")
    
    # Start de socketio server met auto-reload voor code wijzigingen
    try:
        # In dev mode gebruiken we reloader, maar in productie niet
        use_reloader = app.config['DEV_MODE']
        debug_mode = app.config['DEV_MODE']
        
        socketio.run(app, host='0.0.0.0', port=port, debug=debug_mode, 
                    use_reloader=use_reloader,
                    allow_unsafe_werkzeug=debug_mode)
    except KeyboardInterrupt:
        logger.info("Server gestopt door gebruiker")
        sys.exit(0)

if __name__ == '__main__':
    run_server_with_auto_reload()